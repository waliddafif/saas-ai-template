/**
 * Wrap a cron handler with timing, logging, and error capture.
 * Returns a sync function suitable for croner's callback.
 */
export function wrapCron(name: string, handler: () => Promise<void>): () => void {
  return () => {
    const start = Date.now();
    console.log(`[cron] ${name} started`);

    handler()
      .then(() => {
        console.log(`[cron] ${name} completed in ${Date.now() - start}ms`);
      })
      .catch((error) => {
        console.error(`[cron] ${name} failed:`, error);
      });
  };
}
