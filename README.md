# Braken

Braken 是一个现代化的 Node.js 框架，专注于提供高性能、可扩展和类型安全的应用程序开发体验。

## 特性

- 🚀 **高性能** - 基于 Koa 和 Socket.IO 的高性能服务器
- 📦 **模块化** - 基于依赖注入的模块化架构
- 🔒 **类型安全** - 完整的 TypeScript 支持
- 🎯 **开发体验** - 优雅的 API 设计和开发体验
- 🔄 **实时通信** - 内置 WebSocket 支持
- 📝 **API 文档** - 自动生成 OpenAPI/Swagger 文档
- 💾 **数据持久化** - 支持 TypeORM 和 Redis
- 🎨 **前端集成** - 内置 React 支持

## 安装

```bash
# 使用 pnpm 安装
pnpm add @braken/application @braken/http @braken/websocket @braken/typeorm @braken/ioredis @braken/bootstrap

# 或使用 yarn
yarn add @braken/application @braken/http @braken/websocket @braken/typeorm @braken/ioredis @braken/bootstrap

# 或使用 npm
npm install @braken/application @braken/http @braken/websocket @braken/typeorm @braken/ioredis @braken/bootstrap
```

## 快速开始

```typescript
import { Application } from '@braken/application';
import { Http } from '@braken/http';
import { WebSocket } from '@braken/websocket';
import { TypeORM } from '@braken/typeorm';
import { IoRedis } from '@braken/ioredis';
import bootstrap from '@braken/bootstrap';

// 创建应用
@Application.Injectable
class MyApp extends Application {
  @Application.Inject(Http)
  private readonly http: Http;

  @Application.Inject(WebSocket)
  private readonly ws: WebSocket;

  @Application.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Application.Inject(IoRedis)
  private readonly redis: IoRedis;

  async initialize() {
    // 配置 HTTP 服务器
    this.http.set({
      port: 3000,
      keys: ['your-secret-key']
    });

    // 配置 WebSocket 服务器
    this.ws.set({
      cors: {
        origin: '*'
      }
    });

    // 配置数据库连接
    this.typeorm.set({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'test',
      entities: [User, Order],
      synchronize: true
    });

    // 配置 Redis 连接
    this.redis.set({
      host: 'localhost',
      port: 6379,
      password: 'your-password',
      db: 0
    });

    // 加载控制器
    await this.http.load('./controllers');
    await this.ws.load('./namespaces');

    return () => {
      // 清理逻辑
    };
  }
}

// 使用 bootstrap 启动应用
bootstrap(async (scope, logger) => {
  // 注册应用
  scope.use(MyApp);

  // 启动 HTTP 服务器
  await scope.get(Http).listen(3000);

  logger.info('Server started on port 3000');
});
```

## 核心模块

### [@braken/application](packages/application/README.md)
核心应用模块，提供应用程序生命周期管理和事件系统。

```typescript
class MyApp extends Application {
  @Application.State
  private count = 0;

  @Application.Event('increment')
  onIncrement() {
    this.count++;
  }

  @Application.Watch('count')
  onCountChange(newValue: number, oldValue: number) {
    console.log(`Count changed from ${oldValue} to ${newValue}`);
  }
}
```

### [@braken/http](packages/http/README.md)
HTTP 服务器模块，基于 Koa 提供 Web 服务支持。

```typescript
@Controller('/users')
class UserController {
  @Get('/:id')
  async getUser(@Path('id') id: string) {
    return { id, name: 'John' };
  }

  @Post('/')
  async createUser(@Body() data: any) {
    return { id: 1, ...data };
  }
}
```

### [@braken/websocket](packages/websocket/README.md)
WebSocket 模块，基于 Socket.IO 提供实时通信支持。

```typescript
@NameSpace('/chat')
class ChatNamespace {
  @Event('message')
  async onMessage(socket, message) {
    socket.nsp.emit('message', {
      user: socket.$params.userId,
      content: message
    });
  }
}
```

### [@braken/typeorm](packages/typeorm/README.md)
TypeORM 集成模块，提供数据库连接和事务支持。

```typescript
@Application.Injectable
class UserService {
  @Application.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  async createUser(data: any) {
    return this.typeorm.transaction(async (runner) => {
      return runner.manager.save(User, data);
    });
  }
}
```

### [@braken/ioredis](packages/ioredis/README.md)
Redis 客户端模块，提供高性能的缓存支持。

```typescript
@Application.Injectable
class CacheService {
  @Application.Inject(IoRedis)
  private readonly redis: IoRedis;

  async set(key: string, value: any) {
    await this.redis.connection.set(key, JSON.stringify(value));
  }
}
```

## 生态系统

- [@braken/http-swagger](packages/http-swagger) - OpenAPI/Swagger 文档生成
- [@braken/json-schema](packages/json-schema) - JSON Schema 定义和验证
- [@braken/cache](packages/cache) - 多级缓存支持
- [@braken/cache-file](packages/cache-file) - 文件系统缓存
- [@braken/cache-ioredis](packages/cache-ioredis) - Redis 缓存
- [@braken/logger](packages/logger) - 日志系统
- [@braken/react](packages/react) - React 前端集成
- [@braken/bootstrap](packages/bootstrap) - 应用启动引导
- [@braken/injection](packages/injection) - 依赖注入系统

## 最佳实践

### 项目结构

```
src/
  ├── controllers/     # HTTP 控制器
  ├── namespaces/      # WebSocket 命名空间
  ├── services/        # 业务服务
  ├── entities/        # 数据库实体
  ├── middlewares/     # 中间件
  ├── schemas/         # JSON Schema
  └── app.ts          # 应用入口
```

### 依赖注入

```typescript
@Application.Injectable
class UserService {
  @Application.Inject(Http)
  private readonly http: Http;

  @Application.Inject(WebSocket)
  private readonly ws: WebSocket;
}
```

### 错误处理

```typescript
@Controller('/users')
class UserController {
  @Get('/:id')
  async getUser(@Path('id') id: string) {
    try {
      const user = await this.userService.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error('Failed to get user:', error);
      throw error;
    }
  }
}
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

MIT