import mitt from 'mitt';
import ReactDOM from 'react-dom/client';
import { Router } from "./router";
import { parse } from 'qs';
import { Controller } from './controller';
import { Exception } from './exception';
import { Request } from './request';
import { IStatusComponent, LocationProps, Middleware, MiddlewareType } from './types';
import { Context, FC, PropsWithChildren, ReactNode, createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

export class Application extends Router {
  private readonly prefix: string;
  private readonly e = mitt<{ change: string, error: Exception }>();
  private readonly middlewares = new Map<MiddlewareType, Middleware[]>();
  private readonly PrefixContext: Context<string>;
  private readonly LocationContext: Context<LocationProps>;
  private readonly StatusComponents = new Map<number, IStatusComponent>();
  public readonly request = new Request(this);

  constructor(prefix: string = '/') {
    super({
      caseSensitive: true,
      ignoreTrailingSlash: true,
      maxParamLength: +Infinity,
    })
    if (prefix) {
      if (prefix.endsWith('/')) {
        this.prefix = prefix.substring(0, prefix.length - 1);
      } else {
        this.prefix = prefix;
      }
    } else {
      this.prefix = '';
    }
    this.PrefixContext = createContext(this.prefix);
    this.LocationContext = createContext({
      params: {},
      ...this.transformLocation(window.location.href),
    })
    this.middlewares.set('global', []);
    this.middlewares.set('router', []);
  }

  public addStatusListener(status: number, component: IStatusComponent) {
    this.StatusComponents.set(status, component);
    return this;
  }

  private transformLocation(url: string): Omit<LocationProps, 'params'> {
    const { pathname, search, hash } = new URL(
      url.startsWith('/')
        ? window.location.protocol + '//' + window.location.hostname + url
        : url
    );

    const _pathname = pathname.startsWith(this.prefix)
      ? pathname.substring(this.prefix.length)
      : pathname;

    return {
      pathname: _pathname,
      query: search && search !== '?'
        ? parse(search.substring(1)) as Record<string, string>
        : {},
      hash,
    }
  }

  public use(type: MiddlewareType, ...middleware: Middleware[]) {
    this.middlewares.get(type).push(...middleware);
    return this;
  }

  public usePrefix() {
    return useContext(this.PrefixContext);
  }

  public useLocation() {
    return useContext(this.LocationContext);
  }

  private createLocationComponent(fields: LocationProps, node: ReactNode) {
    return createElement(this.LocationContext.Provider, { value: fields }, node);
  }

  private createPage(): FC {
    return (props: PropsWithChildren) => {
      const [error, setError] = useState<Exception>(null);
      const [url, setUrl] = useState<string>(window.location.href);

      const element = useMemo(() => {
        const { pathname, query, hash } = this.transformLocation(url);
        const matched = this.find(pathname);
        const middlewares: Middleware[] = [...this.middlewares.get('global')];
        const fields: LocationProps = matched
          ? { params: matched.params, pathname, query, hash }
          : { params: {}, pathname, query, hash };

        if (error && this.StatusComponents.has(error.status)) {
          const node: ReactNode = createElement(this.StatusComponents.get(error.status), {
            status: error.status,
            message: error.message,
          })
          return this.createLocationComponent(fields,
            middlewares
              .reverse()
              .reduce(
                (prev, next) => createElement(next, fields, prev),
                node
              ),
          )
        } else {
          if (matched) {
            const controller: Controller = matched.handler();
            middlewares.push(...this.middlewares.get('router'));
            middlewares.push(...controller.middlewares);
          }
          return this.createLocationComponent(fields,
            middlewares
              .reverse()
              .reduce(
                (prev, next) => createElement(next, fields, prev),
                props.children
              ),
          )
        }
      }, [url, props.children, error]);

      useEffect(() => {
        const fetchURL = () => this.e.emit('change', window.location.href);
        const postException = (e: Exception) => setError(e);
        const postURL = (url: string) => {
          setError(null);
          setUrl(url);
        };

        this.e.on('change', postURL);
        this.e.on('error', postException)
        window.addEventListener('popstate', fetchURL);

        return () => {
          window.removeEventListener('popstate', fetchURL);
          this.e.off('change', postURL);
          this.e.off('error', postException);
        }
      }, [])

      return createElement(
        this.PrefixContext.Provider,
        {
          value: this.prefix
        },
        element
      )
    }
  }

  public render<T extends HTMLElement>(
    id: T,
    manifest: { path: string, controller: Controller }[] = [],
    notfound?: ReactNode
  ) {
    for (let i = 0; i < manifest.length; i++) {
      const { path, controller } = manifest[i];
      controller.initialize(this, path);
    }
    const Page = this.createPage();
    const root = ReactDOM.createRoot(id);
    root.render(createElement(Page, null, notfound));
    return () => root.unmount();
  }

  public joinUrl(url: string) {
    return url.startsWith(this.prefix) ? url : this.prefix + url;
  }

  public redirect(url: string) {
    url = this.joinUrl(url);
    window.history.pushState(null, '', url);
    this.e.emit('change', url);
    return this;
  }

  public replace(url: string) {
    url = this.joinUrl(url);
    window.history.replaceState(null, '', url);
    this.e.emit('change', url);
    return this;
  }

  public reload() {
    this.e.emit('change', window.location.href);
    return this;
  }

  public exceptable(e: Exception) {
    if (this.StatusComponents.has(e.status)) {
      this.e.emit('error', e);
    }
  }
}