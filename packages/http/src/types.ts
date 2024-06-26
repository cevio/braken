import { Context, IClass } from "@modulon/injection"

export interface HttpProps {
  port: number,
  keys?: string[],
  ignoreDuplicateSlashes?: boolean,
  ignoreTrailingSlash?: boolean,
  maxParamLength?: number,
  allowUnsafeRegex?: boolean,
  caseSensitive?: boolean,
  hooks?: Record<string | symbol, (ctx: Context) => IClass | Promise<IClass>>
}

export interface LoadControllerProps {
  suffix?: string,
  defaultPath?: string,
  prefix?: string,
  transformPhysicalPathToRoutingPath?(path: string): string
}