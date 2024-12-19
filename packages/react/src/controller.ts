import { Application } from './app';
import { Middleware, toQueryString } from './types';
import { PathFunction, compile, match, MatchFunction } from 'path-to-regexp';
import { Exception } from './exception';

export class Controller<P extends string = any, Q extends string = any> {
  private _toPath: PathFunction<Record<P, string>>;
  private _toMatch: MatchFunction<Record<Q, string>>;
  constructor(public readonly middlewares: Middleware<P, Q>[]) { }

  public initialize(app: Application, path: string) {
    path = path.replace(/\[(.*?)\]/g, ':$1');
    this._toPath = compile(path);
    this._toMatch = match(path);
    app.on(path, () => this);
    return () => app.off(path);
  }

  public path(params?: Record<P, string>) {
    if (!this._toPath) throw new Exception(500, '路由未初始化');
    let url = this._toPath(params);
    const toString = () => url;
    const query = (q: Record<Q, string>) => {
      url += toQueryString(q);
      return {
        toString,
      }
    }

    return {
      toString,
      query,
    }
  }

  public match(path: string) {
    if (!this._toMatch) throw new Exception(500, '路由未初始化');
    return this._toMatch(path);
  }
}

export function defineController<
  P extends string = any,
  Q extends string = any
>(...middlewares: Middleware<P, Q>[]): Controller<P, Q> {
  const controller = new Controller<P, Q>(middlewares);

  return controller;
}