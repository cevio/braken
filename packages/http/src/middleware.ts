import { Component, IClass, injectable } from "@braken/injection";
import { Context, Next, Middleware as KoaMiddleware } from 'koa';

export const MiddlewareDependencies = new Map<Function, Set<KoaMiddleware | IClass<Middleware>>>();

@Component.Injectable
export abstract class Middleware<T extends Context = Context> extends Component {
  public abstract use(ctx: T, next: Next): Promise<void>;
  static readonly Injectable = injectable();
  static readonly isMiddleware = true;

  static Dependencies(...args: (KoaMiddleware | IClass<Middleware>)[]): ClassDecorator {
    return target => {
      if (!MiddlewareDependencies.has(target)) {
        MiddlewareDependencies.set(target, new Set())
      }
      const pool = MiddlewareDependencies.get(target);
      for (let i = 0; i < args.length; i++) {
        const current = args[i];
        pool.add(current);
      }
    }
  }
}