# @braken/websocket

Braken 框架的 WebSocket 模块，提供基于 Socket.IO 的实时通信支持。

## 安装

```bash
pnpm add @braken/websocket
```

## 特性

- Socket.IO 集成
- 命名空间支持
- 中间件支持
- 路由支持
- 依赖注入集成
- 自动加载

## 使用示例

```typescript
import { Application } from '@braken/application';
import WebSocket from '@braken/websocket';
import { NameSpace, Event } from '@braken/websocket';

// 配置 WebSocket 服务器
WebSocket.set({
  cors: {
    origin: '*'
  }
});

// 定义命名空间
@NameSpace('/chat')
class ChatNamespace {
  @Event('message')
  async onMessage(socket, message) {
    // 广播消息
    socket.nsp.emit('message', {
      user: socket.$params.userId,
      content: message
    });
  }

  @Event('join')
  async onJoin(socket) {
    // 加入聊天室
    socket.join('room');
    socket.nsp.to('room').emit('system', {
      user: socket.$params.userId,
      action: 'join'
    });
  }
}

// 使用 WebSocket
@Application.Injectable
class MyService {
  @Application.Inject(WebSocket)
  private readonly ws: WebSocket;

  async initialize() {
    // 加载命名空间
    await this.ws.load('./namespaces');
  }
}
```

## API

### WebSocket 类

主要的 WebSocket 服务器类，提供以下功能：

- Socket.IO 集成
- 命名空间支持
- 中间件支持
- 路由支持
- 依赖注入集成
- 自动加载

### 静态方法

#### set
设置 WebSocket 配置：
```typescript
static set(options: ServerOptions)
```

### 实例属性

#### io
Socket.IO 服务器实例：
```typescript
public io: Server
```

### 实例方法

#### load
加载命名空间：
```typescript
async load(directory: string, options: LoadNameSpaceProps = {})
```

#### connect
连接命名空间：
```typescript
async connect<T extends NameSpace>(
  namespace: IClass<T>,
  path: string,
  options: LoadNameSpaceProps
)
```

### 装饰器

#### @NameSpace
定义命名空间：
```typescript
@NameSpace(path: string)
```

#### @Event
定义事件处理器：
```typescript
@Event(event: string)
```

## 配置选项

```typescript
interface ServerOptions {
  cors?: {
    origin: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  };
  path?: string;
  serveClient?: boolean;
  connectTimeout?: number;
  // ... 更多选项
}
```

## 实现细节

- 使用 Socket.IO 实现通信
- 支持命名空间路由
- 支持中间件链
- 支持依赖注入
- 支持自动加载
- 支持错误处理

## 注意事项

- 需要正确配置 CORS
- 处理连接错误
- 管理命名空间
- 处理事件错误
- 优化性能

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(WebSocket)
  private readonly ws: WebSocket;
}
```

## 许可证

MIT 