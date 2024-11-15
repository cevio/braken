import { Component } from "./component";
// import { Context } from "./context";
import { IClass, InjectAcceptType } from "./types";

export const container = new Map<Function, Map<string | symbol, any>>();
export const NS = {
  INJECTABLE: Symbol('injectable'),
  INJECT: Symbol('inject'),
  // SCOPE: Symbol('scope'),
}

export const injectable = <T extends Component>(
  callback?: (current: T, target?: IClass) => unknown | Promise<unknown>,
): ClassDecorator =>
  target => {
    if (!container.has(target)) {
      container.set(target, new Map());
    }
    container.get(target).set(NS.INJECTABLE, callback);
  }

export const inject = (clazz: InjectAcceptType): PropertyDecorator =>
  (target, property) => {
    const constructor = target.constructor;
    if (!container.has(constructor)) {
      container.set(constructor, new Map());
    }

    const meta = container.get(constructor);
    if (!meta.has(NS.INJECT)) {
      meta.set(NS.INJECT, new Map());
    }

    const injections = meta.get(NS.INJECT) as Map<string | symbol, InjectAcceptType>;
    injections.set(property, clazz);
  }

// export function Scope<T extends Context>(ctx: T): ClassDecorator {
//   return target => {
//     if (!container.has(target)) {
//       container.set(target, new Map());
//     }
//     container.get(target).set(NS.SCOPE, ctx);
//   }
// }
