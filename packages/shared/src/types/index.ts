// ─── Job Queue Types ─────────────────────────────────────────────────────────

export type JobType =
  | "email"
  | "cleanup"
  | "health_check";

export interface JobPayload {
  type: JobType;
  data: Record<string, unknown>;
}

// ─── AI Types ────────────────────────────────────────────────────────────────

export interface AIUsageRecord {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  toolName?: string;
  latencyMs?: number;
}
