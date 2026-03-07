# SaaS AI Template

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| API | Elysia (Bun-native) |
| Frontend | React 19 + Vite + Tailwind v4 |
| UI | shadcn/ui (24 components) + assistant-ui (chat) |
| Data fetching | TanStack Query + TanStack Table + TanStack Virtual |
| DB | PostgreSQL + Drizzle ORM + pgvector |
| Auth | Better Auth (email/password) + RBAC (4 roles, 8 permissions) |
| AI | Vercel AI SDK v6 (OpenAI primary, Anthropic fallback) |
| Observability | Sentry (API + Worker) + Langfuse (AI tracing) |
| Email | Brevo (Sendinblue) |
| Worker | PostgreSQL SKIP LOCKED job queue + croner |
| Monorepo | Bun workspaces |

## Structure

```
saas-ai-template/
├── packages/shared/     # DB schema, permissions (RBAC), tools, types
├── apps/api/            # Elysia API (auth, chat SSE, rate limiting, audit log)
├── apps/web/            # React SPA (Vite build → apps/api/public/)
├── apps/worker/         # Job queue consumer + cron scheduler
├── drizzle/migrations/  # Generated SQL migrations
└── scripts/             # CI migration runner
```

## Conventions

- **Langue** : code/logs in English
- **Imports** : `@saas-ai-template/shared/db/schema`, `@saas-ai-template/shared/permissions`, `@saas-ai-template/shared/tools`
- **DB** : `DATABASE_URL` for runtime, `DIRECT_DATABASE_URL` for drizzle-kit
- **Auth** : Better Auth with singular table names (`user`, `session`, `account`, `verification`)
- **API patterns** : `authGuard` middleware (Elysia derive scoped), `getDb()` lazy singleton
- **Worker patterns** : Eager DB singleton, `registerHandler()` + `startPolling()`
- **AI** : `callLLM()` with automatic fallback + Langfuse tracing
- **Pages** : All lazy-loaded with `React.lazy()` + `<Suspense>` in `App.tsx`
- **Toasts** : `import { toast } from "sonner"`
- **Tables** : `<DataTable>` component with sorting, selection, pagination
- **Theme** : `useTheme()` from Zustand store (light/dark/system)

## Key Patterns

### Rate Limiting
- General: 100 req/min per IP on all Elysia routes (`generalRateLimit` plugin)
- Auth: 5 req/min per IP on `/api/auth/*` routes (`withAuthRateLimit` wrapper)
- Config: `apps/api/src/lib/rate-limit.ts`

### Audit Log
- `createAuditLog({ userId, action, resourceType, resourceId, changes, request })` — fire-and-forget
- Table: `auditLogs` in schema (userId, action, resourceType, resourceId, changes jsonb, IP, UA)

### Event Bus (SSE)
- `publish(channel, payload)` — PostgreSQL NOTIFY
- `subscribe(channel)` — returns `ReadableStream<string>` for SSE endpoints

### RBAC
- 4 roles: `owner`, `admin`, `member`, `viewer`
- 8 permissions: `resources:read/write/delete`, `billing:manage`, `settings:manage`, `team:manage/invite`, `audit:read`
- `hasPermission(role, permission)` / `getPermissions(role)`

### Worker
- Exponential backoff on failure: `2^attempts * 60s`
- `wrapCron("name", fn)` — auto timing + error logging (+ Sentry if configured)
- 3 built-in crons: health-check (5min), cleanup-old-jobs (daily 3am), check-deadletters (weekdays 8am)

### Graceful Degradation
- Sentry, Langfuse, Brevo all work without config — log warning and skip if env vars missing

## How To

### Add a new page
1. Create `apps/web/src/pages/MyPage.tsx` — export named `MyPage`
2. Add lazy import in `App.tsx`: `const MyPage = lazy(() => import("@/pages/MyPage").then(m => ({ default: m.MyPage })))`
3. Add `<Route>` inside the `<AppLayout>` block

### Add a new API route
1. Create `apps/api/src/routes/my-route.ts` — export an Elysia plugin
2. Register in `apps/api/src/index.ts`: `.use(myRoute)`

### Add a new job type
1. Create handler in `apps/worker/src/handlers/my-handler.ts`
2. Register in `apps/worker/src/index.ts`: `registerHandler("my-job", myHandler)`
3. Enqueue from API: `INSERT INTO jobs (type, payload) VALUES ('my-job', '{...}')`

### Add a DB table
1. Add table in `packages/shared/src/db/schema.ts`
2. Run `bun run db:generate` then `bun run db:migrate`

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
| D014 | In-memory rate limiting (no Redis) — fits single-process Bun deployment |
| D015 | Vite manualChunks: vendor-react, vendor-tanstack, vendor-radix, vendor-ai |

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
