import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Basic health check: verify DB connectivity and report worker status.
 */
export async function healthCheck(): Promise<void> {
  const start = Date.now();
  await db.execute(sql`SELECT 1`);
  const latencyMs = Date.now() - start;

  console.log(
    `[health-check] DB ok (${latencyMs}ms) | pid=${process.pid} uptime=${Math.round(process.uptime())}s mem=${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
  );
}
