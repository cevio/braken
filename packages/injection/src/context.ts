import { NS, container } from "./decroators";
import { IClass, IHookCallback, InjectAcceptType } from './types';
import { Component } from './component';

export class Context extends Map {
  private readonly cache = new Map<InjectAcceptType, any>();
  private readonly pending = new Map<InjectAcceptType, Array<[(value: unknown) => void, (reason?: any) => void]>>();
  private readonly hooks = new Map<string | symbol, IHookCallback>();

  private _parent: Context = null;

  public setParent(c: Context) {
    this._parent = c;
    return this;
  }

  public hook(key: string | symbol, callback: IHookCallback) {
    this.hooks.set(key, callback);
    return this;
  }

  private resolveUsable(clazz: InjectAcceptType, res: any) {
    const pending = this.pending.get(clazz);
    for (let i = 0; i < pending.length; i++) {
      const [resolve] = pending[i];
      resolve(res);
    }
  }

  private rejectUseable(clazz: InjectAcceptType, e: any) {
    const pending = this.pending.get(clazz);
    for (let i = 0; i < pending.length; i++) {
      const [, reject] = pending[i];
      reject(e);
    }
  }

  private useMemo<R extends Component, T extends InjectAcceptType<R>>(clazz: T): T extends IClass<infer U> ? U : R {
    if (this.cache.has(clazz)) {
      return this.cache.get(clazz);
    }
    let current: Context = this;
    while (current._parent) {
      if (current._parent.hasCache(clazz)) {
        return current._parent.getCache(clazz)
      } else {
        current = current._parent;
      }
    }
  }

  public use<R extends Component, T extends InjectAcceptType<R>>(clazz: T): Promise<T extends IClass<infer U> ? U : R> {
    const memo = this.useMemo<R, T>(clazz);
    if (memo) return Promise.resolve(memo);
    if (typeof clazz !== 'function') {
      if (!this.hooks.has(clazz)) {
        throw new Error('Invalid hook name `' + clazz.toString() + '`, you should provide it as a hook first.')
      }

      if (this.pending.has(clazz)) {
        const pending = this.pending.get(clazz);
        return new Promise((resolve, reject) => {
          pending.push([resolve, reject]);
        })
      }
      this.pending.set(clazz, []);
      const callback = this.hooks.get(clazz);
      return Promise.resolve(callback(this))
        .then(res => {
          this.resolveUsable(clazz, res);
          this.cache.set(clazz, res);
          return res;
        })
        .catch(e => {
          this.rejectUseable(clazz, e);
          throw e;
        })
        .finally(() => this.pending.delete(clazz));
    }

    if (this.pending.has(clazz)) {
      // 加入到等待队列
      const pending = this.pending.get(clazz);
      return new Promise((resolve, reject) => {
        pending.push([resolve, reject]);
      })
    } else {
      this.pending.set(clazz, []);
      return new Promise((resolve, reject) => {
        this.load(clazz)
          .then(async ({ callbacks, injections }) => {
            const init = (target: Component) => {
              // 循环注入依赖
              for (let i = 0; i < injections.length; i++) {
                const { key, value } = injections[i];
                Object.defineProperty(target, key, {
                  // 每次都通过 `getter` 拿，保证对象为最新值
                  // 修改对象方法为改变缓存对象
                  get: () => this.cache.get(value),
                })
              }
            }

            // 实例化
            // @ts-ignore
            const current = new clazz(this, init);

            // 执行 injectable 方法
            for (let i = 0; i < callbacks.length; i++) {
              const { callback, target } = callbacks[i];
              await Promise.resolve(callback(current, target));
            }

            return current;
          })

          // 处理其他等待的依赖
          .then(result => {
            this.resolveUsable(clazz, result);
            // @ts-ignore
            resolve(result);
            this.cache.set(clazz, result);
          })

          // 容错处理
          .catch(e => {
            this.rejectUseable(clazz, e);
            reject(e);
          })
          .finally(() => this.pending.delete(clazz));
      })
    }
  }

  /**
   * load callbacks and injections
   * @param clazz 
   * @returns 
   */
  private async load(clazz: Function) {
    const target = Object.getPrototypeOf(clazz);
    type IProperty = {
      callbacks: { target: Function, callback: Function }[],
      injections: { key: string | symbol, value: any }[],
    }
    const properties: IProperty = {
      callbacks: [],
      injections: [],
    };
    if (target && container.has(target)) {
      const { callbacks, injections } = await this.load(target);
      properties.injections.push(...injections);
      properties.callbacks.push(...callbacks);
    }
    if (container.has(clazz)) {
      const meta = container.get(clazz);
      if (meta.has(NS.INJECT)) {
        const child: Map<string | symbol, InjectAcceptType> = meta.get(NS.INJECT);
        for (const [key, value] of child.entries()) {
          await this.use(value);
          properties.injections.push({ key, value });
        }
      }
      if (meta.has(NS.INJECTABLE)) {
        const callback = meta.get(NS.INJECTABLE);
        if (typeof callback === 'function') {
          properties.callbacks.push({
            target: clazz,
            callback,
          });
        }
      }
    }
    return properties;
  }

  public addCache(key: InjectAcceptType, value: any) {
    this.cache.set(key, value);
    return this;
  }

  public getCache(key: InjectAcceptType) {
    return this.cache.get(key);
  }

  public hasCache(key: InjectAcceptType) {
    return this.cache.has(key);
  }

  public delCache(key: InjectAcceptType) {
    return this.cache.delete(key);
  }

  public addHook(key: string | symbol, value: (ctx: this) => unknown | Promise<unknown>) {
    this.hooks.set(key, value);
    return this;
  }

  public hasHook(key: string | symbol) {
    return this.hooks.has(key);
  }

  public delHook(key: string | symbol) {
    return this.hooks.delete(key);
  }

  public mergeTo(ctx: Context) {
    ctx.setParent(this);
    return ctx;
  }

  public mergeFrom(ctx: Context) {
    this.setParent(ctx);
    return ctx;
  }
}