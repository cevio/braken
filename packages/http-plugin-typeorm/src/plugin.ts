import TypeORM from '@braken/typeorm';
import { Middleware, Plugin } from '@braken/http';
import { Context, Next } from 'koa';
import { DataSource, QueryRunner } from 'typeorm';

declare module 'koa' {
  interface BaseContext {
    $typeorm_connection?: Connection,
    $typeorm_transacation_rollback?: (roll: () => unknown) => number,
  }
}

export type Connection = DataSource | QueryRunner;
export class HttpTypeormPlugin extends Plugin {
  static readonly namespace = Symbol('typeorm:connection');

  public onCreate() {
    this.ctx.$module.addHook(HttpTypeormPlugin.namespace, async () => {
      if (!this.ctx.$typeorm_connection) {
        const typeorm = await this.ctx.$module.use(TypeORM);
        return typeorm.connection;
      }
      return this.ctx.$typeorm_connection;
    });
  }

  public onRequest() { }
  public onResponse() { }
}

@Middleware.Injectable
export class DataBaseWare extends Middleware {
  @Middleware.Inject(TypeORM)
  private readonly typeorm: TypeORM;
  public async use(ctx: Context, next: Next) {
    ctx.$typeorm_connection = this.typeorm.connection;
    await next();
  }
}

@Middleware.Injectable
export class DataBaseTransactionWare extends Middleware {
  @Middleware.Inject(TypeORM)
  private readonly typeorm: TypeORM;
  public async use(ctx: Context, next: Next) {
    await this.typeorm.transaction(async (runner, roll) => {
      ctx.$typeorm_connection = runner;
      ctx.$typeorm_transacation_rollback = roll;
      return await next();
    })
  }
}