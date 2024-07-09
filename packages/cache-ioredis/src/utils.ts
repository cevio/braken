export function formatPathKey(key: string) {
  const path = key.replace(/\//g, ':');
  if (path.startsWith(':')) return path.substring(1);
  return path;
}