# syntax=docker/dockerfile:1
# Build a partir da RAIZ do monorepo:  docker build -f apps/api/Dockerfile .

# ---- deps (todas, para compilar) ----
FROM node:20-alpine AS build
WORKDIR /repo

# manifests primeiro: só reinstala quando as dependências mudam
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm ci

COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api

# gera o Prisma Client e compila o TypeScript para apps/api/dist
RUN npm run build --workspace=@kanbix/api

# ---- deps de produção (limpas) ----
FROM node:20-alpine AS deps-prod
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm ci --omit=dev

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
ENV PORT=3333

COPY --from=deps-prod /repo/node_modules ./node_modules
COPY --from=deps-prod /repo/package.json ./package.json
COPY --from=build /repo/packages/shared-types ./packages/shared-types
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/dist ./apps/api/dist

WORKDIR /repo/apps/api
# regenera o client contra as deps de produção
RUN npx prisma generate

EXPOSE 3333
# aplica as migrations pendentes e sobe o servidor
CMD ["npm", "run", "start:prod"]
