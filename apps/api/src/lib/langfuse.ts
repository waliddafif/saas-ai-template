import { Langfuse } from "langfuse";

let _langfuse: Langfuse | null = null;

/**
 * Get Langfuse singleton. Returns null if not configured.
 * Graceful degradation: all callers must use optional chaining.
 */
export function getLangfuse(): Langfuse | null {
  if (_langfuse !== undefined && _langfuse !== null) return _langfuse;

  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;

  if (!secretKey || !publicKey) {
    console.warn("Langfuse keys not set — tracing disabled");
    _langfuse = null;
    return null;
  }

  _langfuse = new Langfuse({
    secretKey,
    publicKey,
    baseUrl: process.env.LANGFUSE_BASE_URL ?? "https://cloud.langfuse.com",
  });

  console.log("Langfuse initialized");
  return _langfuse;
}

/**
 * Flush pending Langfuse events. Call on server shutdown.
 */
export async function flushLangfuse(): Promise<void> {
  if (_langfuse) {
    await _langfuse.flushAsync();
  }
}
