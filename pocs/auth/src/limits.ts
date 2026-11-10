import type pg from 'pg';
import { LabError } from './policies.js';
export interface Limit {
  events: number[];
  blockedUntil: number;
}
export async function readLimit(client: pg.PoolClient, key: string): Promise<Limit> {
  const result = await client.query(
    'select events, "blockedUntil" from auth_poc.limits where key=$1',
    [key],
  );
  return result.rows[0]
    ? { events: result.rows[0].events, blockedUntil: Number(result.rows[0].blockedUntil) }
    : { events: [], blockedUntil: 0 };
}
export async function writeLimit(client: pg.PoolClient, key: string, value: Limit) {
  await client.query(
    'insert into auth_poc.limits (key,events,"blockedUntil") values($1,$2,$3) on conflict(key) do update set events=$2,"blockedUntil"=$3',
    [key, JSON.stringify(value.events), value.blockedUntil],
  );
}
export async function consumeLimit(
  client: pg.PoolClient,
  key: string,
  maximum: number,
  window: number,
  now: number,
) {
  await client.query('select pg_advisory_xact_lock(hashtext($1))', ['limit:' + key]);
  const value = await readLimit(client, key);
  const events = value.events.filter((t) => t > now - window);
  if (events.length >= maximum) throw new LabError(429, 'TRY_LATER');
  await writeLimit(client, key, { events: [...events, now], blockedUntil: 0 });
}
