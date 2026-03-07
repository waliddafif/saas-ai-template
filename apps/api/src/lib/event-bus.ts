import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

/** Dedicated postgres connection for LISTEN/NOTIFY (not pooled). */
function getListenSql(): ReturnType<typeof postgres> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is required");
    _sql = postgres(url, { max: 1 });
  }
  return _sql;
}

const MAX_PAYLOAD_BYTES = 7_500;

function serializePayload(payload: object): string {
  const str = JSON.stringify(payload);
  if (Buffer.byteLength(str, "utf8") <= MAX_PAYLOAD_BYTES) return str;
  return JSON.stringify({ truncated: true });
}

/**
 * Publish a notification on a postgres NOTIFY channel.
 * The channel name is arbitrary — callers define their own convention,
 * e.g. `user_${userId}` or `conversation_${conversationId}`.
 */
export async function publish(
  channel: string,
  payload: object
): Promise<void> {
  const sql = getListenSql();
  await sql.notify(channel, serializePayload(payload));
}

/**
 * Subscribe to a postgres LISTEN channel.
 * Returns a ReadableStream that emits raw payload strings on each NOTIFY.
 * The stream cancels the pg subscription when the consumer cancels it.
 *
 * Intended for use with SSE endpoints — pipe the stream directly into
 * an Elysia response with `new Response(stream, { headers: sseHeaders })`.
 */
export function subscribe(channel: string): ReadableStream<string> {
  let unlistenFn: (() => Promise<void>) | null = null;
  let ctrl: ReadableStreamDefaultController<string> | null = null;

  return new ReadableStream<string>({
    async start(controller) {
      ctrl = controller;
      const sql = getListenSql();
      const sub = await sql.listen(channel, (payload: string) => {
        try {
          ctrl?.enqueue(payload);
        } catch {
          // Stream already closed — ignore
        }
      });
      unlistenFn = sub.unlisten;
    },
    async cancel() {
      ctrl = null;
      if (unlistenFn) {
        await unlistenFn().catch(() => {});
        unlistenFn = null;
      }
    },
  });
}
