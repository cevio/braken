# @braken/cache-file

Braken 框架的文件系统缓存实现，提供基于文件系统的本地缓存支持。

## 安装

```bash
pnpm add @braken/cache-file
```

## 特性

- 基于文件系统的本地缓存实现
- 支持过期时间管理
- 自动文件清理
- JSON 序列化
- 内存缓存加速
- 依赖注入集成

## 使用示例

```typescript
import { Application } from '@braken/application';
import FileCache from '@braken/cache-file';

// 设置缓存目录
FileCache.set('./cache');

// 创建缓存实例
const cache = new FileCache();

// 写入缓存
await cache.write('/user/1', { id: 1, name: 'John' }, Date.now() + 3600000); // 1小时后过期

// 读取缓存
const user = await cache.read('/user/1');

// 检查缓存是否存在
const exists = cache.has('/user/1');

// 获取过期时间
const expireTime = cache.expire('/user/1');

// 删除缓存
await cache.delete('/user/1');
```

## API

### FileCache 类

主要的缓存实现类，提供以下功能：

- 缓存读写
- 过期时间管理
- 文件系统管理
- 内存缓存加速
- 依赖注入集成

### 静态方法

#### set
设置缓存目录：
```typescript
static set(directory: string)
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
expire(key: string)
```

#### delete
删除缓存：
```typescript
async delete(key: string)
```

#### has
检查缓存是否存在：
```typescript
has(key: string)
```

## 实现细节

- 使用 JSON 文件存储缓存数据
- 支持路径格式的键名
- 自动创建目录结构
- 定期清理过期文件
- 使用内存缓存加速访问
- 支持文件系统监控

## 注意事项

- 需要确保缓存目录有写入权限
- 键名会被转换为文件路径
- 所有值都会被 JSON 序列化
- 过期时间使用毫秒为单位
- 文件系统操作是异步的

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(FileCache)
  private readonly cache: FileCache;
}
```

## 许可证

MIT 