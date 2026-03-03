import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import * as schema from "@saas-ai-template/shared/db/schema";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  basePath: "/", // Elysia .mount("/api/auth") strips the prefix
  trustedOrigins: [
    "http://localhost:5173", // Vite dev
    "http://localhost:3000", // Same-origin prod
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema,
  }),
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh after 1 day
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
});
