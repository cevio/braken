import { Connection, HttpTypeormPlugin } from './plugin';
import { Component } from '@braken/injection';
import { EntityTarget } from 'typeorm'

@Component.Injectable
export class TypeORMService extends Component {
  @Component.Inject(HttpTypeormPlugin.namespace)
  public readonly conn: Connection;

  public getRepository<T>(target: EntityTarget<T>) {
    return this.conn.manager.getRepository(target);
  }
}