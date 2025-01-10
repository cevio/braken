import { Component, IClass, injectable } from "@braken/injection";
import { Middleware } from './middleware';
import { Context, Middleware as KoaMiddleware, Next } from 'koa';
import { HTTPMethod } from "find-my-way";
import { PathFunction, MatchFunction } from 'path-to-regexp';

export type IParameterMap<T extends Controller = Controller> = Map<string | symbol, (ctx: Context, c: T) => Promise<any>>;

export const MiddlewareContainer = new Map<Function, (KoaMiddleware | IClass<Middleware>)[]>();
export const MethodContainer = new Map<Function, Set<HTTPMethod>>();
export const SSEContainer = new Map<Function, number>();
export const DeprecatedContainer = new Set<Function>();
export const FileRegExpContainer = new Map<Function, [{
  path: string,
  router: string,
}, PathFunction<any>, MatchFunction<any>]>();

export const ParametersContainer = new Map<Function, {
  head: IParameterMap,
  query: IParameterMap,
  path: IParameterMap,
  body: IParameterMap,
}>();

@Component.Injectable
export abstract class Controller<T extends Context = Context> extends Component {
  public abstract response(ctx: T, next: Next): Promise<unknown>;
  static readonly Injectable = injectable();

  static Middleware(...args: (KoaMiddleware | IClass<Middleware>)[]): ClassDecorator {
    return target => {
      if (!MiddlewareContainer.has(target)) {
        MiddlewareContainer.set(target, [])
      }
      const pool = MiddlewareContainer.get(target);
      for (let i = 0; i < args.length; i++) {
        const current = args[i];
        if (!pool.includes(current)) {
          pool.push(current);
        }
      }
    }
  }

  static Method(...args: HTTPMethod[]): ClassDecorator {
    return target => {
      if (!MethodContainer.has(target)) {
        MethodContainer.set(target, new Set())
      }
      const methods = MethodContainer.get(target);
      for (let i = 0; i < args.length; i++) {
        methods.add(args[i]);
      }
    }
  }

  static Sse(timer = 0): ClassDecorator {
    return target => {
      SSEContainer.set(target, timer);
    }
  }

  static readonly Deprecated: ClassDecorator = target => {
    DeprecatedContainer.add(target);
  }

  static Parameter(pos: 'query' | 'path' | 'body' | 'head', ...args: (((v: any) => any) | string)[]): PropertyDecorator {
    return (target, property) => {
      const controller = target.constructor;
      if (!ParametersContainer.has(controller)) {
        ParametersContainer.set(controller, {
          head: new Map(),
          query: new Map(),
          path: new Map(),
          body: new Map(),
        })
      }
      const { query, path, body, head } = ParametersContainer.get(controller);
      switch (pos) {
        case 'head':
          head.set(property, (ctx: Context, controller) => transformValue(controller, ctx.headers[property as string], args));
          break;
        case 'query':
          query.set(property, (ctx: Context, controller) => transformValue(controller, ctx.query[property as string], args));
          break;
        case 'path':
          path.set(property, async (ctx: Context, controller) => transformValue(controller, ctx.params[property as string], args));
          break;
        case 'body':
          // @ts-ignore
          body.set(property, async (ctx: Context, controller) => transformValue(controller, ctx.request.body, args));
          break;
      }
    }
  }
}

async function transformValue<T extends Controller>(target: T, val: any, args: (((v: string) => any) | string)[]) {
  let value = val;
  for (let i = 0; i < args.length; i++) {
    const fn = args[i];
    if (typeof fn === 'function') {
      value = await Promise.resolve(fn(value));
    } else if (typeof fn === 'string') {
      // @ts-ignore
      value = await Promise.resolve(target[fn](value));
    }
  }
  return value;
}

export function getParametersByController<T extends Controller>(clazz: IClass<T>) {
  if (ParametersContainer.has(clazz)) {
    return ParametersContainer.get(clazz);
  }
}

export function getMethodsByController<T extends Controller>(clazz: IClass<T>) {
  if (MethodContainer.has(clazz)) {
    return MethodContainer.get(clazz);
  }
}

export function getMiddlewaresByController<T extends Controller>(clazz: IClass<T>) {
  if (MiddlewareContainer.has(clazz)) {
    return MiddlewareContainer.get(clazz);
  }
}

export function getMetaByController<T extends Controller>(clazz: IClass<T>) {
  if (FileRegExpContainer.has(clazz)) {
    return FileRegExpContainer.get(clazz);
  }
}

export function hasDeprecatedController<T extends Controller>(clazz: IClass<T>) {
  return DeprecatedContainer.has(clazz);
}

export function toPath<T extends Controller>(clazz: IClass<T>, opts: object = {}) {
  const meta = getMetaByController(clazz);
  if (!meta) throw new Error('controller is inavalid');
  const fn = meta[1];
  return fn(opts);
}

export function isMatch<T extends Controller>(clazz: IClass<T>, path: string) {
  const meta = getMetaByController(clazz);
  if (!meta) throw new Error('controller is inavalid');
  const fn = meta[2];
  return fn(path);
}