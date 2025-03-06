# @braken/bootstrap

Braken 框架的启动引导模块，提供应用程序的启动和优雅关闭支持。

## 安装

```bash
pnpm add @braken/bootstrap
```

## 特性

- 应用程序启动引导
- 优雅关闭支持
- 全局错误处理
- 日志系统集成
- 依赖注入集成
- 进程生命周期管理

## 使用示例

```typescript
import bootstrap from '@braken/bootstrap';
import { Http } from '@braken/http';
import { Application } from '@braken/application';

// 创建 HTTP 服务器
const http = new Http();

// 启动应用程序
bootstrap(async (scope, logger) => {
  // 注册 HTTP 服务器
  scope.use(Http);

  // 启动 HTTP 服务器
  await http.listen(3000);

  logger.info('Server started on port 3000');
});
```

## API

### bootstrap 函数

主要的启动引导函数，提供以下功能：

- 应用程序启动
- 错误处理
- 优雅关闭
- 日志系统集成
- 依赖注入集成

```typescript
bootstrap(callback: (scope: Context, logger: Logger) => Promise<unknown>)
```

### 错误处理

自动处理以下错误事件：

- `uncaughtException`
- `unhandledRejection`
- `uncaughtExceptionMonitor`
- `error`

### 优雅关闭

使用 `async-exit-hook` 实现优雅关闭：

- 等待应用程序终止
- 清理资源
- 关闭连接
- 保存状态

## 实现细节

- 使用依赖注入管理服务
- 集成日志系统
- 处理进程信号
- 支持异步启动
- 支持优雅关闭
- 错误日志记录

## 注意事项

- 需要正确处理异步操作
- 确保资源正确释放
- 处理启动失败情况
- 配置适当的日志级别
- 实现优雅关闭逻辑

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