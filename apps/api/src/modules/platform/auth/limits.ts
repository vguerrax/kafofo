import type pg from 'pg';
import { limited } from './policies.js';
interface Limit {
  events: number[];
  blockedUntil: number;
}
export async function readLimit(client: pg.PoolClient, key: string): Promise<Limit> {
  const record = (
    await client.query('select events,"blockedUntil" from platform.auth_limits where key=$1', [key])
  ).rows[0];
  return record
    ? { events: record.events, blockedUntil: Number(record.blockedUntil) }
    : { events: [], blockedUntil: 0 };
}
export async function writeLimit(
  client: pg.PoolClient,
  key: string,
  value: Limit,
  expiresAt: number,
) {
  await client.query(
    'insert into platform.auth_limits(key,events,"blockedUntil","expiresAt") values($1,$2,$3,$4) on conflict(key) do update set events=$2,"blockedUntil"=$3,"expiresAt"=$4',
    [
      key,
      JSON.stringify(value.events),
      value.blockedUntil,
      Math.max(expiresAt, value.blockedUntil),
    ],
  );
}
export function blocked(value: Limit, now: number) {
  return value.blockedUntil > now ? limited((value.blockedUntil - now) / 1000) : null;
}
export async function fail(client: pg.PoolClient, key: string, state: Limit, now: number) {
  const events = [...state.events.filter((at) => at > now - 900000), now];
  const blockedUntil = events.length >= 5 ? now + 900000 : 0;
  await writeLimit(client, key, { events, blockedUntil }, now + 900000);
  return blockedUntil ? limited(900) : null;
}
export async function consumeOrigin(
  client: pg.PoolClient,
  key: string,
  maximum: number,
  now: number,
) {
  const state = await readLimit(client, key);
  const events = state.events.filter((at) => at > now - 60000);
  if (events.length >= maximum) throw limited((events[0]! + 60000 - now) / 1000);
  await writeLimit(client, key, { events: [...events, now], blockedUntil: 0 }, now + 60000);
}
