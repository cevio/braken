import exitHook from 'async-exit-hook';
import Logger from '@braken/logger';
import { Context } from '@braken/injection';
import { Application } from '@braken/application';

export const scope = new Context();
export default (callback: (s: Context, logger: Logger) => Promise<unknown>) => {
  scope.use(Logger)
    .then(logger => {
      process.on('uncaughtException', e => logger.error(e));
      process.on('unhandledRejection', e => logger.error(e));
      process.on('uncaughtExceptionMonitor', e => logger.error(e));
      process.on('error', e => logger.error(e));

      callback(scope, logger)
        .then(() => {
          exitHook(exit => {
            Application.Terminate()
              .catch(e => logger.error(e))
              .finally(exit);
          })
          logger.silly('Bootstrap done!');
        })
        .catch(e => {
          logger.error(e);
          Application.Terminate()
            .catch(e => logger.error(e))
            .finally(() => process.exit(1));
        });
    })
    .catch(e => console.error(e));
}