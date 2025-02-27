import Koa, { Context, Middleware as KoaMiddleware, Next } from 'koa';
import FindMyWay, { Instance } from './server';
import { createServer, Server } from 'node:http';
import { Application, ApplicationConfigs } from '@braken/application';
import { HttpProps, LoadControllerProps } from './types';
import { randomBytes } from 'node:crypto';
import { IClass, Context as InjectionContext } from '@braken/injection';
import { HttpGlobalMiddlewares } from './middlewares';
import { glob } from 'glob';
import { resolve } from 'node:path';
import { Controller, FileRegExpContainer, IParameterMap, MethodContainer, MiddlewareContainer, getParametersByController, hasDeprecatedController } from './controller';
import { Middleware, MiddlewareDependencies } from './middleware';
import { compile, match } from 'path-to-regexp';
import { IPlugin, Plugin } from './plugin';

declare module 'koa' {
  interface BaseContext {
    $module: InjectionContext,
    $plugins: Plugin[],
  }
}

@Application.Injectable
export class Http extends Application {
  public koa: Koa;
  public app: Instance;
  public server: Server;
  public keys: string[];
  public port: number;

  private readonly offlines = new Map<IClass, () => void>();
  private readonly plugins: IPlugin[] = [];

  @Application.Inject(HttpGlobalMiddlewares)
  private readonly middlewares: HttpGlobalMiddlewares;

  static readonly namespace = Symbol('http');
  static set(options: HttpProps) {
    ApplicationConfigs.set(Http.namespace, options);
  }

  public use<T extends Plugin>(plugin: IPlugin<T>) {
    this.plugins.push(plugin);
    return this;
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
      ctx.$plugins = [];

      for (let i = 0; i < this.plugins.length; i++) {
        const plugin = new this.plugins[i](ctx);
        ctx.$plugins.push(plugin);
        await Promise.resolve(plugin.onCreate());
      }

      // Object.freeze(ctx.$plugins);

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
        if (rollback) {
          _controllers.set(controller, rollback);
        }
      }
    }
    return _controllers;
  }

  public async connect<T extends Controller>(controller: IClass<T>, path: string, options: LoadControllerProps = {}) {
    if (hasDeprecatedController(controller)) return;

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

    const parameters = getParametersByController(controller);

    const methods = MethodContainer.has(controller)
      ? Array.from(MethodContainer.get(controller).values())
      : [];

    const middlewares = MiddlewareContainer.has(controller)
      ? MiddlewareContainer.get(controller)
      : [];

    const _middlewares = this.transformMiddlewares(middlewares);

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
      const plugins = ctx.$plugins;

      if (parameters) {
        const { query, path, body, head } = parameters;
        await this.transformParameter(target, ctx, head);
        await this.transformParameter(target, ctx, query);
        await this.transformParameter(target, ctx, path);
        await this.transformParameter(target, ctx, body);
      }

      for (let i = 0; i < plugins.length; i++) {
        await Promise.resolve(plugins[i].onRequest(target, controller));
      }

      const res = await target.response(ctx, next);
      if (res !== undefined) {
        ctx.body = res;
      }

      for (let i = 0; i < plugins.length; i++) {
        await Promise.resolve(plugins[i].onResponse(target, controller));
      }
    })

    this.offlines.set(controller, offline);

    return offline;
  }

  private async transformParameter<T extends Controller>(controller: T, ctx: Context, map: IParameterMap) {
    for (const [key, fn] of map.entries()) {
      const value = await fn(ctx, controller);
      // @ts-ignore
      controller[key] = value;
    }
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
        const dependencies: Set<KoaMiddleware | IClass<Middleware>> =
          MiddlewareDependencies.has(current)
            ? MiddlewareDependencies.get(current)
            : new Set();

        if (dependencies.size) {
          const res = this.transformMiddlewares(Array.from(dependencies.values()));
          pool.push(...res);
        }

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