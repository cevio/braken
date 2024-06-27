import { Context } from 'koa';
import { IClass } from "@braken/injection";
import { Controller } from './controller';

export type IPlugin<T extends Plugin = Plugin> = { new(ctx: Context): T };
export abstract class Plugin {
  public abstract onCreate(): void | Promise<void>;
  public abstract onRequest<T extends Controller>(controller: T, struct?: IClass<T>): void | Promise<void>;
  public abstract onResponse<T extends Controller>(controller: T, struct?: IClass<T>): void | Promise<void>;
  constructor(public readonly ctx: Context) { }
}