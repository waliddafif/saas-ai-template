import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@saas-ai-template/shared/db/schema";

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }
    const client = postgres(connectionString);
    _db = drizzle(client, { schema });
  }
  return _db;
}

// Re-export for convenience (lazy init)
export { schema };
