# @braken/react

Braken 框架的 React 集成模块，提供基于 React 的前端应用开发支持。

## 安装

```bash
pnpm add @braken/react
```

## 特性

- React 应用集成
- 路由系统
- 中间件支持
- 状态管理
- 错误处理
- 请求处理
- 上下文管理

## 使用示例

```typescript
import { Application, Controller } from '@braken/react';

// 创建应用实例
const app = new Application('/app');

// 定义控制器
class HomeController extends Controller {
  render() {
    return <div>Welcome to Home</div>;
  }
}

// 定义用户控制器
class UserController extends Controller {
  render() {
    const { params } = app.useLocation();
    return <div>User: {params.id}</div>;
  }
}

// 注册路由
app.get('/', HomeController);
app.get('/user/:id', UserController);

// 添加全局中间件
app.use('global', (props, next) => {
  console.log('Global middleware');
  return next();
});

// 添加路由中间件
app.use('router', (props, next) => {
  console.log('Router middleware');
  return next();
});

// 添加错误处理组件
app.addStatusListener(404, ({ status, message }) => (
  <div>Page not found: {message}</div>
));

// 渲染应用
app.render(document.getElementById('root'));
```

## API

### Application 类

主要的应用类，提供以下功能：

- 路由管理
- 中间件系统
- 状态管理
- 错误处理
- 请求处理
- 上下文管理

#### 构造函数
```typescript
constructor(prefix: string = '/')
```

#### 路由方法
```typescript
get(path: string, controller: Controller)
post(path: string, controller: Controller)
put(path: string, controller: Controller)
delete(path: string, controller: Controller)
```

#### 中间件方法
```typescript
use(type: MiddlewareType, ...middleware: Middleware[])
```

#### 导航方法
```typescript
redirect(url: string)
replace(url: string)
reload()
```

#### 渲染方法
```typescript
render<T extends HTMLElement>(
  id: T,
  manifest: { path: string, controller: Controller }[] = [],
  notfound?: ReactNode
)
```

### Controller 类

控制器基类，提供以下功能：

- 页面渲染
- 中间件支持
- 生命周期钩子
- 状态管理

```typescript
class MyController extends Controller {
  render() {
    return <div>My Page</div>;
  }
}
```

### 中间件类型

```typescript
type MiddlewareType = 'global' | 'router';
type Middleware = (props: LocationProps, next: () => ReactNode) => ReactNode;
```

### 位置属性

```typescript
interface LocationProps {
  pathname: string;
  query: Record<string, string>;
  hash: string;
  params: Record<string, string>;
}
```

## 实现细节

- 使用 React Router 实现路由
- 支持中间件链式调用
- 支持错误边界处理
- 支持状态管理
- 支持上下文共享
- 支持生命周期管理

## 注意事项

- 需要正确配置路由
- 处理异步操作
- 管理组件状态
- 处理错误情况
- 优化性能

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(Request)
  private readonly request: Request;
}
```

## 许可证

MIT 