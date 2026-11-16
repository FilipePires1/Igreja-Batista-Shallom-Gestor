FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY banco-de-dados/ibscn-api/package.json banco-de-dados/ibscn-api/package-lock.json ./
RUN npm ci

COPY banco-de-dados/ibscn-api/ ./
RUN npx prisma generate --config prisma7.config.ts && npm run build

FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl sqlite3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma7.config.ts ./
COPY --from=build /app/tsconfig.json ./

RUN mkdir -p /app/data \
    && useradd --create-home --uid 10001 app \
    && chown -R app:app /app

USER app

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --config prisma7.config.ts && node dist/src/main.js"]
