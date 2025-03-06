# @braken/http-plugin-typeorm

Braken 框架的 HTTP TypeORM 插件，提供数据库连接和事务支持。

## 安装

```bash
pnpm add @braken/http-plugin-typeorm
```

## 特性

- TypeORM 连接注入
- 数据库事务支持
- 中间件集成
- 依赖注入集成
- 上下文扩展

## 使用示例

```typescript
import { Http } from '@braken/http';
import HttpTypeormPlugin from '@braken/http-plugin-typeorm';
import { DataBaseWare, DataBaseTransactionWare } from '@braken/http-plugin-typeorm';

const http = new Http();

// 添加 TypeORM 插件
http.use(HttpTypeormPlugin);

// 使用数据库中间件
@Controller.Middleware(DataBaseWare)
class UserController extends Controller {
  async response(ctx, next) {
    // 使用数据库连接
    const connection = ctx.$typeorm_connection;
    // ...
  }
}

// 使用事务中间件
@Controller.Middleware(DataBaseTransactionWare)
class OrderController extends Controller {
  async response(ctx, next) {
    // 在事务中使用数据库连接
    const connection = ctx.$typeorm_connection;
    // 如果需要回滚
    ctx.$typeorm_transacation_rollback(() => {
      // 回滚逻辑
    });
    // ...
  }
}
```

## API

### HttpTypeormPlugin 类

TypeORM 插件类，提供以下功能：

- 自动注入数据库连接
- 上下文扩展
- 生命周期钩子

### 中间件

#### DataBaseWare
数据库连接中间件，提供：
- 注入数据库连接
- 上下文扩展

#### DataBaseTransactionWare
数据库事务中间件，提供：
- 事务支持
- 回滚机制
- 上下文扩展

### 类型定义

```typescript
type Connection = DataSource | QueryRunner;

declare module 'koa' {
  interface BaseContext {
    $typeorm_connection?: Connection;
    $typeorm_transacation_rollback?: (roll: () => unknown) => number;
  }
}
```

## 许可证

MIT 