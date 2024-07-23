export function formatPathKey(key: string, prefix: string = '') {
  const path = (prefix + key).replace(/\//g, ':');
  if (path.startsWith(':')) return path.substring(1);
  return path;
}