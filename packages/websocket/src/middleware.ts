import { Component } from "@braken/injection";
import { Socket } from 'socket.io';


@Component.Injectable
export abstract class Middleware extends Component {
  public abstract use(socket: Socket, next: () => Promise<void>): Promise<void>;
}