import { Cron } from "croner";
import { startPolling, registerHandler } from "./queue";
import { wrapCron } from "./lib/cron-wrapper";

// Handlers
import { healthCheck } from "./handlers/health-check";
import { cleanupOldJobs } from "./handlers/cleanup-old-jobs";
import { checkDeadletters } from "./handlers/check-deadletters";

console.log("Worker starting...");

// ─── Register job handlers ──────────────────────────────────────────────────
// Add your handlers here:
// registerHandler("email", handleSendEmail);

// ─── Cron jobs (croner) ─────────────────────────────────────────────────────

const cronJobs = [
  // Health check every 5 minutes
  new Cron("*/5 * * * *", wrapCron("health-check", healthCheck)),

  // Cleanup old completed/dead jobs every day at 3am
  new Cron("0 3 * * *", wrapCron("cleanup-old-jobs", cleanupOldJobs)),

  // Dead-letter check every weekday at 8am
  new Cron("0 8 * * 1-5", wrapCron("check-deadletters", checkDeadletters)),
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
