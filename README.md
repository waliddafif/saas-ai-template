# SaaS AI Template

Starter template pour applications SaaS avec assistant IA intégré. Stack TypeScript full-stack avec Bun, Elysia, React, et Vercel AI SDK.

## Stack technique

- **Runtime** : Bun
- **API** : Elysia (framework Bun-natif)
- **Frontend** : React 19 + Vite + Tailwind CSS v4
- **UI** : shadcn/ui + assistant-ui (chat)
- **Base de données** : PostgreSQL + Drizzle ORM + pgvector
- **Auth** : Better Auth (email/password)
- **IA** : Vercel AI SDK v6 (OpenAI + fallback Anthropic)
- **Worker** : Job queue PostgreSQL SKIP LOCKED + croner

## Quick Start

```bash
# 1. Cloner et installer
git clone <repo-url> my-saas-app
cd my-saas-app
bun install

# 2. Configurer l'environnement
cp .env.example .env
# Remplir DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY

# 3. Créer la base et migrer
bun run db:migrate

# 4. Lancer en développement
bun run dev:api     # Terminal 1 — API sur :3000
bun run dev:web     # Terminal 2 — Vite sur :5173
bun run dev:worker  # Terminal 3 — Worker
```

## Structure

```
├── packages/shared/     # Schema DB, outils IA, types partagés
├── apps/api/            # API Elysia (auth, chat, SSE, static)
├── apps/web/            # SPA React (pages, composants, assistant-ui)
├── apps/worker/         # Job queue + crons
├── drizzle/migrations/  # Migrations SQL générées
└── scripts/             # Scripts CI
```

## À personnaliser

| Quoi | Où |
|------|-----|
| Schema DB | `packages/shared/src/db/schema.ts` |
| Outils IA (UI tools) | `packages/shared/src/tools/index.ts` |
| System prompt | `apps/api/src/routes/chat.ts` |
| Sidebar / navigation | `apps/web/src/components/AppLayout.tsx` |
| Pages | `apps/web/src/pages/` |
| Job handlers | `apps/worker/src/index.ts` |
| Cron jobs | `apps/worker/src/index.ts` |
| Branding | `apps/web/index.html` + `AppLayout.tsx` |

## Build production

```bash
bun run build           # Build web → copie dans api/public
bun run build:api       # Compile API en binaire standalone
bun run build:worker    # Compile Worker en binaire standalone
```

## Déploiement

```bash
# Migrer la DB
bun run db:deploy

# Ou via le script start (migre puis lance)
bun run start          # API
bun run start:worker   # Worker
```
