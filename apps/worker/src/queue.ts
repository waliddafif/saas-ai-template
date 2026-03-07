import { db } from "./db";
import { sql } from "drizzle-orm";

const WORKER_ID = `worker-${process.pid}-${Date.now()}`;
const POLL_INTERVAL_MS = 1_000;

interface Job {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
}

type JobHandler = (job: Job) => Promise<void>;

const handlers = new Map<string, JobHandler>();
let isShuttingDown = false;
let currentJob: Job | null = null;

export function registerHandler(type: string, handler: JobHandler) {
  handlers.set(type, handler);
}

async function pollJob(): Promise<Job | null> {
  const result = await db.execute(sql`
    UPDATE jobs
    SET status = 'processing',
        started_at = NOW(),
        locked_by = ${WORKER_ID},
        attempts = attempts + 1
    WHERE id = (
      SELECT id FROM jobs
      WHERE status = 'pending'
        AND visible_at <= NOW()
      ORDER BY priority DESC, created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, type, payload, attempts, max_attempts
  `);

  if (result.length === 0) return null;

  const row = result[0] as Record<string, unknown>;
  return {
    id: row.id as string,
    type: row.type as string,
    payload: row.payload as Record<string, unknown>,
    attempts: row.attempts as number,
    maxAttempts: row.max_attempts as number,
  };
}

async function completeJob(jobId: string, result: unknown) {
  await db.execute(sql`
    UPDATE jobs
    SET status = 'completed', result = ${JSON.stringify(result)}::jsonb, completed_at = NOW()
    WHERE id = ${jobId}
  `);
  await db.execute(
    sql`NOTIFY job_complete, ${JSON.stringify({ jobId, status: "completed" })}`
  );
}

async function failJob(job: Job, error: string) {
  const isDead = job.attempts >= job.maxAttempts;

  if (isDead) {
    await db.execute(sql`
      UPDATE jobs SET status = 'dead', error = ${error}, completed_at = NOW()
      WHERE id = ${job.id}
    `);
  } else {
    await db.execute(sql`
      UPDATE jobs SET status = 'pending', error = ${error}, visible_at = NOW() + (${Math.pow(2, job.attempts) * 60} || ' seconds')::interval
      WHERE id = ${job.id}
    `);
  }
}

async function handleJob(job: Job) {
  const handler = handlers.get(job.type);
  if (!handler) {
    console.error(`No handler for job type: ${job.type}`);
    await failJob(job, `No handler for job type: ${job.type}`);
    return;
  }

  try {
    currentJob = job;
    await handler(job);
    await completeJob(job.id, { success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`Job ${job.id} (${job.type}) failed:`, msg);
    await failJob(job, msg);
  } finally {
    currentJob = null;
  }
}

export async function startPolling() {
  console.log(`Worker ${WORKER_ID} starting job polling`);

  while (!isShuttingDown) {
    try {
      const job = await pollJob();
      if (job) {
        await handleJob(job);
      } else {
        await Bun.sleep(POLL_INTERVAL_MS);
      }
    } catch (error) {
      console.error("Polling error:", error);
      await Bun.sleep(POLL_INTERVAL_MS * 5);
    }
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  isShuttingDown = true;

  if (currentJob) {
    console.log(`Requeueing current job: ${currentJob.id}`);
    await db.execute(sql`
      UPDATE jobs SET status = 'pending', visible_at = NOW() + INTERVAL '5 minutes'
      WHERE id = ${currentJob.id}
    `);
  }

  process.exit(0);
});
