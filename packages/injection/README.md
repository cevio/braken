# @braken/injection

Braken 框架的依赖注入模块，提供 IoC 容器和依赖注入支持。

## 安装

```bash
pnpm add @braken/injection
```

## 特性

- 依赖注入容器
- 装饰器支持
- 生命周期管理
- 作用域管理
- 循环依赖处理
- 动态注入

## 使用示例

```typescript
import { Injectable, Inject } from '@braken/injection';

@Injectable()
class UserService {
  @Inject()
  private logger: Logger;

  async findUser(id: string) {
    this.logger.info('Finding user', { id });
    // 查找用户逻辑
  }
}

@Injectable()
class UserController {
  @Inject()
  private userService: UserService;

  async getUser(id: string) {
    return this.userService.findUser(id);
  }
}
```

## API

### 装饰器

- `@Injectable`: 标记可注入类
- `@Inject`: 注入依赖
- `@Optional`: 标记可选依赖
- `@Scope`: 定义作用域
- `@PostConstruct`: 构造后回调
- `@PreDestroy`: 销毁前回调

### 容器

```typescript
import { Container } from '@braken/injection';

const container = new Container();

// 注册服务
container.register(UserService);
container.register(UserController);

// 获取实例
const userController = container.get(UserController);
```

## 许可证

MIT