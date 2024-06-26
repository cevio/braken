import { Context } from "koa";
import { Transform, TransformCallback } from 'node:stream';
import { Controller } from "./controller";

/**
 * SSE模块输出
 * class controller {
 *  public response() {
 *    this.on('close', () => {});
 *    setInterval(() => {
 *      this.emit('sse', {
 *        a: 1
 *      })
 *    })
 *  }
 * }
 */
export class SSE<T extends Controller> extends Transform {
  private id = 0;
  private _closed = false;
  constructor(
    private readonly controller: T,
    private readonly polling = 0,
  ) {
    super({ writableObjectMode: true });
  }

  public send(event: string, data?: string) {
    if (!this._closed) {
      let id = this.id++;
      if (id >= Number.MAX_SAFE_INTEGER) {
        id = this.id = 0;
      }
      if (!data) {
        this.write(`id: ${id}\ndata: ${event}\n\n`);
      } else {
        this.write(`id: ${id}\nevent: ${event}\ndata: ${data}\n\n`);
      }
    }
  }

  public render(ctx: Context) {
    ctx.set("Content-Type", "text/event-stream");
    ctx.set("Cache-Control", "no-cache, no-transform");
    ctx.set("Connection", "keep-alive");
    ctx.req.socket.setTimeout(0);
    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);
    const timer = this.polling
      ? setInterval(() => this.send('timestamp', Date.now() + ''), this.polling)
      : null;
    ctx.req.on('close', () => this.controller.emit('close'));
    this.controller.on('sse', (data: any) => this.send(formatSseData(data)));
    this.controller.on('close', () => {
      if (this._closed) return;
      if (this.polling) {
        clearInterval(timer);
      }
      this.send('close', '{}');
      this.unpipe();
      this.destroy();
      ctx.res.end();
      ctx.socket.destroy();
      this._closed = true;
    });
  }

  public _transform(data: any, _: string, cb: TransformCallback): void {
    this.push(data);
    return cb();
  }
}

function formatSseData(data: any) {
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
}