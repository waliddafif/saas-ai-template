import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Count dead-letter jobs and warn if any exist.
 */
export async function checkDeadletters(): Promise<void> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS count FROM jobs WHERE status = 'dead'
  `);

  const count = (result[0] as { count: number }).count;

  if (count > 0) {
    console.warn(`[check-deadletters] ${count} dead jobs found — manual review required`);
  } else {
    console.log("[check-deadletters] no dead jobs");
  }
}
