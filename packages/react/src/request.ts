import { Application } from './app';
import { Exception } from './exception';
import { RequestQueryProps } from './types'

interface ResponseProps<T> {
  status: number,
  message?: string,
  data?: T,
  stack?: string
}

const init_headers = {}

export class Request {
  private customResponse: (data: any) => any;
  constructor(private readonly app: Application) { }

  public useCustomResponse<T = any>(callback: (data: T) => any) {
    this.customResponse = callback;
    return this;
  }

  private async createResponse<T>(res: Response): Promise<RequestQueryProps<T>> {
    if (res.status < 200 || res.status >= 300) {
      this.app.exceptable(new Exception(res.status, res.statusText));
      throw new Exception(res.status, res.statusText)
    }

    const response = await res.json();

    if (typeof this.customResponse === 'function') {
      const data = this.customResponse(response);

      return {
        data,
        headers: res.headers,
      }
    }

    const result: ResponseProps<T> = response;

    if (result.status < 200 || result.status >= 300) {
      this.app.exceptable(new Exception(result.status, result.message));
      throw new Exception(result.status, result.message)
    }

    return {
      data: result.data,
      headers: res.headers,
    }
  }

  public get<T = any>(url: string | { toString: () => string }, headers: HeadersInit = {}) {
    return window.fetch(typeof url === 'string' ? url : url.toString(), {
      method: 'get',
      headers: { ...init_headers, ...headers },
    }).then(res => this.createResponse<T>(res));
  }

  public post<T = any>(url: string | { toString: () => string }, body: object, headers: HeadersInit = {}) {
    return window.fetch(typeof url === 'string' ? url : url.toString(), {
      method: 'post',
      headers: {
        ...init_headers, ...headers,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body),
    }).then(res => this.createResponse<T>(res));
  }

  public put<T = any>(url: string | { toString: () => string }, body: object, headers: HeadersInit = {}) {
    return window.fetch(typeof url === 'string' ? url : url.toString(), {
      method: 'put',
      headers: {
        ...init_headers, ...headers,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body),
    }).then(res => this.createResponse<T>(res));
  }

  public delete<T = any>(url: string | { toString: () => string }, headers: HeadersInit = {}) {
    return window.fetch(typeof url === 'string' ? url : url.toString(), {
      method: 'delete',
      headers: { ...init_headers, ...headers },
    }).then(res => this.createResponse<T>(res));
  }
}