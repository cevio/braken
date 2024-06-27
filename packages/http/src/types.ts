import { Context, IClass } from "@braken/injection"

export interface HttpProps {
  port: number,
  keys?: string[],
  ignoreDuplicateSlashes?: boolean,
  ignoreTrailingSlash?: boolean,
  maxParamLength?: number,
  allowUnsafeRegex?: boolean,
  caseSensitive?: boolean,
}

export interface LoadControllerProps {
  suffix?: string,
  defaultPath?: string,
  prefix?: string,
  transformPhysicalPathToRoutingPath?(path: string): string
}