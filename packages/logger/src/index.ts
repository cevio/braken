import chalk from 'chalk';
import dayjs from 'dayjs';
import proc from 'proc-log';
import { Application } from '@braken/application';

@Application.Injectable
export default class Logger extends Application {
  private now() {
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    return chalk.gray('[' + time + ']');
  }
  public initialize() {
    const callback = (level: any, ...args: any[]) => {
      switch (level) {
        case 'error':
          console.log(this.now(), chalk.red(level), ...args);
          break;
        case 'info':
          console.log(this.now(), chalk.blue(level), ...args);
          break;
        case 'notice':
          console.log(this.now(), chalk.green(level), ...args);
          break;
        case 'http':
          console.log(this.now(), chalk.magenta(level), ...args);
          break;
        case 'warn':
          console.log(this.now(), chalk.yellow(level), ...args);
          break;
        case 'silly':
          console.log(this.now(), chalk.cyan(level), ...args);
          break;
        default:
          console.log(this.now(), ...args);
      }
    }

    process.on('log', callback);
    return () => process.off('log', callback);
  }

  public error(...args: any[]) {
    // @ts-ignore
    return proc.log.error(...args);
  }

  public info(...args: any[]) {
    // @ts-ignore
    return proc.log.info(...args);
  }

  public notice(...args: any[]) {
    // @ts-ignore
    return proc.log.notice(...args);
  }

  public http(...args: any[]) {
    // @ts-ignore
    return proc.log.http(...args);
  }
  public warn(...args: any[]) {
    // @ts-ignore
    return proc.log.warn(...args);
  }
  public silly(...args: any[]) {
    // @ts-ignore
    return proc.log.silly(...args);
  }
}