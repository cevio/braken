import { Component, Context } from './context';
export type IClass<T extends Component = Component> = { new(ctx: Context): T }
export type InjectAcceptType<T extends Component = Component> = string | symbol | IClass<T>;
export type IHookCallback = (ctx?: Context) => any | Promise<any>