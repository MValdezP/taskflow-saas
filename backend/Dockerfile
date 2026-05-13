FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile

COPY . .

RUN bun run prisma:generate
RUN bun run build

FROM oven/bun:1-slim AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3001

CMD ["bun", "dist/main.js"]
