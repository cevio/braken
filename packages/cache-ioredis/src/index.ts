import IORedis from '@braken/ioredis';
import { CacheProps } from '@braken/cache';
import { Application } from '@braken/application';
import { formatPathKey } from './utils';

@Application.Injectable
export default class IORedisCache extends Application implements CacheProps {

  @Application.Inject(IORedis)
  private readonly redis: IORedis;

  public initialize() { }

  public async write(key: string, value: any, time: number = 0) {
    const path = formatPathKey(key);
    if (!time) {
      await this.redis.connection.set(path, JSON.stringify(value));
    } else {
      const expire = Math.floor((time - Date.now()) / 1000);
      await this.redis.connection.setex(path, expire, JSON.stringify(value));
    }
  }

  public async read(key: string) {
    const path = formatPathKey(key);
    const text = await this.redis.connection.get(path);
    return JSON.parse(text);
  }

  public async expire(key: string) {
    const path = formatPathKey(key);
    const sec = await this.redis.connection.ttl(path);
    return sec * 1000 + Date.now();
  }

  public async delete(key: string) {
    const path = formatPathKey(key);
    await this.redis.connection.del(path);
  }

  public async has(key: string) {
    const path = formatPathKey(key);
    return Boolean(await this.redis.connection.exists(path));
  }
}