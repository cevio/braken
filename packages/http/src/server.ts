import compose from 'koa-compose';
import FindMyWay, { Config, HTTPVersion, HTTPMethod } from 'find-my-way';
import { METHODS } from 'node:http';
import { Middleware, Context, Next } from 'koa';

export interface Instance {
  on(method: HTTPMethod | HTTPMethod[], path: string, ...middlewares: Middleware[]): Instance,
  off(method: HTTPMethod | HTTPMethod[], path: string): Instance,
  prettyPrint(): string,
  routes(): Middleware,
}

export default <V extends HTTPVersion = HTTPVersion.V1>(options: Config<V>): Instance => {
  const fmw = FindMyWay(options);
  const r: any = {};

  function on(method: HTTPMethod | HTTPMethod[], path: string, ...middlewares: Middleware[]) {
    // optional store argument
    let store;
    if (middlewares.length > 1 && typeof middlewares[middlewares.length - 1] === 'object') {
      store = middlewares.pop();
    }
    // @ts-ignore
    fmw.on(method, path, compose(middlewares), store);
    return r;
  }

  r.on = on;
  // @ts-ignore
  r.all = (path: string, ...middlewares: Middleware[]) => on(METHODS, path, ...middlewares);

  METHODS.forEach((m) => {
    // @ts-ignore
    r[m.toLowerCase()] = (path: string, ...middlewares: Middleware[]) => on(m, path, ...middlewares);
  });

  [
    'off',
    'reset',
    'prettyPrint',
    'find',
  ].forEach((m) => {
    // @ts-ignore
    r[m] = fmw[m].bind(fmw);
  });

  r.routes = () => (ctx: Context, next: Next) => {
    // @ts-ignore
    const handle = fmw.find(ctx.method, ctx.path);
    if (!handle) {
      // @ts-ignore
      return fmw.defaultRoute && fmw.defaultRoute(ctx, next);
    }
    ctx.params = handle.params;
    ctx.store = handle.store;
    // @ts-ignore
    return handle.handler(ctx, next);
  };

  return r;
}