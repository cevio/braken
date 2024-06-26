import { readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directory = resolve(__dirname, '../packages');
const require = createRequire(__dirname);

const directories = readdirSync(directory);
const Versions = new Map();
const Files = new Set();

directories.forEach(dir => {
  const pkg = require(resolve(directory, dir, 'package.json'));
  Versions.set(pkg.name, pkg.version);
  Files.add(resolve(directory, dir));
})

for (const file of Files.values()) {
  const filePath = resolve(file, 'package.json');
  const pkg = require(filePath);
  const deps = pkg.dependencies || {};
  let i = 0;
  for (const key in deps) {
    if (Versions.has(key)) {
      const oldVersion = deps[key];
      const newVersion = Versions.get(key);
      if (oldVersion !== newVersion) {
        deps[key] = newVersion;
        i++;
      }
    }
  }
  if (i > 0) {
    pkg.dependencies = deps;
    writeFileSync(filePath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log('[+]', pkg.name);
  }
}