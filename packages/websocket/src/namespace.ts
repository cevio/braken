import { Component, IClass, injectable } from "@braken/injection";
import { Server, Socket, Namespace } from 'socket.io';
import { Middleware } from './middleware';

type OF = Parameters<Server['of']>[0];

export const MiddlewareContainer = new Map<Function, IClass<Middleware>[]>();
export const DeprecatedContainer = new Set<Function>();
export const NamespaceContainer = new Map<Function, OF>();
export const EventsContainer = new Map<Function, Set<string | Symbol>>();

@Component.Injectable
export abstract class NameSpace extends Component {
  static readonly Injectable = injectable();
  static readonly socketnamespace = Symbol('socket');
  static readonly namespace = Symbol('namespace');
  static readonly ionamespace = Symbol('io');

  @Component.Inject(NameSpace.socketnamespace)
  public readonly $socket: Socket;

  @Component.Inject(NameSpace.namespace)
  public readonly $namespace: Namespace;

  @Component.Inject(NameSpace.ionamespace)
  public readonly $io: Server;

  static Middleware(...args: IClass<Middleware>[]): ClassDecorator {
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

  static readonly Deprecated: ClassDecorator = target => {
    DeprecatedContainer.add(target);
  }

  static readonly Event: MethodDecorator = (target, property) => {
    const fn = target.constructor;
    if (!EventsContainer.has(fn)) {
      EventsContainer.set(fn, new Set())
    }
    const pool = EventsContainer.get(fn);
    pool.add(property);
  }
}

export function getMiddlewaresByNameSpace<T extends NameSpace>(target: IClass<T>) {
  if (MiddlewareContainer.has(target)) {
    return MiddlewareContainer.get(target);
  }
}

export function hasDeprecatedByNameSpace<T extends NameSpace>(target: IClass<T>) {
  if (DeprecatedContainer.has(target)) {
    return DeprecatedContainer.has(target);
  }
  return false;
}

export function getEventsByNamespace<T extends NameSpace>(target: IClass<T>) {
  if (EventsContainer.has(target)) {
    return EventsContainer.get(target);
  }
}