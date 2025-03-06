# @braken/json-schema

Braken 框架的 JSON Schema 模块，提供类型安全的 JSON Schema 定义和验证支持。

## 安装

```bash
pnpm add @braken/json-schema
```

## 特性

- JSON Schema 定义
- 类型安全
- 验证支持
- 引用支持
- 自定义类型
- 依赖注入集成

## 使用示例

```typescript
import { Application } from '@braken/application';
import Schema from '@braken/json-schema';

// 定义用户模式
const UserSchema = Schema.Object({
  id: Schema.Integer(),
  name: Schema.String(),
  email: Schema.String().format('email'),
  age: Schema.Integer().minimum(0).maximum(120),
  tags: Schema.Array(Schema.String()),
  address: Schema.Object({
    street: Schema.String(),
    city: Schema.String(),
    country: Schema.String()
  })
});

// 定义引用
const OrderSchema = Schema.Object({
  id: Schema.Integer(),
  userId: Schema.Integer(),
  items: Schema.Array(Schema.Object({
    productId: Schema.Integer(),
    quantity: Schema.Integer().minimum(1)
  })),
  user: Schema.Ref('User')
});

// 使用模式
@Application.Injectable
class MyService {
  @Application.Inject(Schema)
  private readonly schema: Schema;

  async validateUser(data: unknown) {
    return this.schema.validate(UserSchema, data);
  }
}
```

## API

### Schema 类

主要的 JSON Schema 类，提供以下功能：

- JSON Schema 定义
- 类型安全
- 验证支持
- 引用支持
- 自定义类型
- 依赖注入集成

### 静态方法

#### String
创建字符串模式：
```typescript
static String(): StringSchema
```

#### Integer
创建整数模式：
```typescript
static Integer(): IntegerSchema
```

#### Number
创建数字模式：
```typescript
static Number(): NumberSchema
```

#### Boolean
创建布尔模式：
```typescript
static Boolean(): BooleanSchema
```

#### Null
创建空值模式：
```typescript
static Null(): NullSchema
```

#### Object
创建对象模式：
```typescript
static Object(properties: Record<string, Schema>): ObjectSchema
```

#### Array
创建数组模式：
```typescript
static Array(items: Schema): ArraySchema
```

#### Ref
创建引用模式：
```typescript
static Ref(name: string): RefSchema
```

### 实例方法

#### validate
验证数据：
```typescript
validate(schema: Schema, data: unknown): boolean
```

#### format
设置格式：
```typescript
format(format: string): this
```

#### minimum
设置最小值：
```typescript
minimum(value: number): this
```

#### maximum
设置最大值：
```typescript
maximum(value: number): this
```

#### required
设置必填：
```typescript
required(): this
```

## 实现细节

- 使用 JSON Schema 规范
- 支持类型安全
- 支持验证
- 支持引用
- 支持自定义类型
- 支持依赖注入

## 注意事项

- 需要正确定义模式
- 处理验证错误
- 管理引用关系
- 处理自定义类型
- 优化性能

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(Schema)
  private readonly schema: Schema;
}
```

## 许可证

MIT 