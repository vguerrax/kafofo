import { execFileSync } from 'node:child_process';
export default function prepare() {
  execFileSync(process.execPath, ['--import', 'tsx', 'tests/prepare-recovery-browser.ts'], {
    cwd: 'apps/api',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
