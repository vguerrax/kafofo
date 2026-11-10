import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  HistoryAction,
  HistoryDetails,
  HistoryPage,
  HistoryTargetDetails,
} from '@kafofo/contracts';
import { AuthError, accountDisplayNames, type PlatformAccessOptions } from '../platform/public.js';
import { createListAccess } from './access.js';
const badCursor = () =>
  new AuthError(
    400,
    'INVALID_HISTORY_CURSOR',
    'Página de histórico inválida. Volte aos eventos mais recentes.',
  );
export function createHistoryService(options: PlatformAccessOptions) {
  const { run } = createListAccess(options);
  const sign = (payload: string) =>
    createHmac('sha256', options.secret)
      .update('kitanda-history:' + payload)
      .digest('base64url');
  function decode(value: string, listId: string): { at: string; id: string } | null {
    try {
      if (value.length > 1024) throw badCursor();
      const [body, signature, ...extra] = value.split('.');
      if (!body || !signature || extra.length) throw badCursor();
      const expected = Buffer.from(sign(body)),
        received = Buffer.from(signature);
      if (expected.length !== received.length || !timingSafeEqual(expected, received))
        throw badCursor();
      const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
        listId?: unknown;
        at?: unknown;
        id?: unknown;
      };
      if (
        data.listId !== listId ||
        typeof data.at !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(data.at) ||
        typeof data.id !== 'string' ||
        !/^[0-9a-f-]{36}$/.test(data.id)
      )
        throw badCursor();
      return { at: data.at, id: data.id };
    } catch {
      throw badCursor();
    }
  }
  return (
    h: Headers,
    listId: string,
    input: { cursor?: string; limit?: number } = {},
  ): Promise<HistoryPage> =>
    run(
      h,
      listId,
      'read',
      async (c) => {
        const limit = input.limit ?? 20;
        if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw badCursor();
        const cursor = input.cursor ? decode(input.cursor, listId) : null;
        const rows = (
          await c.query<{
            id: string;
            listId: string;
            action: HistoryAction;
            actorId: string;
            at: string;
            details: HistoryDetails;
          }>(
            'select e.id,e."listId",e.action,e."actorId",to_char(e."createdAt" at time zone \'UTC\',\'YYYY-MM-DD"T"HH24:MI:SS.US"Z"\') as at,e.details from kitanda.history_events e where e."listId"=$1 and ($2::timestamptz is null or (e."createdAt",e.id)<($2::timestamptz,$3::uuid)) order by e."createdAt" desc,e.id desc limit $4',
            [listId, cursor?.at ?? null, cursor?.id ?? null, limit + 1],
          )
        ).rows;
        const page = rows.slice(0, limit),
          targets = page.length
            ? (
                await c.query<{
                  eventId: string;
                  itemId: string;
                  details: HistoryTargetDetails | null;
                }>(
                  'select t."eventId",t."itemId",case when t."redactedAt" is not null or i.id is null or i."deletedAt"<=clock_timestamp()-interval \'720 hours\' then null else t.details end as details from kitanda.history_targets t left join kitanda.items i on i.id=t."itemId" and i."listId"=$2 where t."eventId"=any($1::uuid[]) order by t."itemId"',
                  [page.map((e) => e.id), listId],
                )
              ).rows
            : [];
        const last = page.at(-1);
        const actors = page.length
          ? await accountDisplayNames(c, [...new Set(page.map((e) => e.actorId))])
          : [];
        const payload = last
          ? Buffer.from(JSON.stringify({ listId, at: last.at, id: last.id })).toString('base64url')
          : '';
        return {
          events: page.map((e) => ({
            id: e.id,
            listId: e.listId,
            action: e.action,
            actor: {
              id: e.actorId,
              name: actors.find((a) => a.id === e.actorId)?.name ?? 'Conta indisponível',
            },
            occurredAt: e.at,
            details: e.details,
            targets: targets
              .filter((t) => t.eventId === e.id)
              .map(({ itemId, details }) => ({ itemId, details })),
          })),
          nextCursor: rows.length > limit ? payload + '.' + sign(payload) : null,
        };
      },
      true,
    );
}
