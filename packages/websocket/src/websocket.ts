import { Server, ServerOptions, Socket } from 'socket.io';
import { Application, ApplicationConfigs } from '@braken/application';
import { HttpGlobalMiddlewares } from '@braken/http';
import { LoadNameSpaceProps, compose } from './types';
import { glob } from 'glob';
import { IClass, Context as InjectionContext } from '@braken/injection';
import { NameSpace, getEventsByNamespace, getMiddlewaresByNameSpace, hasDeprecatedByNameSpace } from './namespace';
import { resolve } from 'node:path';
import { Middleware } from './middleware';
import { pathToRegexp } from 'path-to-regexp';

declare module 'socket.io' {
  interface Socket {
    $module: InjectionContext,
    $params: Record<string, any>,
  }
}

@Application.Injectable
export class WebSocket extends Application {
  static readonly namespace = Symbol('websocket');
  static set(options: ServerOptions) {
    ApplicationConfigs.set(WebSocket.namespace, options);
  }

  public io: Server;
  @Application.Inject(HttpGlobalMiddlewares)
  private readonly httpMiddlewares: HttpGlobalMiddlewares;
  public initialize() {
    const props = ApplicationConfigs.get(WebSocket.namespace);
    this.httpMiddlewares.addServer(s => {
      this.io = new Server(s, props);
    })

    return () => {
      this.io.close();
      this.io = undefined;
    }
  }

  public async load(directory: string, options: LoadNameSpaceProps = {}) {
    const suffix = options.suffix ?? 'ns';
    const files = await glob(`**/*.${suffix}.{ts,js}`, { cwd: directory });
    const _namespaces = new Set<IClass<NameSpace>>();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = file.substring(0, file.length - (4 + suffix.length));
      const namespace = (await import(resolve(directory, file))).default as IClass<NameSpace>;
      await this.connect(namespace, path, options);
      _namespaces.add(namespace);
    }
  }

  public async connect<T extends NameSpace>(namespace: IClass<T>, path: string, options: LoadNameSpaceProps) {
    if (hasDeprecatedByNameSpace(namespace)) return;
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

    const middlewares = getMiddlewaresByNameSpace(namespace) || [];
    const events = getEventsByNamespace(namespace);

    const reg = pathToRegexp(routingPath);
    // todo:如何处理 keys
    // ....

    const keys = reg.keys;
    const ns = this.io.of(reg);
    ns.use(this.transformMiddlewares(middlewares)).on('connection', async socket => {
      const exec = reg.exec(socket.nsp.name);
      const params: Record<string, any> = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        params[key.name] = exec[i + 1];
      }
      socket.$params = params;
      socket.$module.addCache(NameSpace.socketnamespace, socket);
      socket.$module.addCache(NameSpace.namespace, ns);
      socket.$module.addCache(NameSpace.ionamespace, this.io);

      const target = await socket.$module.use(namespace);
      if (events) {
        for (const key of events.values()) {
          socket.on(key as string, (...args) => {
            // @ts-ignore
            if (target[key]) {
              // @ts-ignore
              Promise.resolve(target[key](...args))
                .then(res => {
                  if (res !== undefined) {
                    socket.emit(key as string, res);
                  }
                })
                .catch(e => {
                  if (options.onError) {
                    options.onError(socket, e);
                  } else {
                    console.log(e);
                  }
                });
            }
          })
        }
      }
    })
  }

  private transformMiddlewares(args: IClass<Middleware>[]) {
    const composed = compose(args);
    return (socket: Socket, next: (e?: any) => void) => {
      socket.$module = new InjectionContext();
      socket.$module.mergeFrom(this.$ctx);
      composed(socket, next).catch(e => next(e));
    }
  }
}