# Piano funzionalità amministratore — IntentDraft

**Documento:** `admin-capabilities-plan.md`  
**Versione:** 1.0 (2026-10-31)  
**Stato:** pianificazione — UI admin non ancora implementata

---

## 1. Obiettivo

Definire il perimetro di un **utente amministratore** rispetto a un **utente standard**, in linea con FR-021 (auth) e con i requisiti operativi di beta/chiuso (costi API, moderazione, supporto).

L’account creato da `DEV_ADMIN_*` in development (e, in produzione, il primo admin provisionato) ha `role = admin`. I nuovi registrati hanno `role = user`.

---

## 2. Modello ruoli (RBAC minimale)

| Ruolo | Identificazione | Ambito |
| ----- | ----------------- | ------ |
| **user** | Default su register / seed `DEV_STANDARD_USER_*` | Solo dati propri (conversazioni, file, profilo) |
| **admin** | Seed dev / promozione manuale DB | Lettura aggregata multi-tenant + configurazione piattaforma |

**Non obiettivi v1 admin:** deleghe granulari (editor, billing-only), SSO enterprise, audit log immutabile certificato.

---

## 3. Area Admin Console (page management)

### 3.1 Dashboard operativa

- **Utenti registrati:** conteggio totale, nuovi ultimi 7/30 giorni, split `local` vs `google`.
- **Attività conversazioni:** conversazioni attive, messaggi/giorno, tasso di completamento prompt (`prompt_ready`).
- **Salute sistema:** stato da `/api/health`, error rate API, coda upload, latenza LLM (p50/p95).

### 3.2 Costi e uso API (per utente)

Obiettivo: rispondere a “quanto spendiamo e chi consuma di più”.

- **Metriche per utente:** numero chiamate LLM, token input/output stimati, costo stimato (tariffa modello configurabile).
- **Metriche globali:** breakdown per modello (fase 1: solo Claude), per fase pipeline (`ANALYZE` vs `GENERATE`).
- **Export CSV** per periodo (billing interno / forecast).
- **Implementazione dati:** tabella `idt_usage` (o eventi su log strutturato + aggregazione nightly); correlazione `user_id`, `conversation_id`, `model`, `tokens`, `usd_estimate`.

### 3.3 Gestione utenti

- Elenco paginato con ricerca email/nome.
- Dettaglio utente: provider auth, data registrazione, ultimo accesso (da sessioni), locale, ruolo.
- Azioni admin (con conferma):
  - **Promuovi / revoca admin** (mai auto-revoca dell’ultimo admin).
  - **Disabilita account** (soft: blocca login, mantiene dati — richiede colonna `status`).
  - **Reset password forzato** (invio link — riusa flusso forgot-password).
- **Non** in v1: impersonation sessione utente (rischio GDPR/audit).

### 3.4 Prompt di sistema e template API

- **Library prompt di piattaforma:** system prompt per fasi Intent & Context, chiarimenti, generazione artifact — versionati.
- **Override per modello:** stesso intento, adattamento stile (Claude vs futuri Gemini/OpenAI).
- **Feature flags:** abilita/disabilita chiarimenti multi-turn, decomposition, fallback mock.
- **Anteprima dry-run:** admin incolla testo utente → vede IntentModel + prompt finale senza persistere.

### 3.5 Limiti, fair use e sicurezza

- Visualizza/modifica limiti **globali** (rate limit messaggi, max caratteri, max upload).
- **Per-utente override** (beta tester, partner).
- Elenco file rifiutati (scan `rejected`) e conversazioni con flag safety.

### 3.6 Contenuti legali e compliance

- Editor mock/testo per pagine **Limiti e privacy**, cookie policy (allineato al banner mock FE).
- Log consenso cookie quando passa da mock a CMP reale.

---

## 4. API e autorizzazione backend

- Middleware `requireAdmin` su prefix `/api/admin/*`.
- Tutte le query **scoped** esplicitamente (admin legge cross-user; user resta su `user_id` sessione).
- Audit minimo: `admin_user_id`, `action`, `target`, `at` (tabella `idt_adlg` o log JSON).

**Endpoint indicativi (futuri):**

| Metodo | Path | Descrizione |
| ------ | ---- | ----------- |
| GET | `/api/admin/metrics/overview` | KPI dashboard |
| GET | `/api/admin/users` | Lista utenti |
| GET | `/api/admin/users/:id/usage` | Uso LLM / costi |
| GET | `/api/admin/usage/export` | CSV |
| GET/PUT | `/api/admin/prompt-templates` | Template di piattaforma |
| PATCH | `/api/admin/users/:id/role` | Promozione admin |

---

## 5. Frontend

- Route protetta `/app/admin/*` visibile solo se `user.role === 'admin'`.
- Voce menu utente “Amministrazione”.
- Layout a schede: Dashboard · Utenti · Uso API · Prompt · Impostazioni.

---

## 6. Account di test (development)

| Account | Email default | Password default | Ruolo |
| ------- | ------------- | ---------------- | ----- |
| Admin | `admin@intentdraft.local` | `DEV_ADMIN_PASSWORD` | admin |
| Standard | `user@intentdraft.local` | `DEV_STANDARD_USER_PASSWORD` | user |

Variabili: `DEV_STANDARD_USER_*` in `backend/.env` (vedi `.env.example`).

---

## 7. Fasi di implementazione suggerite

1. **RBAC base** — campo `role`, seed, esposizione in `/api/auth/me` (fatto lato schema/seed).
2. **Forgot/reset password** — prerequisito self-service e admin reset.
3. **Admin shell** — route + guard + dashboard vuota.
4. **Usage tracking** — instrumentazione orchestrator LLM → `idt_usage`.
5. **User list + usage per user** — prima feature “business critical”.
6. **Prompt template management** — allineato a `ai-prompt-engine-design.md` e routing LLM.

---

## 8. Riferimenti

- [`docs/product/requirements/product-requirements.md`](../requirements/product-requirements.md)
- [`docs/product/ai/llm-routing-strategy.md`](../ai/llm-routing-strategy.md)
- [`docs/product/architecture/database-design.md`](../architecture/database-design.md)
