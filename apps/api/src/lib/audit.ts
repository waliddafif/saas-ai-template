import { getDb, schema } from "./db";

interface AuditLogParams {
  /** The authenticated user performing the action. */
  userId: string;
  /** Verb describing what happened, e.g. "CREATE", "UPDATE", "DELETE". */
  action: string;
  /** The type of resource affected, e.g. "conversation", "message". */
  resourceType: string;
  /** The ID of the resource affected. */
  resourceId: string;
  /** Key/value diff or snapshot relevant to the action. */
  changes?: Record<string, unknown>;
  /**
   * The incoming HTTP request, used to extract IP address and User-Agent.
   * Pass the Elysia `request` (standard Web API Request object).
   */
  request?: Request;
}

/**
 * Fire-and-forget audit log write.
 * Errors are caught and logged to stderr so they never break the main flow.
 */
export function createAuditLog(params: AuditLogParams): void {
  const db = getDb();

  const xff = params.request?.headers.get("x-forwarded-for");
  const ipAddress = params.request
    ? (params.request.headers.get("x-real-ip") ??
      (xff ? xff.split(",").at(-1)!.trim() : null) ??
      null)
    : null;
  const userAgent = params.request
    ? params.request.headers.get("user-agent")
    : null;

  db.insert(schema.auditLogs)
    .values({
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      changes: params.changes ?? null,
      ipAddress,
      userAgent,
    })
    .catch((err: unknown) => {
      console.error("Failed to write audit log", { error: err });
    });
}
