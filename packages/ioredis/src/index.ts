import ioRedis, { RedisOptions } from 'ioredis';
import { Application, ApplicationConfigs } from "@braken/application";

@Application.Injectable
export default class IoRedis extends Application {
  public connection: ioRedis;
  static readonly namespace = Symbol('ioredis');
  static set(options: RedisOptions) {
    ApplicationConfigs.set(IoRedis.namespace, options);
  }
  public async initialize() {
    if (!ApplicationConfigs.has(IoRedis.namespace)) {
      throw new Error('Missing configuration parameters for IORedis service startup');
    }
    const props: RedisOptions = ApplicationConfigs.get(IoRedis.namespace);
    const connection = new ioRedis(props);
    await new Promise<void>((resolve, reject) => {
      const onerror = (e: any) => reject(e);
      connection.on('error', onerror);
      connection.on('connect', () => {
        connection.off('error', onerror);
        resolve();
      })
    });
    this.connection = connection;
    return () => {
      this.connection.disconnect();
      this.connection = undefined;
    }
  }
}