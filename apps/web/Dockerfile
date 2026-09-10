# syntax=docker/dockerfile:1
# Build a partir da RAIZ do monorepo:  docker build -f apps/web/Dockerfile .

FROM node:20-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm ci

COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web

# NEXT_PUBLIC_* é embutido no bundle do cliente durante o build.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# ativa output: "standalone" no next.config (só aqui, não na Vercel/CI)
ENV BUILD_STANDALONE=true
RUN npm run build --workspace=web

FROM node:20-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# O output "standalone" traz o server.js e um node_modules mínimo.
# static/ e public/ não entram nele por padrão — copiamos à parte.
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
