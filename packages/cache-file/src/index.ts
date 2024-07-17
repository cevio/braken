import fse from 'fs-extra';
import { CacheProps } from '@braken/cache';
import { Application, ApplicationConfigs } from '@braken/application';
import { FileCacheStack } from './types';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { glob } from 'glob';
const require = createRequire(import.meta.url);
const { ensureDir, writeFile, exists, unlink } = fse;

export * from './types';

@Application.Injectable
export default class FileCache extends Application implements CacheProps {
  private directory: string;
  private readonly stacks = new Map<string, FileCacheStack>();
  static readonly namespace = Symbol('cache:file');
  static set(directory: string) {
    ApplicationConfigs.set(FileCache.namespace, directory);
  }

  public async initialize() {
    if (!ApplicationConfigs.has(FileCache.namespace)) {
      throw new Error('Missing FileCache.set(directory: string)');
    }

    // 确保文件夹存在
    this.directory = ApplicationConfigs.get(FileCache.namespace);
    await ensureDir(this.directory);

    // 遍历缓存文件夹下所有文件
    const files = await glob(`**/*.json`, { cwd: this.directory });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = resolve(this.directory, file);
      const key = file.startsWith('/') ? file : '/' + file;
      const { value, expire } = require(path);
      this.stacks.set(key, { value, expire, file: path });
    }

    // 监听数据的过期时间
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [key, { expire, file }] of this.stacks.entries()) {
        if (now >= expire) {
          this.stacks.delete(key);
          unlink(file);
          if (!!require.cache[file]) {
            delete require.cache[file];
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }

  private formatFilePathName(path: string) {
    return resolve(this.directory, path.startsWith('/') ? '.' + path : path);
  }

  private async writeFile(key: string, value: any, expire: number = 0) {
    const filePath = this.formatFilePathName(key + '.json');
    const text = JSON.stringify({ value, expire });
    const dir = dirname(filePath);
    await ensureDir(dir);
    await writeFile(filePath, text, 'utf8');
    return filePath;
  }

  public async write(key: string, value: any, time: number = 0) {
    if (!this.stacks.has(key)) {
      const file = await this.writeFile(key, value, time);
      this.stacks.set(key, {
        value,
        expire: time,
        file,
      });
    } else {
      const current = this.stacks.get(key);
      if (await exists(current.file)) {
        await unlink(current.file);
      }
      const file = await this.writeFile(key, value, time);
      current.file = file;
      current.value = value;
      current.expire = time;
    }

    return value;
  }

  public has(key: string) {
    return this.stacks.has(key);
  }

  public async read(key: string) {
    return this.stacks.get(key).value;
  }

  public expire(key: string) {
    return this.stacks.get(key).expire;
  }

  public async delete(key: string) {
    const file = this.stacks.get(key).file;
    if (await exists(file)) {
      await unlink(file);
    }
    this.stacks.delete(key);
    if (!!require.cache[file]) {
      delete require.cache[file];
    }
  }
}