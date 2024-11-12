import { CacheServer } from './app';
import { Component } from '@braken/injection';
import { compile, PathFunction } from 'path-to-regexp';
import { CacheResult } from './types';

const CompileContainer = new Map<Function, PathFunction<object>>();

@Component.Injectable
export abstract class Cache<R = any, T extends object = object> extends Component {
  public abstract execute(params: T): CacheResult<R> | Promise<CacheResult<R>>;

  private readonly ErrorExpire = 30 * 60;

  @Component.Inject(CacheServer)
  protected readonly $server: CacheServer;

  static Path(value: string): ClassDecorator {
    return target => {
      const fn = compile(value, { encode: encodeURIComponent });
      CompileContainer.set(target, fn);
    }
  }

  private getConstructor() {
    const target = Object.getPrototypeOf(this).constructor;
    if (!CompileContainer.has(target)) {
      throw new Error('Missing `Cache.Path()`');
    }
    return target;
  }

  private transformPathParams(obj: T): T {
    const o: Partial<Record<keyof T, string>> = {}
    for (const key in obj) {
      o[key] = obj[key] + '';
    }
    return o as T;
  }

  public async $write(params?: T): Promise<R> {
    const target = this.getConstructor();
    if (!CompileContainer.has(target)) {
      throw new Error('invaild cache target');
    }
    const fn: PathFunction<T> = CompileContainer.get(target);
    const key = fn(this.transformPathParams(params));
    try {
      const { value, expire } = await Promise.resolve(this.execute(params));
      await this.$server.write(key, value, expire);
      return value;
    } catch (e) {
      await this.$server.write(key, {
        $__error__$: e.message,
      }, this.ErrorExpire);
      throw e;
    }
  }

  public async $read(params?: T): Promise<R> {
    const target = this.getConstructor();
    if (!CompileContainer.has(target)) {
      throw new Error('invaild cache target');
    }
    const fn: PathFunction<T> = CompileContainer.get(target);
    const key = fn(this.transformPathParams(params));
    const index = await this.$server.find(key);
    if (index === -1) return this.$write(params);
    const current = this.$server.get<R>(index);
    const value = await Promise.resolve(current.read(key));
    // @ts-ignore
    if (value?.$__error__$) {
      // @ts-ignore
      throw new Error(value.$__error__$);
    }
    const expire = await Promise.resolve(current.expire(key));
    await this.$server.rewrite(key, value, expire, index);
    return value;
  }

  public async $delete(params?: T) {
    const target = this.getConstructor();
    if (!CompileContainer.has(target)) {
      throw new Error('invaild cache target');
    }
    const fn: PathFunction<T> = CompileContainer.get(target);
    const key = fn(this.transformPathParams(params));
    await Promise.resolve(this.$server.delete(key));
  }
}