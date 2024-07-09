export interface CacheProps {
  write(key: string, value: any, time?: number/*时间戳*/): unknown | Promise<unknown>;
  has(key: string): boolean | Promise<Boolean>;
  read<T>(key: string): T | Promise<T>;
  expire(key: string): number | Promise<number>; // 时间戳
  delete(key: string): void | Promise<void>
}

export interface CacheResult<R> {
  value: R,
  expire?: number
}