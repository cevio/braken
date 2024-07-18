import { Application, ApplicationConfigs } from '@braken/application';
import { CacheProps } from './types';

@Application.Injectable
export class CacheServer extends Application {
  static readonly namespace = Symbol('cache');

  static set(props: CacheProps[]) {
    ApplicationConfigs.set(CacheServer.namespace, props);
  }

  private stacks: CacheProps[];
  public initialize() {
    if (!ApplicationConfigs.has(CacheServer.namespace)) {
      throw new Error('Missing cache configs, you should provider some props by `Cache.namespace` first');
    }
    this.stacks = ApplicationConfigs.get(CacheServer.namespace);
    Object.freeze(this.stacks);
  }

  public async write(key: string, value: any, expire?: number) {
    let i = this.stacks.length;
    while (i--) {
      const current = this.stacks[i];
      await Promise.resolve(current.write(key, value, expire));
    }
  }

  public async find(key: string) {
    let index = -1;
    for (let i = 0; i < this.stacks.length; i++) {
      const current = this.stacks[i];
      const has = await current.has(key);
      if (has) {
        index = i;
        break;
      }
    }
    return index;
  }

  public get<T = any>(index: number): CacheProps<T> {
    return this.stacks[index];
  }

  public async rewrite(key: string, value: any, expire: number, i: number) {
    while (i--) {
      const current = this.stacks[i];
      await Promise.resolve(current.write(key, value, expire));
    }
  }

  public async delete(key: string) {
    let i = this.stacks.length;
    while (i--) {
      const current = this.stacks[i];
      if (await Promise.resolve(current.has(key))) {
        await Promise.resolve(current.delete(key));
      }
    }
  }
}