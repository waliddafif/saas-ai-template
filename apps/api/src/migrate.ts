import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "@saas-ai-template/shared/db/schema";
import { resolve } from "path";

const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.warn("No DATABASE_URL — skipping migrations");
  process.exit(0);
}

const sql = postgres(url, { max: 1 });

try {
  console.log("Enabling pgvector extension...");
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
  console.log("pgvector enabled.");
} catch {
  console.warn("pgvector not available — skipping (needed for embeddings)");
}

console.log("Running Drizzle migrations...");
const db = drizzle(sql, { schema });
const migrationsFolder = resolve(import.meta.dir, "../../../drizzle/migrations");
await migrate(db, { migrationsFolder });
console.log("Migrations complete.");

await sql.end();
