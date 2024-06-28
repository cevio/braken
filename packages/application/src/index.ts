import { Component, injectable } from "@braken/injection";
import { EffectCallback, Terminater } from "./types";
import { EventEmitter } from 'node:events';

const terminates = new Set<Application>();
const events = new Map<Function, Map<string | symbol, Function>>();
const states = new Map<Function, Set<string | symbol>>();
const watches = new Map<Function, Map<string | symbol, Function>>();

export const ApplicationConfigs = new Map();
export * from './types';

@Component.Injectable
export abstract class Application extends Component {
  public readonly $event = new EventEmitter();
  public abstract initialize(): Terminater;
  public $terminate?: EffectCallback;
  public $terminated = false;
  public async $end() {
    if (this.$terminate) {
      await Promise.resolve(this.$terminate());
    }
  }

  public $emit<T extends keyof this>(key: T, ...args: any[]) {
    this.$event.emit(key as string | symbol, ...args);
  }

  static readonly Injectable = injectable(async (component: Application, clazz) => {
    if (typeof component.initialize === 'function') {
      if (events.has(clazz)) {
        const map = events.get(clazz);
        for (const [key, value] of map.entries()) {
          // 重建目标事件
          component.$event.on(key, (...args: any[]) => {
            // 组件未销毁触发
            if (!component.$terminated) {
              value.bind(component)(...args);
            }
          });
        }
      }
      if (states.has(clazz)) {
        const set = states.get(clazz);
        const watcher = watches.has(clazz) ? watches.get(clazz) : null;
        for (const key of set.values()) {
          // @ts-ignore
          let defaultValue = component[key];
          Object.defineProperty(component, key, {
            get: () => defaultValue,
            set: (val: any) => {
              if (!component.$terminated) {
                const oldValue = defaultValue;
                defaultValue = val;
                if (watcher?.has(key)) {
                  const fn = watcher.get(key);
                  fn.bind(component)(defaultValue, oldValue);
                }
              }
            }
          })
        }
      }
      const terminate = await Promise.resolve(component.initialize());
      if (typeof terminate === 'function') {
        component.$terminate = async () => {
          component.$event.removeAllListeners();
          await terminate();
          terminates.delete(component);
          component.$terminated = true;
          if (component.$ctx.hasCache(clazz)) {
            component.$ctx.delCache(clazz);
          }
        }
        // 冻结 防修改
        Object.freeze(component.$terminate);
        terminates.add(component);
      }
    }
  })

  static Terminate() {
    return Promise.all(
      Array.from(terminates.values())
        .map(app => app.$end())
    );
  }

  static readonly Event: MethodDecorator = (target, property, descriptor) => {
    const clazz = target.constructor;
    if (!events.has(clazz)) {
      events.set(clazz, new Map());
    }
    const map = events.get(clazz);
    map.set(property, descriptor.value as Function);
  }

  static readonly State: PropertyDecorator = (target, property) => {
    const clazz = target.constructor;
    if (!states.has(clazz)) {
      states.set(clazz, new Set());
    }
    const set = states.get(clazz);
    set.add(property);
  }

  static Watch(key: string | symbol): MethodDecorator {
    return (target, property, descriptor) => {
      const clazz = target.constructor;
      if (!watches.has(clazz)) {
        watches.set(clazz, new Map());
      }
      const map = watches.get(clazz);
      map.set(key, descriptor.value as Function);
    }
  }
}