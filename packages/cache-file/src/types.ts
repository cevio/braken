export interface FileCacheStack<T = any> {
  value: T,
  expire: number,
  file: string,
}