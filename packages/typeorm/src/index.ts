import { Application, ApplicationConfigs } from '@braken/application';
import { DataSource, DataSourceOptions, QueryRunner } from 'typeorm';

@Application.Injectable
export default class TypeORM extends Application {
  public connection: DataSource;
  static readonly namespace = Symbol('typeorm');
  static set(options: DataSourceOptions) {
    ApplicationConfigs.set(TypeORM.namespace, options);
  }

  public async initialize() {
    if (!ApplicationConfigs.has(TypeORM.namespace)) {
      throw new Error('Missing configuration parameters for Typeorm service startup');
    }
    const props: DataSourceOptions = ApplicationConfigs.get(TypeORM.namespace);
    const connection = new DataSource(props);
    await connection.initialize();
    this.connection = connection;
    return () => this.terminate();
  }

  static async transaction<T>(datasource: DataSource, callback: (
    runner: QueryRunner,
    rollback: (roll: () => unknown | Promise<unknown>) => number
  ) => Promise<T>) {
    const rollbacks: (() => unknown | Promise<unknown>)[] = [];
    const runner = datasource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    const push = (roll: () => unknown | Promise<unknown>) => rollbacks.push(roll);
    try {
      const res = await callback(runner, push);
      await runner.commitTransaction();
      return res;
    } catch (e) {
      await runner.rollbackTransaction();
      let i = rollbacks.length;
      while (i--) await Promise.resolve(rollbacks[i]());
      throw e;
    } finally {
      await runner.release();
    }
  }

  public transaction<T>(callback: (
    runner: QueryRunner,
    rollback: (roll: () => unknown | Promise<unknown>) => number
  ) => Promise<T>) {
    return TypeORM.transaction<T>(this.connection, callback);
  }

  public async terminate() {
    await this.connection.destroy();
    this.connection = undefined;
  }
}