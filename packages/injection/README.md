```ts
import { Component, Context, inject, injectable } from './index';

const ctx = new Context();

abstract class Service extends Component {
  abstract main(): Promise<void>;
}

const Injectable = injectable();
const ServiceInjectable = injectable(async (ctx: Service) => {
  if (ctx.main) {
    await ctx.main();
  }
});

@Injectable
class X extends Component {
  public readonly time = Date.now();
}

@ServiceInjectable
class A extends Service {
  async main(): Promise<void> {
    console.log('a main')
  }
}

@Injectable
class B extends A {
  @inject(X)
  public readonly x1: X;
}

@Injectable
class C extends B {
  @inject(X)
  public readonly x2: X;
}

@Injectable
class D extends C {
  @inject(X)
  public readonly x3: X;
}

@Injectable
class E extends B {
  @inject(X)
  public readonly x4: X;
}

@Injectable
class F extends A {
  @inject(X)
  public readonly x5: X;
}

@Injectable
class G extends E {
  @inject(F)
  public readonly f: F;
}

ctx.use(D).then(res => console.log('d', res))
// ctx.use(E).then(res => console.log('e', res))
// ctx.use(F).then(res => console.log('f', res))
// ctx.use(G).then(res => console.log('g', res))
// console.log(container)
```