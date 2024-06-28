import exitHook from 'async-exit-hook';
import Logger from '@braken/logger';
import { Context } from '@braken/injection';
import { Application } from '@braken/application';

export const scope = new Context();
export default (callback: (s: Context) => Promise<unknown>) => {
  scope.use(Logger)
    .then(logger => {
      callback(scope)
        .then(() => {
          exitHook(exit => {
            Application.Terminate()
              .catch(e => logger.error(e))
              .finally(exit);
          })
        })
        .catch(e => {
          logger.error(e);
          return Application.Terminate()
            .finally(() => process.exit(1));
        })
        .catch(e => logger.error(e));
    })
    .catch(e => console.error(e));
}