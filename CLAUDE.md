# SaaS AI Template

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| API | Elysia (Bun-native) |
| Frontend | React 19 + Vite + Tailwind v4 |
| UI | shadcn/ui (new-york) + assistant-ui |
| DB | PostgreSQL + Drizzle ORM + pgvector |
| Auth | Better Auth (email/password, sessions) |
| AI | Vercel AI SDK v6 (OpenAI primary, Anthropic fallback) |
| Worker | PostgreSQL SKIP LOCKED job queue + croner |
| Monorepo | Bun workspaces |

## Structure

```
saas-ai-template/
├── packages/shared/     # DB schema, tools, types (shared by api + worker)
├── apps/api/            # Elysia API + auth + chat + SSE + static serving
├── apps/web/            # React SPA (Vite build → apps/api/public/)
├── apps/worker/         # Job queue consumer + cron scheduler
├── drizzle/migrations/  # Generated SQL migrations
└── scripts/             # CI migration runner
```

## Conventions

- **Langue** : UI en français, code/logs en anglais
- **Imports** : `@saas-ai-template/shared/db/schema`, `@saas-ai-template/shared/tools`
- **DB** : `DATABASE_URL` for runtime, `DIRECT_DATABASE_URL` for drizzle-kit
- **Auth** : Better Auth with singular table names (`user`, `session`, `account`, `verification`)
- **API patterns** : `authGuard` middleware (Elysia derive scoped), `getDb()` lazy singleton
- **Worker patterns** : Eager DB singleton, `registerHandler()` + `startPolling()`
- **AI** : `callLLM()` with automatic fallback, `stepCountIs(3)` default stop condition

## Decisions

| ID | Decision |
|----|----------|
| D001 | Bun monorepo with hoisted linker (bun#23615 workaround) |
| D002 | PostgreSQL-only job queue (no Redis dependency) |
| D003 | pgvector for agent memory embeddings (1536 dims, OpenAI compatible) |
| D004 | Better Auth over NextAuth (Elysia-native, no Next.js coupling) |
| D005 | Elysia .mount() for auth (strips prefix, basePath:"/") |
| D006 | Tailwind v4 with @tailwindcss/vite plugin (no PostCSS config) |
| D007 | shadcn new-york style, oklch color space |
| D008 | assistant-ui for chat interface (thread, markdown, attachments) |
| D009 | AI SDK v6 with DefaultChatTransport (not useChat hook) |
| D010 | Vite proxy /api → localhost:3000 in dev |
| D011 | SPA fallback: Elysia serves index.html for unmatched routes |
| D012 | Two DB URLs: DATABASE_URL (pooled) + DIRECT_DATABASE_URL (migrations) |
| D013 | UI tools return `{ rendered: true }` — rendering handled client-side |

## Commands

```bash
bun run dev          # Start all apps in dev mode
bun run dev:api      # API only (hot reload)
bun run dev:web      # Vite dev server
bun run dev:worker   # Worker (watch mode)
bun run build        # Build web → copy to api/public
bun run typecheck    # Type check all packages
bun run db:generate  # Generate migration from schema changes
bun run db:migrate   # Apply migrations (local)
bun run db:seed      # Run seed script
bun run db:deploy    # CI migration runner (scripts/migrate.ts)
```
