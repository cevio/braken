# @braken/ioredis

Braken 框架的 Redis 客户端模块，提供基于 IORedis 的 Redis 连接支持。

## 安装

```bash
pnpm add @braken/ioredis
```

## 特性

- Redis 连接管理
- 连接配置支持
- 错误处理
- 自动重连
- 优雅关闭
- 依赖注入集成

## 使用示例

```typescript
import { Application } from '@braken/application';
import IoRedis from '@braken/ioredis';

// 配置 Redis 连接
IoRedis.set({
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  db: 0
});

// 使用 Redis
@Application.Injectable
class MyService {
  @Application.Inject(IoRedis)
  private readonly redis: IoRedis;

  async doSomething() {
    // 使用 Redis 连接
    await this.redis.connection.set('key', 'value');
    const value = await this.redis.connection.get('key');
  }
}
```

## API

### IoRedis 类

主要的 Redis 客户端类，提供以下功能：

- Redis 连接管理
- 连接配置支持
- 错误处理
- 自动重连
- 优雅关闭
- 依赖注入集成

### 静态方法

#### set
设置 Redis 配置：
```typescript
static set(options: RedisOptions)
```

### 实例属性

#### connection
Redis 连接实例：
```typescript
public connection: ioRedis
```

## 配置选项

```typescript
interface RedisOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryStrategy?: (times: number) => number | null;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  // ... 更多选项
}
```

## 实现细节

- 使用 IORedis 实现连接
- 支持连接配置
- 自动错误处理
- 支持自动重连
- 优雅关闭支持
- 依赖注入集成

## 注意事项

- 需要正确配置连接参数
- 处理连接错误
- 管理连接状态
- 处理重连策略
- 优化连接性能

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(IoRedis)
  private readonly redis: IoRedis;
}
```

## 许可证

MIT 