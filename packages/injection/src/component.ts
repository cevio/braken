import { inject, injectable } from "./decroators";
import { IHookCallback, InjectAcceptType } from './types';
import { EventEmitter } from 'node:events';
import { Context } from './context';

export class Component extends EventEmitter {
  constructor(
    public readonly $ctx: Context,
    callback?: (c: Component) => void
  ) {
    super();
    typeof callback === 'function' && callback(this);
  }

  static readonly Injectable = injectable();
  static readonly Inject = inject;

  public $use<R extends Component, T extends InjectAcceptType<R>>(clazz: T) {
    return this.$ctx.use<R, T>(clazz);
  }

  public $hook(key: string, callback: IHookCallback) {
    this.$ctx.hook(key, callback);
    return this;
  }
}