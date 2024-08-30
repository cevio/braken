import { PropsWithChildren, PropsWithoutRef, ReactNode } from "react";
import { stringify } from 'qs';

export interface LocationProps<P extends string = any, Q extends string = any> {
  pathname: string,
  params: Record<P, string>
  query: Record<Q, string>,
  hash: string,
}

export type Middleware<P extends string = any, Q extends string = any> = (props: PropsWithChildren<LocationProps<P, Q>>) => ReactNode;
export type MiddlewareType = 'global' | 'router';
export interface MiddlewareProps<P extends string = any, Q extends string = any> extends LocationProps<P, Q> { }

export function toQueryString<Q extends string>(query?: Record<Q, string>) {
  if (!query) return '';
  const str = stringify(query);
  return str.length ? '?' + str : '';
}

export type IStatusComponentProps = {
  status: number,
  message: string,
}

export type IStatusComponent = (props: PropsWithoutRef<IStatusComponentProps>) => ReactNode;

export interface RequestQueryProps<T> {
  data: T,
  headers: Headers,
}