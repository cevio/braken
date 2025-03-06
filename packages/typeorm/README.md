# @braken/typeorm

Braken 框架的 TypeORM 集成模块，提供数据库连接和事务支持。

## 安装

```bash
pnpm add @braken/typeorm
```

## 特性

- TypeORM 连接管理
- 数据库事务支持
- 连接配置支持
- 错误处理
- 优雅关闭
- 依赖注入集成

## 使用示例

```typescript
import { Application } from '@braken/application';
import TypeORM from '@braken/typeorm';

// 配置数据库连接
TypeORM.set({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'test',
  entities: [User, Order],
  synchronize: true
});

// 使用数据库
@Application.Injectable
class MyService {
  @Application.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  async createUser(data: any) {
    // 使用事务
    return this.typeorm.transaction(async (runner, rollback) => {
      // 创建用户
      const user = await runner.manager.save(User, data);

      // 创建订单
      const order = await runner.manager.save(Order, {
        userId: user.id,
        amount: 100
      });

      // 如果出错，回滚事务
      rollback(() => {
        console.log('Transaction rolled back');
      });

      return { user, order };
    });
  }
}
```

## API

### TypeORM 类

主要的数据库客户端类，提供以下功能：

- TypeORM 连接管理
- 数据库事务支持
- 连接配置支持
- 错误处理
- 优雅关闭
- 依赖注入集成

### 静态方法

#### set
设置数据库配置：
```typescript
static set(options: DataSourceOptions)
```

#### transaction
执行事务：
```typescript
static async transaction<T>(
  datasource: DataSource,
  callback: (
    runner: QueryRunner,
    rollback: (roll: () => unknown | Promise<unknown>) => number
  ) => Promise<T>
)
```

### 实例属性

#### connection
数据库连接实例：
```typescript
public connection: DataSource
```

### 实例方法

#### transaction
执行事务：
```typescript
transaction<T>(
  callback: (
    runner: QueryRunner,
    rollback: (roll: () => unknown | Promise<unknown>) => number
  ) => Promise<T>
)
```

#### terminate
终止连接：
```typescript
async terminate()
```

## 配置选项

```typescript
interface DataSourceOptions {
  type: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  entities?: any[];
  synchronize?: boolean;
  // ... 更多选项
}
```

## 实现细节

- 使用 TypeORM 实现连接
- 支持数据库事务
- 支持连接配置
- 自动错误处理
- 优雅关闭支持
- 依赖注入集成

## 注意事项

- 需要正确配置连接参数
- 处理事务回滚
- 管理连接状态
- 处理连接错误
- 优化查询性能

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(TypeORM)
  private readonly typeorm: TypeORM;
}
```

## 许可证

MIT 