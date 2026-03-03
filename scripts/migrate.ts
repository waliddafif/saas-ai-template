import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../packages/shared/src/db/schema";

const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL or DIRECT_DATABASE_URL required");
}

async function run() {
  const sql = postgres(url!, { max: 1 });

  console.log("Enabling pgvector extension...");
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
  console.log("pgvector enabled.");

  console.log("Running Drizzle migrations...");
  const db = drizzle(sql, { schema });
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  console.log("Migrations complete.");

  await sql.end();
}

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
