# SaaS AI Template

Production-ready starter template for SaaS applications with a built-in AI assistant. Full-stack TypeScript monorepo with Bun, Elysia, React, and Vercel AI SDK.

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Bun |
| API | Elysia (Bun-native) |
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| UI | shadcn/ui (24 components) + assistant-ui (chat) |
| Data fetching | TanStack Query + TanStack Table + TanStack Virtual |
| Database | PostgreSQL + Drizzle ORM + pgvector |
| Auth | Better Auth (email/password) + RBAC (4 roles, 8 permissions) |
| AI | Vercel AI SDK v6 (OpenAI + fallback Anthropic) |
| Observability | Sentry (API + Worker) + Langfuse (AI tracing) |
| Email | Brevo (Sendinblue) |
| Worker | Job queue (PostgreSQL SKIP LOCKED) + croner |

## Features

- **AI chat** with streaming (SSE), tool calling, and assistant-ui components
- **RBAC** with 4 roles (owner/admin/member/viewer) and 8 generic permissions
- **Audit log** with automatic IP/user-agent tracking
- **Event bus** via PostgreSQL NOTIFY/LISTEN with SSE `subscribe()` for real-time updates
- **Rate limiting** — 100 req/min global, 5 req/min on auth routes, proper `429` + `Retry-After` headers
- **Worker** with exponential backoff, health-check, dead letter detection, and old job cleanup
- **Theme** support (light/dark/system) with localStorage persistence
- **Demo mode** banner with Zustand store
- **Lazy loading** all pages with `React.lazy()` + Suspense
- **Vite chunking** — manual splits for react, tanstack, radix, ai vendors
- **Error boundary** with fallback UI
- **Graceful degradation** — Sentry, Langfuse, Brevo all work without config (warning log + skip)

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/waliddafif/saas-ai-template.git my-saas-app
cd my-saas-app
bun install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY

# 3. Create database and migrate
bun run db:migrate

# 4. Start development
bun run dev:api     # Terminal 1 — API on :3000
bun run dev:web     # Terminal 2 — Vite on :5173
bun run dev:worker  # Terminal 3 — Worker
```

## Structure

```
├── packages/shared/     # DB schema, AI tools, types, permissions
├── apps/api/            # Elysia API (auth, chat, SSE, rate limiting, audit)
├── apps/web/            # React SPA (pages, 24 shadcn components, assistant-ui)
├── apps/worker/         # Job queue + crons (health-check, cleanup, dead letters)
├── drizzle/migrations/  # Generated SQL migrations
└── scripts/             # CI scripts
```

## Customize

| What | Where |
|------|-------|
| DB schema | `packages/shared/src/db/schema.ts` |
| Roles & permissions | `packages/shared/src/permissions.ts` |
| AI tools (UI tools) | `packages/shared/src/tools/index.ts` |
| System prompt | `apps/api/src/routes/chat.ts` |
| Rate limits | `apps/api/src/lib/rate-limit.ts` |
| Email templates | `apps/api/src/lib/email.ts` |
| Sidebar / navigation | `apps/web/src/components/AppLayout.tsx` |
| Pages | `apps/web/src/pages/` |
| Theme config | `apps/web/src/lib/themeStore.ts` |
| Job handlers | `apps/worker/src/index.ts` |
| Cron jobs | `apps/worker/src/index.ts` |
| Branding | `apps/web/index.html` + `AppLayout.tsx` |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Auth session secret |
| `OPENAI_API_KEY` | Yes | Primary LLM provider |
| `ANTHROPIC_API_KEY` | No | Fallback LLM provider |
| `BREVO_API_KEY` | No | Email sending (logs to console if missing) |
| `SENTRY_DSN` | No | Error tracking (disabled if missing) |
| `LANGFUSE_PUBLIC_KEY` | No | AI tracing (disabled if missing) |
| `LANGFUSE_SECRET_KEY` | No | AI tracing (disabled if missing) |

## Production Build

```bash
bun run build           # Build web → copy to api/public
bun run build:api       # Compile API to standalone binary
bun run build:worker    # Compile Worker to standalone binary
```

## Deploy

```bash
# Migrate the database
bun run db:deploy

# Or use the start script (migrates then launches)
bun run start          # API
bun run start:worker   # Worker
```
