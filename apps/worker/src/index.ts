import { Cron } from "croner";
import { startPolling, registerHandler } from "./queue";

console.log("Worker starting...");

// ─── Register job handlers ──────────────────────────────────────────────────
// Add your handlers here:
// registerHandler("email", handleSendEmail);
// registerHandler("cleanup", handleCleanup);

// ─── Example cron jobs ──────────────────────────────────────────────────────

const cronJobs = [
  // Cleanup old completed/dead jobs every day at 3am
  new Cron("0 3 * * *", () => {
    console.log("[cron] cleanup-old-jobs triggered");
    // TODO: DELETE FROM jobs WHERE status IN ('completed','dead') AND completed_at < NOW() - INTERVAL '30 days'
  }),

  // Health check every 5 minutes
  new Cron("*/5 * * * *", () => {
    console.log("[cron] health-check OK");
  }),
];

console.log(`${cronJobs.length} cron jobs registered`);

// ─── Start job polling ──────────────────────────────────────────────────────

startPolling().catch((error) => {
  console.error("Fatal worker error:", error);
  process.exit(1);
});

// Graceful shutdown: stop cron jobs
process.on("SIGTERM", () => {
  cronJobs.forEach((job) => job.stop());
});
