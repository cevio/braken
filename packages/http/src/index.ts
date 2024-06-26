import Koa, { Context, Middleware as KoaMiddleware, Next } from 'koa';
import FindMyWay, { Instance } from './server';
import { createServer, Server } from 'node:http';
import { Application, ApplicationConfigs } from '@modulon/application';
import { HttpProps, LoadControllerProps } from './types';
import { randomBytes } from 'node:crypto';
import { IClass, Context as InjectionContext } from '@modulon/injection';
import { HttpGlobalMiddlewares } from './middlewares';
import { glob } from 'glob';
import { resolve } from 'node:path';
import { Controller, FileRegExpContainer, MethodContainer, MiddlewareContainer, SSEContainer } from './controller';
import { Middleware } from './middleware';
import { compile, match } from 'path-to-regexp';
import { SSE } from './sse';

declare module 'koa' {
  interface BaseContext {
    $module: InjectionContext,
  }
}

export * from './controller';
export * from './middleware';
export * from './middlewares';
export * from './server';
export * from './types';

@Application.Injectable
export default class Http extends Application {
  public koa: Koa;
  public app: Instance;
  public server: Server;
  public keys: string[];
  public port: number;

  private readonly offlines = new Map<IClass, () => void>();

  @Application.Inject(HttpGlobalMiddlewares)
  private readonly middlewares: HttpGlobalMiddlewares;

  static readonly namespace = Symbol('http');
  static set(options: HttpProps) {
    ApplicationConfigs.set(Http.namespace, options);
  }

  public async initialize() {
    if (!ApplicationConfigs.has(Http.namespace)) {
      throw new Error('Missing configuration parameters for HTTP service startup');
    }
    const props: HttpProps = ApplicationConfigs.get(Http.namespace);
    const koa = new Koa();
    const keys = koa.keys = props.keys
      ? props.keys
      : [randomBytes(32).toString(), randomBytes(64).toString()];
    const app = FindMyWay({
      ignoreDuplicateSlashes: props.ignoreDuplicateSlashes ?? true,
      ignoreTrailingSlash: props.ignoreTrailingSlash ?? true,
      maxParamLength: props.maxParamLength ?? +Infinity,
      allowUnsafeRegex: props.allowUnsafeRegex ?? true,
      caseSensitive: props.caseSensitive ?? true,
      // @ts-ignore
      defaultRoute: async (ctx: Context, next: Next) => await next(),
    })
    koa.use(async (ctx, next) => {
      ctx.$module = new InjectionContext();
      ctx.$module.mergeFrom(this.$ctx);
      if (props.hooks) {
        for (const key in props.hooks) {
          ctx.$module.addHook(key, props.hooks[key]);
        }
      }
      await next();
    })
    koa.use(this.middlewares.compose('prefix'));
    koa.use(app.routes());
    koa.use(this.middlewares.compose('suffix'));
    const server = createServer(koa.callback());
    await this.middlewares.attachServer(server);
    await new Promise<void>((resolve, reject) => {
      server.listen(props.port, (err?: any) => {
        if (err) return reject(err);
        resolve();
      })
    })

    this.koa = koa;
    this.app = app;
    this.server = server;
    this.keys = keys;
    this.port = props.port;

    return () => {
      this.server.close();
      this.koa = undefined;
      this.app = undefined;
      this.server = undefined;
      this.keys = undefined;
      this.port = undefined;
    }
  }

  public async load(directory: string, options: LoadControllerProps = {}) {
    const suffix = options.suffix ?? 'controller';
    const files = await glob(`**/*.${suffix}.{ts,js}`, { cwd: directory });
    const _controllers = new Map<IClass<Controller>, () => void>();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = file.substring(0, file.length - (4 + suffix.length));
      let controllers = (await import(resolve(directory, file))).default as IClass<Controller> | IClass<Controller>[];
      if (!Array.isArray(controllers)) controllers = [controllers];
      for (let i = 0; i < controllers.length; i++) {
        const controller = controllers[i];
        const rollback = await this.connect(controller, path, options);
        _controllers.set(controller, rollback);
      }
    }
    return _controllers;
  }

  public async connect<T extends Controller>(controller: IClass<T>, path: string, options: LoadControllerProps = {}) {
    const suffix = options.defaultPath || '/index';
    path = path.startsWith('/') ? path : '/' + path;
    if (path.endsWith(suffix)) {
      path = path.substring(0, path.length - suffix.length);
    }
    if (!path) path = '/';
    let physicalPath = options.prefix ? options.prefix + path : path;
    if (physicalPath.endsWith('/')) {
      physicalPath = physicalPath.substring(0, physicalPath.length - 1);
    }
    if (!physicalPath) physicalPath = '/';
    const routingPath = options.transformPhysicalPathToRoutingPath
      ? options.transformPhysicalPathToRoutingPath(physicalPath)
      : physicalPath.replace(/\[([^\]]+)\]/g, ':$1');

    const methods = MethodContainer.has(controller)
      ? Array.from(MethodContainer.get(controller).values())
      : [];

    const middlewares = MiddlewareContainer.has(controller)
      ? MiddlewareContainer.get(controller)
      : [];

    const _middlewares = this.transformMiddlewares(middlewares);
    const sseable = SSEContainer.has(controller);
    const offline = () => {
      this.app.off(methods, routingPath);
      this.offlines.delete(controller);
    }

    FileRegExpContainer.set(controller, [
      {
        path: physicalPath,
        router: routingPath
      },
      compile<Record<string, string>>(routingPath, { encode: encodeURIComponent }),
      match(routingPath, { decode: decodeURIComponent }),
    ])

    this.app.on(methods, routingPath, ..._middlewares, async (ctx, next) => {
      const target = await ctx.$module.use(controller);
      const sse = sseable ? new SSE(target, SSEContainer.get(controller)) : null;
      await target.response(ctx, next);
      if (sse) {
        sse.render(ctx);
        ctx.body = sse;
      }
    })

    this.offlines.set(controller, offline);

    return offline;
  }

  public disconnect(controller: IClass) {
    if (this.offlines.has(controller)) {
      const offline = this.offlines.get(controller);
      offline();
    }
    return this;
  }

  private transformMiddlewares(args: (KoaMiddleware | IClass<Middleware>)[]) {
    const pool: KoaMiddleware[] = [];
    for (let i = 0; i < args.length; i++) {
      const current = args[i];
      // @ts-ignore
      if (current.isMiddleware) {
        pool.push(async (ctx, next) => {
          const target = await ctx.$module.use(current as IClass<Middleware>);
          await target.use(ctx, next);
        })
      } else {
        pool.push(current as KoaMiddleware);
      }
    }
    return pool;
  }
}