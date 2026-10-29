# IntentDraft — Backend API

Node.js + **Fastify** + **Prisma** + **PostgreSQL** (hosted on **[Supabase](https://supabase.com/)**).

Contratto API con il frontend: [`../docs/product/planning/frontend-implementation-spec.md`](../docs/product/planning/frontend-implementation-spec.md) §8.  
Piano implementazione: [`../docs/product/planning/backend-implementation-plan.md`](../docs/product/planning/backend-implementation-plan.md).

## Prerequisiti

- Node.js 20+
- Progetto Supabase (Database → PostgreSQL)

## Supabase — connection string

1. Supabase Dashboard → **Project Settings** → **Database**.
2. Copia la connection string **URI** (modalità **Direct connection**, porta `5432`) in `DATABASE_URL` per sviluppo locale e migrazioni Prisma.
3. In produzione potrai usare il **Transaction pooler** (porta `6543`, parametro `?pgbouncer=true`) come `DATABASE_URL` runtime; per `prisma migrate` usa sempre la connessione **direct** (vedi [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)).

Esempio `.env`:

```env
DATABASE_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

> Sostituisci `[YOUR-PASSWORD]` con la password del database (non la anon key API).

## Setup

```bash
cd backend
cp .env.example .env
# modifica DATABASE_URL
npm install
npm run db:push    # prima sync schema su Supabase (vedi database-design.md §2.1)
npm run dev        # http://localhost:3001
```

### Schema: `db:push` vs migrazioni

| Scenario | Comando |
| -------- | ------- |
| Nuovo clone, DB vuoto | `npm run db:migrate:deploy` (applica `prisma/migrations/*`) oppure `npm run db:push` in dev |
| Modifica `schema.prisma` in team | `npm run db:migrate` → commit della cartella `prisma/migrations/` |
| DB già allineato con `db:push` (senza history) | Baseline: generare SQL con `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script -o prisma/migrations/<timestamp>_nome/migration.sql`, poi `npx prisma migrate resolve --applied <timestamp>_nome` |

La migrazione iniziale **`20260329220000_init_idt_schema`** è già in repo e marcata *applied* sull’istanza Supabase demo.

Verifica:

```bash
curl http://localhost:3001/api/health
# {"ok":true,"db":true}
```

## Script

| Comando | Descrizione |
| ------- | ----------- |
| `npm run dev` | API in watch mode |
| `npm run build` | Compila TypeScript → `dist/` |
| `npm run start` | Avvia build produzione |
| `npm run test` | Vitest |
| `npm run lint` | ESLint |
| `npm run db:generate` | `prisma generate` |
| `npm run db:push` | Sync schema su Supabase (dev) |
| `npm run db:migrate` | Migrazioni versionate |
| `npm run db:seed` | Seed (placeholder) |

## Frontend insieme

```bash
# dalla root del repo
npm run dev:all
```

Oppure:

```bash
# terminale 1
cd backend && npm run dev

# terminale 2
cd frontend && cp .env.example .env
# VITE_USE_MOCK=false
# VITE_API_URL=http://localhost:3001
npm run dev
```

## Fase corrente

**B0** — scaffold, health check, Prisma collegato a Supabase.  
**B1** — schema dominio applicato su Supabase (6 tabelle `idt_*`), migrazione `init_idt_schema`, health `db: true`.  
**B2** — auth email/password, cookie sessione, `GET/POST /api/auth/*`. Prossimo: **B3** conversazioni.
