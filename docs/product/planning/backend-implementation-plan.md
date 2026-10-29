# Piano implementazione backend — IntentDraft

**Documento:** `backend-implementation-plan.md`  
**Versione:** 1.0  
**Data:** 2026-10-29  
**Audience:** founder, agente implementazione backend  
**Prodotto UI:** **IntentDraft** (`frontend/` — Vite/React, adapter API pronti)  
**Stack vincolante:** Node.js API + **Prisma** + **PostgreSQL (Supabase)** + cookie sessione (ADR-001, OQ-001/OQ-015)  
**Nota DB (2026-10-29):** sviluppo demo su **Supabase** (PostgreSQL gestito); schema Prisma `postgresql`. Il doc `database-design.md` resta riferimento logico (tipi adattati a Postgres in B1).

---

## 1. Scopo del documento

Definire **tutti i passi** — dal repository vuoto a una **web app demo funzionante in localhost** — con:

1. **Account reali** (register/login/logout, sessione cookie, persistenza MySQL).  
2. **Chat end-to-end** collegata al frontend (`VITE_USE_MOCK=false`).  
3. **Upload/download file** su filesystem locale.  
4. **Percorso verso il valore prodotto** (interpretazione, chiarimenti, prompt copiabile) via motore conversazione server-side.

Il frontend implementa già il contratto HTTP in [`frontend-implementation-spec.md`](frontend-implementation-spec.md) **§8** e gli adapter in `frontend/src/adapters/api/`. Il backend **deve rispettare quel contratto**; in caso di divergenza, aggiornare §8 e gli adapter insieme.

---

## 2. Cosa significa «demo funzionante»

| Milestone | Nome | Criterio utente | LLM Anthropic |
| --------- | ---- | ----------------- | ------------- |
| **M0** | Infra | `GET /api/health` → DB ok; FE mostra banner spento | No |
| **M1** | Auth demo | Registrazione, login, logout, refresh `/app` mantiene sessione | No |
| **M2** | Persistenza chat | Nuova chat, messaggi, titolo, pin/progetto, delete — sopravvivono a F5 | No (assistant stub) |
| **M3** | File demo | Upload `.txt`/`.pdf` ≤ 5 MB, lista, download, delete | No |
| **M4** | UX completa demo | Stesso flusso del mock FE (interpretazione, domande, prompt, rigenera, refusal) **senza** chiamate Claude | Motore **rule-based / port mock** lato server |
| **M5** | Beta AI | Claude Sonnet (ANALYZE + GENERATE), `LLM_ENABLED=true` | Sì |
| **M6** | Demo «team» | Google OAuth opzionale + README un comando per avviare stack | Opzionale OAuth |

**Obiettivo minimo consigliato per la prima demo founder:** **M3** (stack reale credibile) **+** pianificare **M4** subito dopo (altrimenti l’UX collassa passando da mock a stub «motore non collegato»).

**Obiettivo beta requisiti Must (FR-002+):** **M5**.

---

## 3. Stato attuale (baseline)

| Area | Stato |
| ---- | ----- |
| Documentazione prodotto | Completa (`docs/product/`) |
| Frontend IntentDraft | Fase 1–2 completata; adapter API; test Vitest + Playwright |
| Cartella `backend/` | **Assente** — greenfield |
| MySQL / Prisma | Non configurati in repo |
| LLM | Rinviato (OQ-002); flag `LLM_ENABLED=false` |

Roadmap ufficiale: [`beta-roadmap.md`](beta-roadmap.md) Fase 4 **FOUND-010+**. Questo piano **dettaglia e ordina** quei task con checklist eseguibile.

---

## 4. Documenti vincolanti (leggere prima di codare)

| Doc | Uso |
| --- | --- |
| [`frontend-implementation-spec.md`](frontend-implementation-spec.md) §8 | **Contratto API** (source of truth FE↔BE) |
| [`../architecture/database-design.md`](../architecture/database-design.md) | Schema tabelle v1 |
| [`../architecture/frontend-backend-operations.md`](../architecture/frontend-backend-operations.md) | OP-A*, OP-C*, OP-F*, errori |
| [`../decisions/adr-001-stack-and-auth.md`](../decisions/adr-001-stack-and-auth.md) | CORS, sessioni, monorepo |
| [`../requirements/product-requirements.md`](../requirements/product-requirements.md) | FR/NFR Must |
| [`../ai/ai-prompt-engine-design.md`](../ai/ai-prompt-engine-design.md) | IntentModel, orchestrator (fase M5) |
| [`../quality/testing-and-evaluation.md`](../quality/testing-and-evaluation.md) | T-AUTH, T-DB, T-FILE, T-CONV |

---

## 5. Prerequisiti ambiente di sviluppo

### 5.1 Software

- **Node.js** LTS (20+).  
- **Supabase** project (PostgreSQL) — [dashboard](https://supabase.com/dashboard).  
- **Git**, editor.

### 5.2 Variabili ambiente (backend `.env.example`)

Allineare nomi a quanto il FE già usa (`frontend/.env.example`):

```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database (Supabase → Project Settings → Database → URI, direct :5432)
DATABASE_URL="postgresql://postgres.[ref]:[password]@....supabase.com:5432/postgres"

# Auth
SESSION_SECRET=change-me-min-32-chars
SESSION_COOKIE_NAME=intentdraft.sid
SESSION_TTL_DAYS=14

# Upload
UPLOAD_DIR=./uploads
MAX_UPLOAD_BYTES=5242880

# Limits (allineati al FE)
MAX_MESSAGE_CHARS=12000

# LLM (fase M5)
LLM_ENABLED=false
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Google OAuth (fase opzionale)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### 5.3 Avvio demo target (documentare in `backend/README.md`)

```text
Terminal 1: Supabase project attivo (DATABASE_URL in backend/.env)
Terminal 2: cd backend && npm run dev          # :3001
Terminal 3: cd frontend && VITE_USE_MOCK=false npm run dev   # :5173
```

---

## 6. Architettura backend proposta

### 6.1 Struttura cartelle (`backend/`)

```text
backend/
  package.json
  tsconfig.json
  prisma/
    schema.prisma
    migrations/
  src/
    index.ts                 # bootstrap server
    config/env.ts            # zod-validated env
    lib/
      db.ts                  # Prisma client singleton
      errors.ts              # ApiError → JSON { error: { code, message, details } }
      logger.ts              # no content chat in log (NFR-005)
    middleware/
      session.ts             # load session → req.user
      requireAuth.ts
      errorHandler.ts
      cors.ts
    modules/
      auth/
      users/
      conversations/
      messages/
      files/
      prompts/
      health/
      oauth/                 # opzionale Google
    services/
      sessionService.ts
      passwordService.ts     # bcrypt
      conversationService.ts
      fileStorageService.ts
      orchestrator/          # M4 mock engine, M5 LLM
        mockEngine.ts
        llmOrchestrator.ts
        anthropicClient.ts
    types/                   # DTO condivisi (mirror frontend/src/types/api.ts)
  tests/
    integration/
    unit/
  uploads/                   # gitignore
  .env.example
  README.md
```

### 6.2 Framework HTTP

**Raccomandazione:** **Fastify** (plugin cookie, multipart, performance) — alternativa accettata **Express** (ADR-001). Scegliere uno e non mescolare.

### 6.3 Principi

- **BFF REST** sotto `/api/*` — nessuna logica business nel routing layer.  
- Ogni query DB scoped by **`user_id`** (multi-tenant logico).  
- Risposte errore uniformi (§9 `frontend-backend-operations.md`).  
- **Cookie** `httpOnly`, `SameSite=Lax` in dev, `Secure` in produzione futura.  
- **Idempotenza** dove utile (es. create conversation può restituire 201 sempre con nuovo id).

---

## 7. Schema dati — tabelle `idt_*` (8 caratteri)

Standard nomi fisici: [`database-design.md`](../architecture/database-design.md) **§2.1**. Implementazione Prisma: `backend/prisma/schema.prisma`.

| Tabella 8c | Contenuto principale |
| ---------- | -------------------- |
| `idt_user` | Utenti, OAuth, locale |
| `idt_sess` | Sessioni cookie |
| `idt_conv` | Chat + `metadata` (pin/progetto) + `ai_state` |
| `idt_msgs` | Thread messaggi + `metadata` interpretazione |
| `idt_file` | Allegati + `message_id` |
| `idt_prmt` | Prompt + `feedback` |

Ordine migrazioni Prisma:

1. `idt_user`, `idt_sess`  
2. `idt_conv`, `idt_msgs`  
3. `idt_file`  
4. `idt_prmt`

---

## 8. Contratto API — checklist implementazione

Riferimento completo: **frontend spec §8**. Tabella priorità per la demo:

### 8.1 P0 — necessari per M1–M3

| ID | Endpoint | Note implementative |
| -- | -------- | ------------------- |
| BE-A01 | `GET /api/health` | `{ ok: true, db: true }`; ping `SELECT 1` |
| BE-A02 | `POST /api/auth/register` | Validazione zod; hash bcrypt; crea sessione; `201 { user }` |
| BE-A03 | `POST /api/auth/login` | `200 { user }` + Set-Cookie |
| BE-A04 | `POST /api/auth/logout` | DELETE session row; `204` |
| BE-A05 | `GET /api/auth/me` | `401` se assente; user DTO con `authProvider`, `hasPassword` |
| BE-C01 | `GET /api/conversations` | `{ items: ConversationSummary[] }` ordine `updated_at DESC` |
| BE-C02 | `POST /api/conversations` | `{ title? }` default titolo vuoto o «Nuova chat» |
| BE-C03 | `GET /api/conversations/:id` | Detail + messages + files + `latestPrompt` + `phase` |
| BE-C04 | `PATCH /api/conversations/:id` | `title`, `status`, `metadata` |
| BE-C05 | `DELETE /api/conversations/:id` | Cascade messaggi/file metadata; delete file FS async |
| BE-M01 | `POST /api/conversations/:id/messages` | Vedi §9 (stub → engine) |
| BE-F01 | `POST /api/conversations/:id/files` | multipart; allowlist MIME; size cap |
| BE-F02 | `GET /api/conversations/:id/files` | Lista DTO |
| BE-F03 | `DELETE /api/files/:id` | Ownership check |
| BE-F04 | `GET /api/files/:id/download` | Stream con `Content-Disposition` |

### 8.2 P1 — settings e prompt editor

| ID | Endpoint |
| -- | -------- |
| BE-U01 | `PATCH /api/users/me` — `displayName`, `locale` |
| BE-U02 | `POST /api/users/me/password` — solo se `hasPassword` |
| BE-P01 | `GET /api/conversations/:id/prompts/latest` |
| BE-P02 | `PUT /api/prompts/:id` — `{ bodyMarkdown }` |
| BE-P03 | `POST /api/conversations/:id/regenerate` |
| BE-P04 | `POST /api/conversations/:id/skip-clarification` |
| BE-P05 | `POST /api/prompts/:id/feedback` — `{ useful: boolean }` stub |

### 8.3 P2 — OAuth Google (demo team)

| BE-G01 | `GET /api/auth/google` → redirect Google |
| BE-G02 | `GET /api/auth/google/callback` → sessione + redirect `FRONTEND_URL/#/app` |
| BE-G03 | Errori → redirect `/#/login?oauth=error` |

---

## 9. Messaggi e motore conversazione

### 9.1 Fase M2 — Assistant stub (FOUND-021 minimo)

`POST .../messages`:

1. Validare `content` (non vuoto, ≤ `MAX_MESSAGE_CHARS`).  
2. INSERT `idt_msgs` role=`user`.  
3. INSERT `idt_msgs` role=`assistant` con testo fisso i18n-aware *«Motore AI non ancora collegato»* **oppure** eco di test.  
4. Risposta `201` con shape `SendMessageResponse` (`frontend/src/types/api.ts`).

**Limite:** il FE oggi si aspetta fasi `analyzing` → `prompt_ready` e `promptText` — **lo stub da solo non basta** per demo UX accettabile.

### 9.2 Fase M4 — Parità mock (consigliato prima di Claude)

**Strategia:** portare la logica di `frontend/src/lib/mockConversationEngine.ts` (e regole phase) in `services/orchestrator/mockEngine.ts`:

- Stessi trigger (unsupported, clarifying, skip, regenerate).  
- Persistere: messaggi, `idt_prmt`, `metadata` interpretation in `idt_msgs.metadata` JSON.  
- Esporre in `GET conversation` i campi che il FE mapperà (phase, prompt, interpretation — estendere DTO se necessario **in accordo con §8**).

Vantaggi: demo completa **senza costo API**; test T-CONV/T-E2E verdi; swap M5 sostituisce solo implementazione orchestrator.

### 9.3 Fase M5 — Claude Sonnet (BETA-060+)

Implementare [`ai-prompt-engine-design.md`](../ai/ai-prompt-engine-design.md):

| Componente | Task |
| ---------- | ---- |
| `anthropicClient.ts` | Timeout, retry 429/503 (max 2), NFR-002 |
| ANALYZE | Prompt system §8 doc AI → parse JSON `IntentModel` |
| GENERATE | Prompt system §9 → `PromptArtifact` |
| Orchestrator | Stati ANALYZE / WAIT_USER / GENERATE / REFUSE / REGENERATE |
| Validazione | §13 AI doc — parse fail, objective vuoto, max chars |
| Feature flag | Se `LLM_ENABLED=false`, fallback a mockEngine |

**Due chiamate LLM** per turno completo (analyze + generate) salvo chiarimenti (solo analyze fino a WAIT_USER).

---

## 10. Integrazione frontend — passi espliciti

Dopo ogni milestone backend, verificare con FE reale:

| Step | Azione FE | Verifica |
| ---- | --------- | -------- |
| IF-01 | `frontend/.env`: `VITE_USE_MOCK=false`, `VITE_API_URL=http://localhost:3001` | Health banner assente |
| IF-02 | Register nuovo utente | Redirect `/app`, cookie in DevTools |
| IF-03 | F5 su `/app` | Sessione `GET /me` ok |
| IF-04 | Completare `hydrateConversationsFromApi` al bootstrap auth | Sidebar popolata (oggi cache parziale in `apiConversationAdapter`) |
| IF-05 | `MessagePort` — dopo POST, refetch `GET /conversations/:id` o risposta 201 completa | Thread e prompt aggiornati |
| IF-06 | Upload + anteprima download URL | File stream da BE |
| IF-07 | Playwright: nuovo spec `e2e/smoke-api.spec.ts` con `useMock=false` | CI opzionale |
| IF-08 | Rimuovere dipendenza «Accesso demo» in API mode | OK: demo disabilitato in `apiAuthAdapter` |

**Debito FE noto da chiudere durante integrazione:**

- `apiConversationAdapter.create()` async incompleto (ritorna `''`) — fix quando BE-C02 esiste.  
- Interpretation / questions dal DTO — estendere contratto §8.4 post-LLM o M4.

---

## 11. Sicurezza e validazione (fondamenta)

| ID | Requisito | Implementazione |
| -- | --------- | --------------- |
| SEC-01 | NFR-012 | bcrypt cost 12; no password in log |
| SEC-02 | Sessioni | Token random 32+ byte; scadenza `SESSION_TTL_DAYS`; DELETE on logout |
| SEC-03 | Authorization | 404 vs 403: preferire 404 su conversazione altrui |
| SEC-04 | Upload | Allowlist: `text/plain`, `text/markdown`, `application/pdf`, docx MIME; rifiutare path `..` |
| SEC-05 | Download | Check `file.user_id === session.user_id` |
| SEC-06 | CORS | Origin esplicito; `credentials: true` |
| SEC-07 | Rate limit | NFR-003 — `@fastify/rate-limit` per IP su auth e messages (P1 post-M3) |
| SEC-08 | NFR-005 | Logger strutturato: log request id, user id, **no** `content` messaggi |

---

## 12. Piano di lavoro per fasi (checklist agente)

Segnare `[x]` solo con test verificati. ID collegati a [`beta-roadmap.md`](beta-roadmap.md).

### Fase B0 — Scaffold repository (FOUND-010, FOUND-011)

- [x] **B0-001** Creare `backend/package.json` (type module, scripts `dev`, `build`, `start`, `test`, `db:migrate`, `db:seed`)  
- [x] **B0-002** TypeScript strict, ESLint flat config allineato al monorepo  
- [x] **B0-003** Fastify (o Express) + struttura `src/` §6.1  
- [x] **B0-004** `config/env.ts` con zod — fail fast all’avvio  
- [x] **B0-005** `.env.example` + `backend/README.md` (**Supabase** setup)  
- [x] **B0-006** Root repo: script opzionale `npm run dev:all` (concurrently FE+BE) — opzionale  
- [x] **B0-007** Aggiornare `docs/product/README.md` — link a questo piano  

**DoD B0:** server risponde 404 JSON su route sconosciuta; `npm run build` ok.

### Fase B1 — Database (FOUND-012, NFR-013)

- [x] **B1-001** `prisma/schema.prisma` — tutte le tabelle `idt_*` §7  
- [ ] **B1-002** Migrazione iniziale + `prisma migrate dev` documentato  
- [ ] **B1-003** Seed dev opzionale (utente test) — non committare password reali  
- [ ] **B1-004** Health check esegue query DB  

**DoD B1:** T-DB-01 preparato (conversazione persistita).

### Fase B2 — Auth & sessioni (FOUND-013, FR-021)

- [ ] **B2-001** Modello `idt_sess` + cookie plugin  
- [ ] **B2-002** BE-A02 … BE-A05  
- [ ] **B2-003** Middleware `requireAuth` su route `/api/conversations/*`, `/api/users/*`, `/api/files/*`  
- [ ] **B2-004** DTO `User` identico al FE (`authProvider`, `hasPassword`)  
- [ ] **B2-005** Test integrazione: T-AUTH-01, T-AUTH-02  

**DoD B2:** IF-01 … IF-03 verdi manualmente.

### Fase B3 — Conversazioni CRUD (FOUND-020 backend, FR-022)

- [ ] **B3-001** BE-C01 … BE-C05  
- [ ] **B3-002** Titolo auto: PATCH title da primo messaggio user (mirror FE-104)  
- [ ] **B3-003** `metadata.pinned` / `inProject` in PATCH  
- [ ] **B3-004** FE: fix hydrate + create async (IF-04)  

**DoD B3:** Sidebar FE con API; nuova chat e delete funzionano dopo F5.

### Fase B4 — Messaggi stub (FOUND-021)

- [ ] **B4-001** BE-M01 versione stub §9.1  
- [ ] **B4-002** Aggiornamento `updated_at` conversazione ad ogni messaggio  

**DoD B4:** Invio messaggio persistito; assistant stub visibile.

### Fase B5 — File (FOUND-035, FR-023)

- [ ] **B5-001** BE-F01 multipart (field `file`)  
- [ ] **B5-002** BE-F02, BE-F03, BE-F04  
- [ ] **B5-003** Test T-FILE-01  
- [ ] **B5-004** FE download URL assoluto già pronto (`downloadAttachment`)  

**DoD B5:** Milestone **M3** completa.

### Fase B6 — Utente & prompt API (P1)

- [ ] **B6-001** BE-U01, BE-U02  
- [ ] **B6-002** BE-P01, BE-P02  
- [ ] **B6-003** BE-P03, BE-P04 (delegano a orchestrator)  
- [ ] **B6-004** BE-P05 feedback (store opzionale)  

**DoD B6:** Settings page FE fully wired in API mode.

### Fase B7 — Motore mock server (M4)

- [ ] **B7-001** Port `mockConversationEngine` → `mockEngine.ts`  
- [ ] **B7-002** BE-M01 usa mockEngine; risposta `SendMessageResponse` ricca  
- [ ] **B7-003** Regenerate / skip-clarification  
- [ ] **B7-004** Refusal medico/legal (FR-012)  
- [ ] **B7-005** Estendere §8 / DTO se servono campi interpretation — documentare  

**DoD B7:** Scenario §18 CHAT-01…CHAT-09 manuali in API mode; Playwright smoke API.

### Fase B8 — Google OAuth (opzionale demo)

- [ ] **B8-001** BE-G01 … BE-G03  
- [ ] **B8-002** Utente Google: `hasPassword: false`  
- [ ] **B8-003** Test manuale `AUTH-06`, `AUTH-07` (spec §18)  

### Fase B9 — Integrazione LLM (M5, BETA-060–065)

- [ ] **B9-001** `LLM_ENABLED` + `anthropicClient`  
- [ ] **B9-002** Prompt template ANALYZE / GENERATE versionati in repo  
- [ ] **B9-003** Orchestrator stati §7 AI doc  
- [ ] **B9-004** Persistenza `idt_prmt` + version increment  
- [ ] **B9-005** Metriche token/costo log (NFR-010) — senza content  
- [ ] **B9-006** Fixture test EV-01…EV-15 + T-CONV, T-PROMPT  

**DoD B9:** Requisiti FR-002–012 soddisfatti con LLM reale; chiave solo in `.env` server.

### Fase B10 — Hardening & CI (BETA-042, BETA-070+)

- [ ] **B10-001** Rate limiting auth/messages  
- [ ] **B10-002** Suite `backend/tests/integration` con DB test (Docker)  
- [ ] **B10-003** GitHub Actions: lint + test + build backend on PR  
- [ ] **B10-004** Documento runbook incidenti (rotazione `SESSION_SECRET`, API key)  

---

## 13. Testing backend

| Livello | Cosa | Tool |
| ------- | ---- | ---- |
| Unit | `passwordService`, parse errori, validazione MIME | Vitest |
| Integration | Auth flow, CRUD conversazione, upload con supertest + DB test | Vitest + Prisma test DB |
| Contract | Shape JSON vs `frontend/src/types/api.ts` | test condivisi o zod schema duplicato |
| E2E | Smoke FE con API | Playwright `smoke-api.spec.ts` |

Mappatura [`testing-and-evaluation.md`](../quality/testing-and-evaluation.md): priorità **T-AUTH-***, **T-DB-01**, **T-FILE-01** in fase B2–B5; **T-CONV-***, **T-PROMPT-*** in B7/B9.

---

## 14. Definition of Done — «Demo web funzionante»

Considerare raggiunta la **demo M3** quando:

- [ ] MySQL + backend + frontend avviano con README unificato.  
- [ ] Utente può registrarsi, usare chat, ricaricare pagina, ritrovare dati.  
- [ ] Upload e download file funzionano.  
- [ ] Nessun segreto nel bundle FE (`grep` ANTHROPIC / SESSION).  
- [ ] `frontend` Playwright smoke passa ancora in mock; smoke API documentato.  
- [ ] §18 spec FE **BE-01 … BE-04** (§18.9) verificabili manualmente.

Considerare raggiunta la **demo prodotto M4/M5** quando:

- [ ] Flussi CHAT completi §18 con API.  
- [ ] T-CONV e T-PROMPT verdi (mock o LLM).  
- [ ] FR Must tracciati in `product-requirements.md` §17 aggiornati.

---

## 15. Rischi e mitigazioni

| Rischio | Mitigazione |
| ------- | ----------- |
| Stub assistant inutilizzabile vs mock FE | Prioritizzare **B7** subito dopo B5 |
| Contratto §8 incompleto per interpretation/phase | Amend §8.4 con campi espliciti prima di B7 |
| `apiConversationAdapter` incompleto | Task IF-04/05 nel same PR di B3 |
| OAuth Google setup laborioso | M3 senza Google; B8 opzionale |
| Costo LLM in dev | `LLM_ENABLED=false` default; mock engine |
| Path traversal upload | UUID filename, directory per `user_id/conversation_id` |

---

## 16. Ordine di esecuzione consigliato (agente AI)

```text
B0 → B1 → B2 → IF-01..03 → B3 → IF-04 → B4 → B5 → IF-05..06
  → B7 (M4 demo UX) → B6 → B8 (opz.) → B9 → B10
```

Non iniziare **B9** finché **B5 + B7** non sono verdi — evita debug LLM su persistenza rotta.

---

## 17. Tracciabilità roadmap FOUND → questo piano

| beta-roadmap | Piano backend |
| ------------ | ------------- |
| FOUND-010 | B0 |
| FOUND-011, FOUND-012 | B1 |
| FOUND-013 | B2 |
| FOUND-021 | B4, B7, B9 |
| FOUND-022 | B10 (test integrazione) |
| FOUND-035 | B5 |
| BETA-040–043 | B9, B10 |
| BETA-060+ | B9 |

---

## 18. Prossimo passo immediato

1. Review founder di questo documento (eventuali tweak su Fastify vs Express, milestone M3 vs M4).  
2. Agente: eseguire **Fase B0** + **B1** in un unico PR «scaffold backend + schema Prisma».  
3. Agente: **B2** in PR «auth session cookie» + verifica manuale IF-01..03.  

---

**Fine documento** — mantenere allineati: questo file, `frontend-implementation-spec.md` §8, `beta-roadmap.md` (checkbox FOUND), `docs/product/README.md`.
