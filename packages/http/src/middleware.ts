import { Component, injectable } from "@braken/injection";
import { Context, Next } from 'koa';

export abstract class Middleware<T extends Context = Context> extends Component {
  public abstract use(ctx: T, next: Next): Promise<void>;
  static readonly Injectable = injectable();
  static readonly isMiddleware = true;
}