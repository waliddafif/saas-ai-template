import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  // ─── Add your seed data here ───────────────────────────────────────────────
  // Example:
  // await db.insert(schema.user).values({
  //   id: "seed-user-1",
  //   email: "admin@example.com",
  //   name: "Admin",
  // });

  console.log("Seed completed (no-op — customize in packages/shared/src/db/seed.ts)");
  await client.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
