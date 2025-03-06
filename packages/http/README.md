# @braken/http

Braken 框架的 HTTP 模块，提供基于 Koa 的 Web 服务器支持。

## 安装

```bash
pnpm add @braken/http
```

## 特性

- Koa 集成
- 路由系统
- 中间件支持
- 控制器支持
- 插件系统
- 依赖注入集成
- 自动加载

## 使用示例

```typescript
import { Application } from '@braken/application';
import Http from '@braken/http';
import { Controller, Get, Post, Body, Query, Path } from '@braken/http';

// 配置 HTTP 服务器
Http.set({
  port: 3000,
  keys: ['your-secret-key']
});

// 定义控制器
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

// 使用 HTTP 服务器
@Application.Injectable
class MyService {
  @Application.Inject(Http)
  private readonly http: Http;

  async initialize() {
    // 加载控制器
    await this.http.load('./controllers');
  }
}
```

## API

### Http 类

主要的 HTTP 服务器类，提供以下功能：

- Koa 集成
- 路由系统
- 中间件支持
- 控制器支持
- 插件系统
- 依赖注入集成

### 静态方法

#### set
设置 HTTP 配置：
```typescript
static set(options: HttpProps)
```

### 实例属性

#### koa
Koa 应用实例：
```typescript
public koa: Koa
```

#### app
路由实例：
```typescript
public app: Instance
```

#### server
HTTP 服务器实例：
```typescript
public server: Server
```

### 实例方法

#### use
使用插件：
```typescript
use<T extends Plugin>(plugin: IPlugin<T>)
```

#### load
加载控制器：
```typescript
async load(directory: string, options: LoadControllerProps = {})
```

#### connect
连接控制器：
```typescript
async connect<T extends Controller>(
  controller: IClass<T>,
  path: string,
  options: LoadControllerProps
)
```

#### disconnect
断开控制器：
```typescript
disconnect(controller: IClass)
```

### 装饰器

#### @Controller
定义控制器：
```typescript
@Controller(path: string)
```

#### @Get
定义 GET 路由：
```typescript
@Get(path: string)
```

#### @Post
定义 POST 路由：
```typescript
@Post(path: string)
```

#### @Body
获取请求体：
```typescript
@Body()
```

#### @Query
获取查询参数：
```typescript
@Query(name: string)
```

#### @Path
获取路径参数：
```typescript
@Path(name: string)
```

## 配置选项

```typescript
interface HttpProps {
  port: number;
  keys?: string[];
  ignoreDuplicateSlashes?: boolean;
  ignoreTrailingSlash?: boolean;
  maxParamLength?: number;
  allowUnsafeRegex?: boolean;
  caseSensitive?: boolean;
}
```

## 实现细节

- 使用 Koa 实现服务器
- 使用 FindMyWay 实现路由
- 支持中间件链
- 支持依赖注入
- 支持自动加载
- 支持插件系统

## 注意事项

- 需要正确配置端口
- 处理路由冲突
- 管理中间件顺序
- 处理请求错误
- 优化性能

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(Http)
  private readonly http: Http;
}
```

## 许可证

MIT 