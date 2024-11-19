import { Context } from '@braken/injection';
import { glob } from 'glob';
import { resolve } from 'node:path';

export async function load(
  suffix: string, directory: string, ctx: Context,
  callback?: (file: string, res: any) => unknown | Promise<unknown>
) {
  const files = await glob(`**/*.${suffix}.{ts,js}`, { cwd: directory });
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const target = await await import(resolve(directory, file));
    if (target.default) {
      const res = await ctx.use(target.default);
      if (typeof callback === 'function') {
        await Promise.resolve(callback(file, res));
      }
    }
  }
}