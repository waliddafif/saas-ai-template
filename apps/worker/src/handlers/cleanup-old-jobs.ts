import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Delete completed and dead jobs older than 30 days.
 */
export async function cleanupOldJobs(): Promise<void> {
  const result = await db.execute(sql`
    DELETE FROM jobs
    WHERE status IN ('completed', 'dead')
      AND completed_at < NOW() - INTERVAL '30 days'
  `);

  console.log(`[cleanup-old-jobs] deleted ${result.length} old jobs`);
}
