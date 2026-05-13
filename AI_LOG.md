# AI_LOG.md — TaskFlow MVP

Registro de prompts clave y decisiones técnicas tomadas con asistencia de IA.

---

## 📅 Sesión 1 — Arquitectura y Setup Inicial

### Prompt
> Construir una aplicación web completa de gestión de tareas con autenticación, CRUD de proyectos/tareas, asignación de usuarios, filtros avanzados y dashboard de productividad. Stack: Next.js 14, NestJS, PostgreSQL, Prisma, Docker.

### Decisiones tomadas
- **App Router de Next.js 14**: Route groups `(auth)` y `(dashboard)` para layouts separados sin prefijo de URL
- **NestJS modular**: Un módulo por dominio (auth, users, projects, tasks) siguiendo principio de responsabilidad única
- **Prisma schema**: Relaciones con `onDelete: Cascade` para mantener integridad referencial
- **JWT stateless**: No se requiere Redis ni session store — token en localStorage con Zustand persist

---

## 📅 Sesión 2 — Base de Datos y API

### Prompt
> Diseñar el schema de Prisma con User, Project, Task, Comment, Tag y ProjectMember con roles

### Schema resultante
```prisma
// 6 modelos: User, Project, ProjectMember, Task, Tag, Comment
// Enums: Role (ADMIN/MEMBER), TaskStatus (4), TaskPriority (4)
```

### Decisiones
- `ProjectMember` como tabla intermedia con `role` propio → permite roles por proyecto
- `Task.position` (Int) para ordenamiento en Kanban
- `onDelete: SetNull` en `Task.assigneeId` → tareas persisten si el usuario es eliminado

---

## 📅 Sesión 3 — Backend NestJS

### Prompt
> Implementar autenticación JWT con bcrypt, guards, y CRUD completo de proyectos y tareas con autorización por rol

### Respuesta clave
- `JwtAuthGuard` extendiendo `AuthGuard('jwt')` de Passport para proteger todos los endpoints
- `assertMember()` en TasksService: verifica membresía antes de cualquier operación
- `assertAdmin()` en ProjectsService: solo admins pueden modificar/eliminar proyectos
- ValidationPipe global con `whitelist: true` elimina propiedades no declaradas en DTOs

---

## 📅 Sesión 4 — Frontend Next.js

### Prompt
> Crear layout de dashboard con sidebar, páginas de auth con glassmorphism, Kanban board con 4 columnas, filtros avanzados y dashboard de productividad

### Decisiones de diseño
- **Dark theme**: CSS variables HSL en `globals.css` — facilita theming futuro
- **Glassmorphism**: `backdrop-filter: blur(12px)` + `rgba` backgrounds
- **Gradient border**: pseudo-elemento `::before` con `mask` para bordes degradados
- **Kanban sin librerías de drag&drop**: Botones de cambio de estado para MVP; drag&drop como mejora futura
- **React Query**: `staleTime: 60s` reduce requests innecesarios; invalidación optimista en mutaciones

---

## 📅 Sesión 5 — Testing

### Prompt
> Escribir 5 tests unitarios con Vitest y 5 tests E2E con Playwright cubriendo autenticación, CRUD y filtros

### Tests implementados

**Vitest (unitarios):**
1. `getInitials` — iniciales de nombre completo
2. `cn` merger — clases condicionales + deduplicación Tailwind
3. `STATUS_LABELS` — mapeo correcto de los 4 estados
4. `PRIORITY_LABELS` — mapeo de las 4 prioridades
5. `formatDate` — formato de fecha legible

**Playwright (E2E):**
1. Login con credenciales demo → redirect a dashboard
2. Registro de nuevo usuario
3. Creación de proyecto desde formulario inline
4. Kanban board muestra 4 columnas
5. Filtros de la página My Tasks

---

## 🔑 Decisiones Técnicas Clave

| Área | Decisión | Alternativa considerada |
|------|----------|------------------------|
| Auth | JWT en localStorage | HttpOnly cookies (más seguro en prod) |
| Estado global | Zustand | Redux Toolkit |
| Server state | React Query | SWR |
| Styling | Tailwind + CSS vars | CSS Modules |
| ORM | Prisma | DrizzleORM |
| Testing E2E | Playwright | Cypress |
| Runtime | **Bun** (backend + scripts Prisma en Docker) | Node solo en dev vía Nest CLI si hiciera falta |
| HTTP | **Fastify** (`@nestjs/platform-fastify`) | Express explícito descartado por requisito |

---

## 📅 Sesión 6 — Bun, Fastify, seed en Docker y README

### Prompt
> Completar huecos: Bun, seed tras migraciones en Docker, sin Express, capturas/README, demo Vercel, git semántico.

### Cambios
- **Fastify**: `NestFactory.create` con `FastifyAdapter`; dependencia `fastify` y `@nestjs/platform-fastify`.
- **Bun**: `backend/Dockerfile` con `oven/bun`, `bun.lock`, scripts `start:prod` y seed con `bun prisma/seed.ts`.
- **Docker**: servicio `migrate` ejecuta `docker:migrate` = `prisma migrate deploy && prisma db seed`.
- **README**: stack actualizado, sección capturas (`docs/screenshots/*.svg`), instrucciones Bun, commits convencionales, despliegue.
- **Vitest backend**: `passWithNoTests: true` hasta añadir tests de dominio en el API.

---

## ⚠️ Notas de Producción

1. Cambiar `JWT_SECRET` a un valor aleatorio fuerte (mínimo 32 chars)
2. Configurar CORS con el dominio real del frontend en `main.ts`
3. Agregar rate limiting con `@nestjs/throttler` en endpoints de auth
4. Migrar almacenamiento de JWT de `localStorage` a `httpOnly cookies` para mayor seguridad
5. Configurar `HTTPS` en producción (certificado SSL)
