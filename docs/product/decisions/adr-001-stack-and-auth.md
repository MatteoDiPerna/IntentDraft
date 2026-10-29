# ADR-001 — Stack applicativo, auth e ORM

**Stato:** `Accepted` (2026-10-25)  
**Contesto:** multi-utente futuro, localhost, template UI scelto dal founder

---

## Decisione 1 — Architettura FE / BE (aggiornamento OQ-001)

**Non** usare monolith Next.js: il template UI scelto è **Vite + React + TypeScript** ([react-typescript-template](https://github.com/luismalamoc/react-typescript-template)).

| Layer        | Scelta                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| **Frontend** | Vite, React, TypeScript, Radix UI, Tailwind — adattato da template sopra |
| **Backend**  | API **Node.js** (Fastify o Express) + **Prisma** + **MySQL**             |
| **Repo**     | Monorepo consigliato: `frontend/` + `backend/` (+ `docs/`)               |

**Motivazione (founder + engineer):**

- Rispetta il template visivo senza riscriverlo in App Router.
- Confine chiaro API ↔ UI: utile con molti utenti, team separati, deploy indipendente in futuro.
- Il backend concentra auth, tenancy (`user_id`), upload e (dopo) LLM — un solo posto per segreti e policy.

**Alternative scartate:** Next monolith (incompatibile con template Vite); Python FastAPI (second stack da mantenere).

---

## Decisione 2 — Sessioni (OQ-014)

**Cookie httpOnly `Secure` (in prod) + tabella MySQL `sessions`.**

| Criterio                   | Sessioni server-side                 | Solo JWT stateless               |
| -------------------------- | ------------------------------------ | -------------------------------- |
| Revoca logout / compromise | Immediata                            | Difficile senza blocklist        |
| Multi-device               | Una riga per sessione                | Stesso, ma revoke harder         |
| Scaling N utenti           | OK; domani Redis come store sessioni | OK ma revoke debole              |
| Allineamento MySQL         | Naturale                             | Possibile ma duplicazione policy |

**Futuro multi-tenant:** ogni query scoped by `user_id`; sessioni legate a `user_id`; opzionale `tenant_id` in evoluzione team/organizzazione.

---

## Decisione 3 — ORM (OQ-015)

**Prisma** su MySQL.

- Migrazioni dichiarative adatte a schema in crescita (conversazioni, file, prompt).
- Tipi generati condivisibili con il frontend via package o OpenAPI.
- Drizzle valido ma meno conveniente per onboarding e tooling team.

---

## Decisione 4 — Template UI (OQ-013)

**Accepted:** [luismalamoc/react-typescript-template](https://github.com/luismalamoc/react-typescript-template) (MIT).

Task implementazione: **FOUND-040** fork/adapt in `frontend/`; sostituire demo “tasks” con auth + shell chat; **FOUND-041** wiring API backend (CORS + credentials).

**Nota:** il template cita Firebase in README — **non** usare Firebase; auth solo via backend IntentDraft.

---

## Conseguenze

- CORS backend con `credentials: true`; FE su porta dev (es. 5173), API su (es. 3001).
- Aggiornare `../architecture/technical-architecture.md`, `../architecture/frontend-backend-operations.md`, `../planning/beta-roadmap.md` (FOUND-010+).
