import * as Sentry from "@sentry/bun";

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn("SENTRY_DSN not set — Sentry disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.1,
  });

  console.log("Sentry initialized for worker");
}

export { Sentry };
