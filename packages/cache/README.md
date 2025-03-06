# @braken/cache

Braken 框架的缓存模块，提供多级缓存支持。

## 安装

```bash
pnpm add @braken/cache
```

## 特性

- 多级缓存支持
- 缓存同步
- 过期时间管理
- 缓存查找
- 缓存重写
- 依赖注入集成

## 使用示例

```typescript
import { Application } from '@braken/application';
import CacheServer from '@braken/cache';
import FileCache from '@braken/cache-file';
import IORedisCache from '@braken/cache-ioredis';

// 创建缓存实例
const fileCache = new FileCache();
const redisCache = new IORedisCache();

// 配置缓存服务器
CacheServer.set([fileCache, redisCache]);

// 使用缓存
@Application.Injectable
class MyService {
  @Application.Inject(CacheServer)
  private readonly cache: CacheServer;

  async getUser(id: string) {
    // 尝试从缓存读取
    const cached = await this.cache.read(`user:${id}`);
    if (cached) {
      return cached;
    }

    // 从数据库读取
    const user = await this.fetchUserFromDB(id);

    // 写入缓存
    await this.cache.write(`user:${id}`, user, Date.now() + 3600000);

    return user;
  }

  async updateUser(id: string, data: any) {
    // 更新数据库
    await this.updateUserInDB(id, data);

    // 更新缓存
    await this.cache.rewrite(`user:${id}`, data, Date.now() + 3600000, 2);
  }
}
```

## API

### CacheServer 类

主要的缓存服务器类，提供以下功能：

- 多级缓存管理
- 缓存同步
- 过期时间管理
- 缓存查找
- 缓存重写
- 依赖注入集成

### 静态方法

#### set
设置缓存配置：
```typescript
static set(props: CacheProps[])
```

### 实例方法

#### write
写入缓存：
```typescript
async write(key: string, value: any, expire?: number)
```

#### read
读取缓存：
```typescript
async read(key: string)
```

#### has
检查缓存是否存在：
```typescript
async has(key: string)
```

#### delete
删除缓存：
```typescript
async delete(key: string)
```

#### expire
获取过期时间：
```typescript
async expire(key: string)
```

#### find
查找缓存：
```typescript
async find(key: string)
```

#### rewrite
重写缓存：
```typescript
async rewrite(key: string, value: any, expire: number, i: number)
```

#### get
获取指定索引的缓存：
```typescript
get<T = any>(index: number): CacheProps<T>
```

## 实现细节

- 支持多级缓存
- 缓存同步机制
- 过期时间管理
- 缓存查找策略
- 缓存重写机制
- 依赖注入集成

## 注意事项

- 需要正确配置缓存
- 处理缓存同步
- 管理过期时间
- 处理缓存失效
- 优化缓存性能

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(CacheServer)
  private readonly cache: CacheServer;
}
```

## 许可证

MIT 