import compose from 'koa-compose';
import { Middleware } from 'koa';
import { Server } from 'node:http';
import { Application } from "@modulon/application";

@Application.Injectable
export class HttpGlobalMiddlewares extends Application {
  private readonly prefixs = new Set<Middleware>();
  private readonly suffixs = new Set<Middleware>();
  private readonly servers = new Set<(s: Server) => (unknown | Promise<unknown>)>();

  public initialize() { }

  public add(type: 'prefix' | 'suffix', ...middlewares: Middleware[]) {
    const target = type === 'prefix' ? this.prefixs : this.suffixs;
    for (let i = 0; i < middlewares.length; i++) {
      target.add(middlewares[i]);
    }
    return this;
  }

  public del(type: 'prefix' | 'suffix', ...middlewares: Middleware[]) {
    const target = type === 'prefix' ? this.prefixs : this.suffixs;
    for (let i = 0; i < middlewares.length; i++) {
      const middleware = middlewares[i];
      if (target.has(middleware)) {
        target.delete(middleware);
      }
    }
    return this;
  }

  public compose(type: 'prefix' | 'suffix'): Middleware {
    const target = type === 'prefix' ? this.prefixs : this.suffixs;
    return async (ctx, next) => {
      if (!target.size) return await next();
      const middlewares = Array.from(target.values());
      const composed = compose(middlewares);
      await composed(ctx, next);
    }
  }

  public addServer(callback: (s: Server) => unknown | Promise<unknown>) {
    this.servers.add(callback);
    return this;
  }

  public async attachServer(server: Server) {
    for (const one of this.servers.values()) {
      await Promise.resolve(one(server));
    }
    return this;
  }
}