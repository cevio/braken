# @braken/logger

Braken 框架的日志模块，提供彩色控制台日志输出支持。

## 安装

```bash
pnpm add @braken/logger
```

## 特性

- 彩色日志输出
- 时间戳支持
- 多级别日志
- 进程日志集成
- 依赖注入集成
- 自动清理

## 使用示例

```typescript
import { Application } from '@braken/application';
import Logger from '@braken/logger';

// 创建日志实例
const logger = new Logger();

// 记录不同级别的日志
logger.error('错误信息');
logger.info('普通信息');
logger.notice('通知信息');
logger.http('HTTP 请求');
logger.warn('警告信息');
logger.silly('调试信息');

// 使用依赖注入
@Application.Injectable
class MyService {
  @Application.Inject(Logger)
  private readonly logger: Logger;

  async doSomething() {
    this.logger.info('开始执行任务');
    try {
      // 执行任务
      this.logger.notice('任务执行成功');
    } catch (error) {
      this.logger.error('任务执行失败:', error);
    }
  }
}
```

## API

### Logger 类

主要的日志类，提供以下功能：

- 彩色日志输出
- 时间戳支持
- 多级别日志
- 进程日志集成
- 依赖注入集成

### 日志级别

#### error
记录错误信息：
```typescript
error(...args: any[])
```

#### info
记录普通信息：
```typescript
info(...args: any[])
```

#### notice
记录通知信息：
```typescript
notice(...args: any[])
```

#### http
记录 HTTP 请求：
```typescript
http(...args: any[])
```

#### warn
记录警告信息：
```typescript
warn(...args: any[])
```

#### silly
记录调试信息：
```typescript
silly(...args: any[])
```

## 实现细节

- 使用 chalk 实现彩色输出
- 使用 dayjs 格式化时间
- 使用 proc-log 处理进程日志
- 支持依赖注入
- 自动清理事件监听
- 支持多级别日志

## 日志颜色

- error: 红色
- info: 蓝色
- notice: 绿色
- http: 洋红色
- warn: 黄色
- silly: 青色
- 时间戳: 灰色

## 注意事项

- 需要正确处理异步操作
- 避免记录敏感信息
- 合理使用日志级别
- 处理日志清理
- 配置适当的日志格式

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