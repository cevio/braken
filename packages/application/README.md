# @braken/application

Braken 框架的核心应用模块，提供应用程序生命周期管理和事件系统。

## 安装

```bash
pnpm add @braken/application
```

## 特性

- 应用程序生命周期管理
- 事件系统
- 状态管理
- 依赖注入集成
- 优雅关闭
- 自动清理

## 使用示例

```typescript
import { Application } from '@braken/application';

// 创建应用
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

  async initialize() {
    // 初始化逻辑
    return () => {
      // 清理逻辑
    };
  }
}

// 使用应用
const app = new MyApp();
await app.initialize();

// 触发事件
app.$emit('increment');

// 终止应用
await app.$end();
```

## API

### Application 类

主要的应用基类，提供以下功能：

- 生命周期管理
- 事件系统
- 状态管理
- 依赖注入集成
- 优雅关闭
- 自动清理

### 静态装饰器

#### @Injectable
标记可注入的类：
```typescript
@Application.Injectable
```

#### @Event
定义事件处理器：
```typescript
@Application.Event(event: string)
```

#### @State
定义状态属性：
```typescript
@Application.State
```

#### @Watch
监听状态变化：
```typescript
@Application.Watch(key: string | symbol)
```

### 实例属性

#### $event
事件发射器：
```typescript
public readonly $event: EventEmitter
```

#### $terminate
终止回调：
```typescript
public $terminate?: EffectCallback
```

#### $terminated
终止状态：
```typescript
public $terminated = false
```

### 实例方法

#### initialize
初始化应用：
```typescript
abstract initialize(): Terminater
```

#### $end
终止应用：
```typescript
async $end()
```

#### $emit
触发事件：
```typescript
$emit<T extends keyof this>(key: T, ...args: any[])
```

### 静态方法

#### Terminate
终止所有应用：
```typescript
static Terminate()
```

## 实现细节

- 使用 EventEmitter 实现事件系统
- 支持状态管理和监听
- 支持依赖注入
- 支持优雅关闭
- 支持自动清理
- 支持生命周期管理

## 注意事项

- 需要正确实现 initialize 方法
- 处理资源清理
- 管理事件监听
- 处理状态变化
- 优化性能

## 依赖注入

```typescript
@Application.Injectable
class MyService {
  @Application.Inject(Logger)
  private readonly logger: Logger;
}
```

## 许可证

MIT