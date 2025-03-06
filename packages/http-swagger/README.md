# @braken/http-swagger

Braken 框架的 HTTP Swagger 插件，提供 OpenAPI/Swagger 文档生成支持。

## 安装

```bash
pnpm add @braken/http-swagger
```

## 特性

- OpenAPI/Swagger 文档生成
- 装饰器驱动的 API 文档
- 自动参数类型推导
- 支持多种参数类型
- JSON Schema 集成
- 自动定义加载

## 使用示例

```typescript
import { Controller } from '@braken/http';
import Swagger from '@braken/http-swagger';
import { t } from '@braken/json-schema';

// 创建 Swagger 实例
const swagger = new Swagger({
  users: '用户管理',
  orders: '订单管理'
});

// 定义响应类型
const UserSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  email: t.String()
});

// 定义控制器
@swagger.Controller('用户管理', '用户相关的 API 接口', 'users')
@swagger.ContentType('application/json')
@swagger.ResponseType('application/json')
class UserController extends Controller {
  @swagger.Parameter('id', 'path', t.Number())
  @swagger.Response(200, UserSchema)
  async getUser(ctx) {
    // ...
  }

  @swagger.Parameter('user', 'body', UserSchema)
  @swagger.Response(201, UserSchema)
  async createUser(ctx) {
    // ...
  }
}

// 生成文档
const docs = swagger.toJSON();
```

## API

### Swagger 类

主要的 Swagger 文档生成类，提供以下功能：

- 参数定义
- 响应类型定义
- 控制器文档
- 自动定义加载
- 文档生成

### 装饰器

#### @Parameter
定义 API 参数：
```typescript
@swagger.Parameter(name: string, inwhere: SwaggerParameterInWhere, value: JSONSchemaObject)
```

#### @ContentType
定义请求内容类型：
```typescript
@swagger.ContentType(...types: string[])
```

#### @ResponseType
定义响应内容类型：
```typescript
@swagger.ResponseType(...types: string[])
```

#### @Response
定义响应结构：
```typescript
@swagger.Response(code: number, value: JSONSchemaObject)
```

#### @Controller
定义控制器文档：
```typescript
@swagger.Controller(summary: string, description: string, ...tags: string[])
```

### 类型定义

```typescript
type SwaggerParameterInWhere = 
  | "query"    // URL 查询参数
  | "header"   // 请求头参数
  | "path"     // 路径参数
  | "cookie"   // Cookie 参数
  | "formData" // 表单数据
  | "body";    // 请求体
```

## 自动定义加载

```typescript
// 自动加载定义文件
await swagger.autoLoadDefinitons('./definitions');
```

## 许可证

MIT 