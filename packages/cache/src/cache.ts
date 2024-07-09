import CacheServer from './index';
import { Component } from '@braken/injection';
import { compile, PathFunction } from 'path-to-regexp';
import { CacheResult } from './types';

const CompileContainer = new Map<Function, PathFunction<object>>();

@Component.Injectable
export abstract class Cache<T extends object = {}> extends Component {
  public abstract execute<R = any>(params: T): CacheResult<R> | Promise<CacheResult<R>>;

  @Component.Inject(CacheServer)
  protected readonly $server: CacheServer;

  static Path(value: string): ClassDecorator {
    return target => {
      const fn = compile(value, { encode: encodeURIComponent });
      CompileContainer.set(target, fn);
    }
  }

  private getConstructor() {
    const target = Object.getPrototypeOf(this);
    if (!CompileContainer.has(target)) {
      throw new Error('Missing `Cache.Path()`');
    }
    return target;
  }

  public async $write<R = any>(params: T) {
    const target = this.getConstructor();
    if (!CompileContainer.has(target)) {
      throw new Error('invaild cache target');
    }
    const fn: PathFunction<T> = CompileContainer.get(target);
    const key = fn(params);
    const { value, expire } = await Promise.resolve(this.execute<R>(params));
    await this.$server.write(key, value, expire);
    return value;
  }

  public async $read(params: T) {
    const target = this.getConstructor();
    if (!CompileContainer.has(target)) {
      throw new Error('invaild cache target');
    }
    const fn: PathFunction<T> = CompileContainer.get(target);
    const key = fn(params);
    const index = await this.$server.find(key);
    if (index === -1) return this.$write(params);
    const current = this.$server.get(index);
    const value = await Promise.resolve(current.read(key));
    const expire = await Promise.resolve(current.expire(key));
    await this.$server.rewrite(key, value, expire, index);
    return value;
  }

  public async $delete(params: T) {
    const target = this.getConstructor();
    if (!CompileContainer.has(target)) {
      throw new Error('invaild cache target');
    }
    const fn: PathFunction<T> = CompileContainer.get(target);
    const key = fn(params);
    await Promise.resolve(this.$server.delete(key));
  }
}