# Deploy do Kanbix

Três serviços, ligados por variáveis de ambiente:

```
  Navegador
     │  NEXT_PUBLIC_API_URL
     ▼
  Web (Vercel)  ──────▶  API (Render)  ──────▶  Postgres (Neon)
                CORS_ORIGIN            DATABASE_URL
```

A ordem importa: **Neon → Render → Vercel → volta no Render** (para o CORS).

---

## 1. Banco — Neon

1. https://neon.tech → **New Project** (`kanbix`, região próxima do Render).
2. Em **Connection string**, copie a **direct connection** (a que **não** tem
   `-pooler` no host). Guarde — é o `DATABASE_URL`.
   - Por quê a direta: `prisma migrate deploy` roda no boot da API e não passa
     por PgBouncer. Como a API é um processo único no Render, não precisamos do
     pooler.
3. As migrations são aplicadas automaticamente pela API no primeiro deploy
   (`start:prod` = `prisma migrate deploy && node dist/server.js`).

---

## 2. API — Render

**Opção A — Blueprint (usa o `render.yaml` do repo):**

1. https://render.com → **New** → **Blueprint** → conecte o repositório.
2. O Render lê o `render.yaml` e cria o serviço `kanbix-api`.
3. Preencha as env vars marcadas como "sync: false":
   - `DATABASE_URL` → a connection string direta do Neon
   - `CORS_ORIGIN` → deixe em branco por enquanto (passo 4)
   - `JWT_SECRET` → o Render gera sozinho
4. **Create** → o primeiro build leva alguns minutos (imagem Docker + Prisma).
5. Quando ficar verde, teste: `https://kanbix-api-XXXX.onrender.com/health`
   deve responder `{"status":"ok"}`.

**Opção B — manual:** New → Web Service → repo → Runtime **Docker** →
Dockerfile Path `apps/api/Dockerfile` → as mesmas env vars acima →
Health Check Path `/health`.

> **Free tier:** o serviço dorme após ~15 min sem tráfego; a primeira request
> depois disso leva ~30 s para acordar.

Anote a URL final da API — ex.: `https://kanbix-api-XXXX.onrender.com`.

---

## 3. Web — Vercel

1. https://vercel.com → **Add New** → **Project** → importe o repositório.
2. **Root Directory:** `apps/web` (a Vercel detecta o npm workspace e instala
   a partir da raiz sozinha).
3. Framework: **Next.js** (detectado).
4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://kanbix-api-XXXX.onrender.com/api`
     (a URL do Render **+ `/api`**)
5. **Deploy.**
6. Anote a URL final — ex.: `https://kanbix.vercel.app`.

> `NEXT_PUBLIC_*` é embutido no bundle **no build**. Se mudar essa variável
> depois, precisa **redeployar** na Vercel.

---

## 4. Fechar o círculo — CORS no Render

1. Volte ao serviço `kanbix-api` no Render → **Environment**.
2. `CORS_ORIGIN` = a URL da Vercel, **sem barra no fim** —
   ex.: `https://kanbix.vercel.app`
3. **Save** → o Render redeploya.

---

## 5. Verificação

1. Abra a URL da Vercel → `/login` deve carregar.
2. **Criar conta** → deve autenticar e cair em `/workspaces`.
3. Se o cadastro falhar com erro de rede: confira no DevTools se as requests
   vão para a URL certa da API, e se o Render não está dormindo.
4. Se falhar com erro de CORS: `CORS_ORIGIN` no Render tem que bater
   **exatamente** com a origem da Vercel (protocolo + host, sem path, sem `/`).

---

## Notas

- **Preview deployments da Vercel** (URLs por branch) têm origem diferente da
  produção → o CORS vai barrá-los. Para liberar, `CORS_ORIGIN` aceita lista
  separada por vírgula: `https://kanbix.vercel.app,https://kanbix-git-*.vercel.app`
  (o Render não faz glob; para previews, adicione a URL exata quando precisar).
- **Migrations novas:** ao dar merge na `main`, o Render redeploya e roda
  `prisma migrate deploy` de novo (idempotente).
- **Rodar tudo local em container:** `docker compose --profile full up --build`
  (web em `:3000`, api em `:3333`).
