# @braken/cache-ioredis

Braken 框架的 Redis 缓存实现，基于 IORedis 提供高性能的分布式缓存支持。

## 安装

```bash
pnpm add @braken/cache-ioredis
```

## 特性

- 基于 IORedis 的高性能缓存实现
- 支持分布式缓存
- 支持过期时间设置
- 支持 JSON 序列化
- 支持键前缀管理
- 依赖注入集成

## 使用示例

```typescript
import { Application } from '@braken/application';
import IORedisCache from '@braken/cache-ioredis';
import { IORedis } from '@braken/ioredis';

// 设置缓存前缀
IORedisCache.prefix('my-app');

// 创建缓存实例
const cache = new IORedisCache();

// 写入缓存
await cache.write('user:1', { id: 1, name: 'John' }, Date.now() + 3600000); // 1小时后过期

// 读取缓存
const user = await cache.read('user:1');

// 检查缓存是否存在
const exists = await cache.has('user:1');

// 获取过期时间
const expireTime = await cache.expire('user:1');

// 删除缓存
await cache.delete('user:1');
```

## API

### IORedisCache 类

主要的缓存实现类，提供以下功能：

- 缓存读写
- 过期时间管理
- 键前缀管理
- 依赖注入集成

### 静态方法

#### prefix
设置缓存键前缀：
```typescript
static prefix(value: string)
```

### 实例方法

#### write
写入缓存：
```typescript
async write(key: string, value: any, time: number = 0)
```

#### read
读取缓存：
```typescript
async read(key: string)
```

#### expire
获取过期时间：
```typescript
async expire(key: string)
```

#### delete
删除缓存：
```typescript
async delete(key: string)
```

#### has
检查缓存是否存在：
```typescript
async has(key: string)
```

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(IORedisCache)
  private readonly cache: IORedisCache;
}
```

## 许可证

MIT 