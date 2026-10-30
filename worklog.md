# Worklog — IntentDraft (PromptPilot)

**Ultimo aggiornamento:** 2026-10-30  
**Scopo:** sequenza operativa per riprendere lo sviluppo full-stack da dove ci siamo fermati.

---

## Stato attuale (fatto)

| Area | Stato |
| ---- | ----- |
| **Frontend** | IntentDraft completo in mock; adapter API pronti; test Vitest + Playwright. Spec: [`docs/product/planning/frontend-implementation-spec.md`](docs/product/planning/frontend-implementation-spec.md) |
| **Backend B0** | Fastify, health, errori JSON, env zod, Prisma + Supabase connesso |
| **Backend B1** | 6 tabelle `idt_*` su Supabase, migrazione `init_idt_schema`, health `db: true` |
| **Backend B2** | Auth register/login/logout/me, sessioni cookie, test integrazione |
| **Backend B3** | CRUD conversazioni BE-C01…C05, test integrazione; FE hydrate + adapter API (IF-04) |
| **Backend B4** | POST messaggi stub (BE-M01), titolo auto, test integrazione; FE sync thread + load detail (IF-05 parziale) |
| **Schema DB** | Definito in doc + `backend/prisma/schema.prisma` — tabelle fisiche **`idt_*`** (8 caratteri). Vedi [`docs/product/architecture/database-design.md`](docs/product/architecture/database-design.md) §2.1 |
| **Commit recente** | Frontend checklist + test; backend scaffold (verificare `git log`) |

**Non ancora implementato sul backend:** file (B5), orchestrator (B7), LLM (B9).

---

## Prerequisiti sviluppatore

1. Node.js 20+
2. Progetto **Supabase** con `DATABASE_URL` in `backend/.env` (Session pooler consigliato se rete IPv4)
3. `backend/.env`: `PORT=3001`, `CORS_ORIGIN=http://localhost:5173`, `SESSION_SECRET` ≥ 32 caratteri
4. Per API reale FE: `frontend/.env` → `VITE_USE_MOCK=false`, `VITE_API_URL=http://localhost:3001`

**Avvio rapido:**

```bash
cd backend && npm install && npm run db:push && npm run dev
cd frontend && npm run dev
# oppure dalla root: npm install && npm run dev:all
```

---

## Prossimi passi (ordine obbligatorio)

Spunta ogni voce solo quando verificata (build ok + prova manuale o test indicato).

### Blocco 1 — Database su Supabase (B1)

1. [x] Eseguire `cd backend && npm run db:push` e confermare in Supabase **Table Editor** le 6 tabelle: `idt_user`, `idt_sess`, `idt_conv`, `idt_msgs`, `idt_file`, `idt_prmt`.
2. [x] Migrazione versionata `prisma/migrations/20260329220000_init_idt_schema` (baseline dopo `db:push` con `migrate resolve --applied`); flusso documentato in `backend/README.md`.
3. [x] Nessuna tabella legacy `schema_bootstrap` nel schema `public` (verificato 2026-10-29).
4. [x] Verificare `GET http://localhost:3001/api/health` → `{ "ok": true, "db": true }` (`pingDatabase` in `src/lib/db.ts`).
5. [ ] (Opzionale B1-003) Seed dev in `backend/prisma/seed.ts` — utente test; **non** committare password (placeholder: solo `user.count()` fino a B2).

**Riferimenti:** piano [`docs/product/planning/backend-implementation-plan.md`](docs/product/planning/backend-implementation-plan.md) Fase B1 · FOUND-012.

---

### Blocco 2 — Autenticazione (B2, FR-021)

6. [x] `src/services/passwordService.ts` (bcrypt) e `src/services/sessionService.ts` (crea/valida/elimina `idt_sess`).
7. [x] Route auth: `POST /api/auth/register`, `login`, `logout`, `GET /api/auth/me` — contratto §8.1.
8. [x] Cookie sessione httpOnly firmato (`SESSION_COOKIE_NAME`), TTL `SESSION_TTL_DAYS` (`src/app.ts`).
9. [x] Middleware `createRequireAuth` + `request.user` (`src/middleware/requireAuth.ts`); 401 → `UNAUTHORIZED`.
10. [x] Mapper `toUserDto` — allineato a `frontend/src/types/auth.ts`.
11. [x] Test integrazione Vitest: `tests/integration/auth.test.ts` (`npm run test`).
12. [ ] **Verifica FE:** `VITE_USE_MOCK=false`, register/login/logout, F5 su `/app` mantiene sessione (IF-01…03).

**Riferimenti:** [`docs/product/architecture/frontend-backend-operations.md`](docs/product/architecture/frontend-backend-operations.md) OP-A01…A04.

---

### Blocco 3 — Conversazioni CRUD (B3, FR-022)

13. [x] Modulo `src/modules/conversations/` — `GET/POST /api/conversations`, `GET/PATCH/DELETE /api/conversations/:id`.
14. [x] Scope rigoroso `user_id` da sessione; 404 se conversazione altrui.
15. [x] DTO allineati a `frontend/src/types/api.ts` (`ConversationSummaryDto`, `ConversationDetailDto`, `metadata` per pin/progetto).
16. [x] Titolo auto dal primo messaggio user (POST messaggi, max 48 caratteri).
17. [x] **Fix frontend:** `apiConversationAdapter` — `create()` async con id reale; `hydrateConversationsFromApi` al bootstrap auth (IF-04).
18. [ ] **Verifica FE:** sidebar lista, nuova chat, rename, pin, delete, refresh pagina (test manuali § sotto).

**Riferimenti:** piano backend §8 BE-C01…C05.

---

### Blocco 4 — Messaggi stub (B4, FOUND-021)

19. [x] `POST /api/conversations/:id/messages` — validazione lunghezza (`MAX_MESSAGE_CHARS`), INSERT `idt_msgs` user.
20. [x] Risposta stub assistant (testo fisso) + aggiornamento `idt_conv.updated_at`.
21. [ ] **Verifica FE:** invio messaggio in API mode (thread persistito dopo F5); accettare UX limitata fino a B7 (test manuali § sotto).

---

### Blocco 5 — Upload file (B5, FR-023) → **Milestone M3**

22. [ ] `@fastify/multipart` — `POST /api/conversations/:id/files`, salvataggio su `UPLOAD_DIR`, INSERT `idt_file`.
23. [ ] Allowlist MIME + `MAX_UPLOAD_BYTES`; path sicuro (UUID, no traversal).
24. [ ] `GET .../files`, `DELETE /api/files/:id`, `GET /api/files/:id/download` (stream).
25. [ ] **Verifica FE:** upload, anteprima/download, delete; test T-FILE-01.

**DoD demo persistenza:** M3 — auth + chat + file su Supabase senza mock.

---

### Blocco 6 — Profilo, prompt API, settings (B6)

26. [ ] `PATCH /api/users/me`, `POST /api/users/me/password`.
27. [ ] `GET .../prompts/latest`, `PUT /api/prompts/:id`, feedback stub su `idt_prmt.feedback`.
28. [ ] Endpoint `regenerate` / `skip-clarification` (stub o delega a B7).
29. [ ] **Verifica FE:** pagina Settings in API mode.

---

### Blocco 7 — Motore conversazione lato server (B7) → **Milestone M4**

30. [ ] Portare logica da `frontend/src/lib/mockConversationEngine.ts` → `backend/src/services/orchestrator/mockEngine.ts`.
31. [ ] `POST .../messages` usa mockEngine; risposta `SendMessageResponse` completa (phase, prompt, interpretation in metadata).
32. [ ] Regenerate / skip-clarification; refusal medico/legal (FR-012).
33. [ ] Aggiornare contratto §8.4 se servono campi extra; allineare adapter FE.
34. [ ] Playwright `e2e/smoke-api.spec.ts` con `VITE_USE_MOCK=false`.
35. [ ] Spuntare test manuali §18 CHAT in [`frontend-implementation-spec.md`](docs/product/planning/frontend-implementation-spec.md).

**DoD:** stessa UX del mock, dati su Supabase.

---

### Blocco 8 — Google OAuth (B8, opzionale)

36. [ ] `GET /api/auth/google`, callback, utente `authProvider: google`, `hasPassword: false`.
37. [ ] Redirect errori → `/#/login?oauth=error`.
38. [ ] Test AUTH-06, AUTH-07 (§18).

---

### Blocco 9 — LLM Anthropic (B9) → **Milestone M5 / beta Must**

39. [ ] `LLM_ENABLED`, client Anthropic server-side only (NFR-001).
40. [ ] Orchestrator ANALYZE / GENERATE — [`docs/product/ai/ai-prompt-engine-design.md`](docs/product/ai/ai-prompt-engine-design.md).
41. [ ] Persistenza `idt_prmt` versionata; retry 429/503; no content in log (NFR-005).
42. [ ] Fixture e test T-CONV, T-PROMPT in [`docs/product/quality/testing-and-evaluation.md`](docs/product/quality/testing-and-evaluation.md).

---

### Blocco 10 — Hardening & CI (B10)

43. [ ] Rate limit su auth e messaggi (NFR-003).
44. [ ] Suite integration backend con DB test.
45. [ ] CI: lint + test + build `frontend/` e `backend/` su PR.
46. [ ] Runbook rotazione segreti.

---

### Blocco 11 — Deploy cloud & utenti globali (INF, post-funzionale) -- evitalo per ora.. TO DO In the future

**Quando:** dopo **M3** (minimo) e idealmente insieme a **B10**; go-live pubblico solo con **M4–M5** se serve LLM in prod.  
**Guida unica:** [`docs/product/architecture/cloud-deployment-guide.md`](docs/product/architecture/cloud-deployment-guide.md) (provider, costi, env, GDPR, **multi-utente da reti globali** §9).

47. [ ] **INF-001** — Preparazione repo: `Dockerfile` backend, `.dockerignore`, `frontend/.env.production.example` (§12 Fase 0).
48. [ ] **INF-002** — Ambiente **staging** cloud: dominio, Supabase staging, API + volume upload, FE su CDN, smoke auth/cookie cross-subdomain (§12 Fase 1).
49. [ ] **INF-003** — **Produzione beta:** secret CI, monitoring su `/api/health`, privacy/OQ-012 (§12 Fase 2).
50. [ ] **INF-004** — **Accesso globale:** CDN edge per `frontend/dist`; API dietro proxy/WAF (es. Cloudflare); rate limit **per IP e per sessione** (NFR-003); download file via storage + CDN quando si scala (§9).
51. [ ] **INF-005** — Verifica isolamento **multi-utente** (già B3/B3-M06): ogni tenant logico = `user_id`; nessun dato cross-account sotto carico da reti diverse.
52. [ ] **INF-006** — Piano evolutivo multi-regione (solo se metriche latenza lo richiedono): object storage replicato, read replica DB, eventuale seconda region API — documentare decisione in guida §9.3.

**Nota:** multi-tenant **organizzazioni/team** (workspace condivisi) resta **fuori scope** beta (OQ-007); qui si intende **molti utenti singoli** da Internet mondiale.

---

## Milestone (riepilogo)

| ID | Descrizione | Blocchi |
| -- | ----------- | ------- |
| **M0** | Health + DB | 1 |
| **M1** | Auth | 2 |
| **M2** | Chat persistita (stub) | 3–4 |
| **M3** | + File | 5 |
| **M4** | UX mock su API | 7 |
| **M5** | Claude Sonnet | 9 |
| **M6** | Deploy cloud staging/prod + readiness globale | 10–11 |

---

## Documenti chiave (non duplicare qui)

| Documento | Uso |
| --------- | --- |
| [`worklog.md`](worklog.md) | **Questo file** — ordine esecuzione |
| [`docs/product/planning/backend-implementation-plan.md`](docs/product/planning/backend-implementation-plan.md) | Dettaglio task B0–B10, DoD, API checklist |
| [`docs/product/architecture/database-design.md`](docs/product/architecture/database-design.md) | Schema `idt_*` |
| [`docs/product/planning/frontend-implementation-spec.md`](docs/product/planning/frontend-implementation-spec.md) | Contratto API §8, test §18 |
| [`docs/product/planning/beta-roadmap.md`](docs/product/planning/beta-roadmap.md) | FOUND / BETA roadmap storica |
| [`backend/README.md`](backend/README.md) | Setup Supabase |
| [`frontend/README.md`](frontend/README.md) | Mock vs API, script test |
| [`docs/product/architecture/cloud-deployment-guide.md`](docs/product/architecture/cloud-deployment-guide.md) | Deploy localhost → cloud, costi, provider, utenti globali |

---

## Dove riprendere **adesso**

**Prossima azione consigliata:** **Blocco 5 — Upload file (B5)** oppure test manuali a fine checklist. Milestone **M2** (chat persistita stub) coperta da B3+B4.

Dopo ogni blocco: `npm run build` in `backend/`, commit atomico, aggiornare le checkbox in questo file.

---

## Note per commit / review

- Non committare `backend/.env` né segreti Supabase.
- Dopo cambi schema: `npm run db:push` o migrate + rigenerare client (`prisma generate`).
- Allineare sempre API al §8 frontend spec; in caso di breaking change, aggiornare spec + adapter FE nello stesso PR.

---

## Test manuali — Blocco 3 (Conversazioni CRUD, B3)

Prerequisiti: backend su `:3001` con `db: true`, frontend con `VITE_USE_MOCK=false` e `VITE_API_URL=http://localhost:3001`, utente registrato e loggato su `/app`.

- **B3-M01 — Hydrate sidebar (IF-04):** Dopo login, la sidebar mostra le chat esistenti senza azioni extra. In Supabase Table Editor verifica righe in `idt_conv` per il tuo `user_id`; i titoli devono corrispondere. F5 su `/app`: stessa lista, cookie di sessione invariato.

- **B3-M02 — Nuova chat:** Clic «Nuova chat» crea una conversazione vuota e la seleziona. In DevTools → Network compare `POST /api/conversations` con `201` e un UUID in risposta. Un secondo click su «Nuova chat» non deve creare duplicati vuoti se esiste già una chat recente senza messaggi.

- **B3-M03 — Rinomina:** Dal menu della chat, rinomina (es. «Prova API»). Network: `PATCH /api/conversations/:id` con `{ title }` e `200`. Il titolo resta dopo F5 e in Supabase la colonna `title` di `idt_conv` è aggiornata.

- **B3-M04 — Pin e progetto:** Fissa una chat e spostane un’altra in «Progetto». Network: `PATCH` con `{ metadata: { pinned: true } }` o `{ inProject: true }`. Dopo F5 le sezioni Fissate/Progetti restano corrette; in DB `metadata` JSON su `idt_conv` riflette i flag.

- **B3-M05 — Elimina:** Elimina una chat confermando la modale. Network: `DELETE /api/conversations/:id` → `204`. La voce sparisce dalla sidebar; F5 non la ripresenta. La riga scompare da `idt_conv` (cascade su `idt_msgs` se presenti).

- **B3-M06 — Isolamento utente:** Con due account (A e B), crea una chat con A e copia l’UUID dall’URL o dalla risposta POST. Loggato come B, apri DevTools e `GET /api/conversations/<uuid-A>`: deve essere `404 NOT_FOUND`, non i dati di A.

- **B3-M07 — Dettaglio vuoto:** `GET /api/conversations/:id` (cookie valido) su chat senza messaggi: `200` con `messages: []`, `files: []`, `phase: "idle"`, `latestPrompt: null`. Coerente con contratto §8.3 per chat appena create.

- **B3-M08 — Build automatici:** Da repo root, `cd backend && npm run build && npm run test` e `cd frontend && npm run build` senza errori. Opzionale: verifica che i test integrazione `conversations.test.ts` siano verdi sul tuo `DATABASE_URL`.

---

## Test manuali — Blocco 4 (Messaggi stub, B4)

Prerequisiti come B3; chat vuota selezionata in API mode.

- **B4-M01 — Invio messaggio:** Scrivi un testo nel composer e invia. Network: `POST /api/conversations/:id/messages` → `201` con `userMessage` e `assistantMessage`. In UI compaiono il tuo messaggio e la risposta stub («Motore AI non ancora collegato…»). In Supabase `idt_msgs` ha due righe (user + assistant) per quella conversazione.

- **B4-M02 — Persistenza dopo F5:** Dopo l’invio, ricarica `/app`. Il thread (user + assistant) resta visibile nella chat attiva; la sidebar mostra titolo auto dal primo messaggio (primi ~48 caratteri). `GET /api/conversations/:id` restituisce `messages` con length ≥ 2.

- **B4-M03 — Titolo sidebar:** Su chat con titolo vuoto, il primo invio aggiorna il titolo in sidebar senza PATCH manuale. Verifica colonna `title` su `idt_conv` allineata al testo troncato.

- **B4-M04 — Validazione:** Prova invio solo spazi (bloccato lato FE) o contenuto oltre `MAX_MESSAGE_CHARS` (blocco FE; opzionale POST diretto → `400 VALIDATION_ERROR`). Allegati nel composer in API mode: toast tipo file fino a B5 (upload non implementato).

- **B4-M05 — UX limitata (atteso):** Dopo la risposta stub, `phase` è `idle` e il composer può non essere più visibile con messaggi presenti — comportamento accettabile fino a B7 (motore mock server). Rigenera/skip/chiarimenti restano non implementati o falliscono fino a B6/B7.

- **B4-M06 — Test automatici:** `backend/tests/integration/messages.test.ts` verde con `DATABASE_URL`; build FE/BE ok.
