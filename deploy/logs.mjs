import { setInterval } from 'node:timers';
import process from 'node:process';
import {
  mkdirSync,
  chownSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  truncateSync,
  unlinkSync,
  chmodSync,
} from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = '/logs';
const maxBytes = 256 * 1024 * 1024;
const day = 86400000;
export function maintainLogs(root, now = Date.now(), maxBytes = 256 * 1024 * 1024) {
  const statePath = `${root}/rotation.json`;
  let state;
  try {
    state = JSON.parse(readFileSync(statePath, 'utf8'));
  } catch {
    state = { since: now };
  }
  const files = ['api', 'postgres', 'caddy'].flatMap((dir) =>
    readdirSync(`${root}/${dir}`)
      .filter((name) => /\.(log|json)$/.test(name))
      .map((name) => `${root}/${dir}/${name}`),
  );
  for (const file of files) {
    const stat = statSync(file);
    if (stat.size && (now - state.since >= day || stat.size > 10 * 1024 * 1024)) {
      const name = file.slice(root.length + 1).replaceAll('/', '-');
      copyFileSync(file, `${root}/archive/${state.since}-${now}-${name}`);
      truncateSync(file);
    }
  }
  if (now - state.since >= day) state.since = now;
  writeFileSync(statePath, JSON.stringify(state), { mode: 0o600 });
  const archives = readdirSync(`${root}/archive`)
    .sort()
    .map((name) => ({
      path: `${root}/archive/${name}`,
      at: Number(name.split('-')[0]),
      size: statSync(`${root}/archive/${name}`).size,
    }));
  let size = archives.reduce((total, file) => total + file.size, 0);
  for (const file of archives) {
    if (now - file.at >= 30 * day || size > maxBytes) {
      unlinkSync(file.path);
      size -= file.size;
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href && process.argv[2] === 'init') {
  for (const [name, uid] of [
    ['api', 1000],
    ['postgres', 999],
    ['caddy', 0],
    ['archive', 0],
  ]) {
    mkdirSync(`${root}/${name}`, { recursive: true, mode: 0o700 });
    chownSync(`${root}/${name}`, uid, uid);
    chmodSync(`${root}/${name}`, 0o700);
  }
} else if (
  import.meta.url === pathToFileURL(process.argv[1] ?? '').href &&
  process.argv[2] === 'watch'
) {
  const rotate = () => maintainLogs(root, Date.now(), maxBytes);
  rotate();
  setInterval(rotate, 60000);
}
