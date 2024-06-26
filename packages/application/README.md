```ts
import { Context, Component } from "@typon/injection";
import { Application, Terminater } from './index';

const ctx = new Context();

@Component.Injectable
class X extends Component {
  public readonly time = Date.now();
}

@Application.Injectable
class ABC extends Application {

  @Application.Inject(X)
  private readonly x: X;

  @Application.State
  public a1 = 1;

  @Application.State
  public a2 = 2;

  public initialize(): Terminater {
    console.log('initialized')
    this.emit('test', 1);
    this.a1 = 3 + this.x.time;
    setTimeout(() => {
      this.a2 = 10;
      this.a1 = 5
    }, 3000)
    return () => console.log('terminated');
  }

  @Application.Event
  test(val: number) {
    console.log('event:test', val + 1);
  }

  @Application.Watch('a1')
  ta1(newValue: number, oldValue: number) {
    console.log('newValue', newValue, 'oldValue', oldValue, this.a1)
  }
}

ctx.use(ABC).then(() => Application.Terminate());
```