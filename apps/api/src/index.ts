import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { chatRoute } from "./routes/chat";
import { sseRoute } from "./routes/sse";
import { auth } from "./lib/auth";
import { resolve } from "path";

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = resolve(import.meta.dir, "../public");

const app = new Elysia()
  // Health check (no DB required)
  .get("/api/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))

  // API routes
  .use(chatRoute)
  .use(sseRoute)

  // Auth routes (Better Auth) — .mount() strips prefix, basePath:"/" in auth config
  .mount("/api/auth", (request) => auth.handler(request))

  // Static files (Vite build output)
  .use(staticPlugin({ assets: PUBLIC_DIR, prefix: "/", alwaysStatic: true }))

  // SPA fallback: serve index.html for client-side routes
  .get("/*", () => Bun.file(resolve(PUBLIC_DIR, "index.html")))

  .listen(PORT);

console.log(`API running on http://localhost:${PORT}`);

export type App = typeof app;
