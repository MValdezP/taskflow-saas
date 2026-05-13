# TaskFlow

**Modern task management for remote teams** — Next.js 14, NestJS (Fastify), PostgreSQL, Prisma y Docker.

## Features

- JWT Authentication (register / login)
- Project CRUD with color coding & member management
- Kanban board with 4 status columns (TODO → IN PROGRESS → IN REVIEW → DONE)
- Task management with priority, due dates, assignees & comments
- Advanced filters (status, priority, text search)
- Productivity dashboard with KPI cards and task distribution charts
- Team directory
- 9+ Vitest unit tests (frontend) + 5 Playwright E2E tests

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| State | Zustand + TanStack React Query |
| Backend | NestJS, **Fastify** (sin servidor Express propio), TypeScript, Passport JWT |
| Runtime (backend) | **Bun** — `bun install`, `bun run build`, `bun dist/main.js` en producción |
| Database | PostgreSQL 16, Prisma ORM |
| Testing | Vitest (unit), Playwright (E2E) |
| Infra | Docker Compose (`db` → `migrate` migraciones + **seed** → `backend` → `frontend`) |

## Live demo

Despliega el frontend en Vercel y apunta `NEXT_PUBLIC_API_URL` a tu API pública. Luego sustituye la URL en tu README o en `.env.example`:

- **Demo (placeholder):** `https://YOUR_PROJECT.vercel.app` — reemplaza por tu despliegue real.

## Quick Start (1 command)

### Prerequisites

- Docker & Docker Compose

```bash
git clone https://github.com/<TU_USUARIO>/taskflow.git
cd taskflow
docker-compose up --build
```

El servicio `migrate` ejecuta `prisma migrate deploy` y a continuación `prisma db seed` (usuarios demo, proyectos y tareas).

App URLs:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api

**Demo credentials:** `alice@taskflow.dev` / `password123`

---

## Local Development

### Prerequisites

- [Bun](https://bun.sh) (backend)
- Node.js 20+ (frontend; npm es suficiente)

### Backend

```bash
cd backend
bun install
cp ../.env.example .env
# Ajusta DATABASE_URL si usas Postgres local

bun run prisma:generate
bun run prisma:migrate
bun run prisma:seed
bun run start:dev        # http://localhost:3001 (Nest CLI + watch)
```

Producción local tras build:

```bash
bun run build
bun run start:prod
```

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local
# Ajusta NEXT_PUBLIC_API_URL si el backend no está en :3001

npm run dev              # http://localhost:3000
```

### Run Tests

```bash
# Unit tests (Vitest) — frontend
cd frontend && npm test

# E2E (Playwright) — requiere app en marcha (p. ej. docker-compose o dev)
cd frontend && npm run test:e2e
```

---

## Project Structure

```
taskflow/
├── docker-compose.yml          # db → migrate (migrate+seed) → backend → frontend
├── docs/screenshots/           # Ilustraciones / capturas para README
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── bun.lock
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── projects/
│       └── tasks/
└── frontend/
    ├── app/
    ├── components/ui/
    ├── hooks/
    ├── lib/
    ├── __tests__/
    └── e2e/
```

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js App Router** | Server components, nested layouts, file-based routing |
| **NestJS + Fastify** | Cumple la restricción de no usar Express como framework HTTP; Fastify es el adaptador oficial |
| **Bun en backend** | Runtime y gestor de paquetes pedidos en el briefing; Docker usa imagen `oven/bun` |
| **Prisma** | Type-safe DB client, migraciones y `db seed` integrado |
| **Zustand** | Auth mínima sin boilerplate de Redux |
| **React Query** | Estado servidor, caché e invalidaciones |
| **JWT** | API stateless, compatible con escalado horizontal |
| **Docker** | Un solo `docker-compose up --build` incluye datos demo tras el seed |

## Git & commits

Usa [Conventional Commits](https://www.conventionalcommits.org/) en ramas cortas y PRs en GitHub, por ejemplo:

- `feat(auth): add refresh token`
- `fix(tasks): correct filter query`
- `docs(readme): update deploy steps`

---

## Deployment

### Vercel (Frontend)

```bash
cd frontend && vercel --prod
```

Variables: `NEXT_PUBLIC_API_URL=https://tu-api-publica.example.com` (sin barra final).

### Backend + DB (Railway, Render, Fly, etc.)

1. Crea PostgreSQL y obtén `DATABASE_URL`.
2. Build: `bun install && bun run prisma:generate && bun run build`.
3. Start: `bun run start:prod` (o `bun dist/main.js`).
4. Migraciones: `bunx prisma migrate deploy` y seed opcional `bunx prisma db seed`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/projects` | List user projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Project + tasks |
| GET | `/api/tasks` | All tasks (with filters) |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task/status |
| GET | `/api/users/dashboard` | Aggregated stats |

---
