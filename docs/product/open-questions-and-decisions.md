# Decisioni aperte e registro decisioni — PromptPilot

**Documento:** `open-questions-and-decisions.md`  
**Versione:** 1.0  
**Stato:** Registro vivo — aggiornare quando il founder accetta/rifiuta

Legenda **stato:** `Open` | `Proposed` | `Accepted` | `Deferred`

---

## Decisioni che bloccano o condizionano fortemente la beta

### OQ-001 — Stack applicativo

| Campo | Valore |
|-------|--------|
| **ID** | OQ-001 |
| **Domanda** | Quale stack usare per frontend, API e integrazione LLM? |
| **Contesto** | Repository greenfield (`repository-assessment.md`). Nessun vincolo tecnico esistente. |
| **Opzioni** | **A)** Monolith Next.js (TypeScript, App Router, Route Handlers API) — **B)** SPA (Vite + React) + API Node (Fastify/Express) — **C)** Backend Python (FastAPI) + frontend React — **D)** Altro |
| **Pro** | A: un repo, deploy semplice, tipico per MVP web; B/C: separazione netta, C comune in team ML |
| **Contro** | A: accoppiamento deploy; B/C: più setup iniziale |
| **Raccomandazione** | **A** — Next.js + TypeScript per beta: time-to-market, tipizzazione, API proxy LLM lato server |
| **Impatto** | Struttura repo, test, hosting, hiring |
| **Urgenza** | Alta — prima di BETA-010 |
| **Decide** | Founder + lead tecnico |
| **Stato** | `Proposed` |

### OQ-002 — Provider LLM e modello

| Campo | Valore |
|-------|--------|
| **ID** | OQ-002 |
| **Domanda** | Quale provider e modello per interpretazione, domande e generazione prompt? |
| **Contesto** | Costi, qualità italiano, latenza, policy dati |
| **Opzioni** | OpenAI / Anthropic / Google / OpenRouter / Azure OpenAI / misto |
| **Raccomandazione** | Un provider primario con API stabile (es. OpenAI o Anthropic) + astrazione sottile in codice per cambiare modello; modello “capace” per structured output nella fase di analisi |
| **Impatto** | Costo per sessione, qualità chiarimenti, conformità DPA |
| **Urgenza** | Alta — prima di integrazione LLM |
| **Decide** | Founder |
| **Stato** | `Open` |

### OQ-003 — Persistenza conversazioni in beta

| Campo | Valore |
|-------|--------|
| **ID** | OQ-003 |
| **Domanda** | Le conversazioni devono sopravvivere al refresh / tra visite? |
| **Opzioni** | **A)** Solo memoria sessione (tab) — **B)** `sessionStorage` / ID sessione server ephemeral — **C)** DB + account utente |
| **Raccomandazione** | **A** o **B** per beta pubblica limitata: nessun account, minimizzazione dati; opzionale export locale |
| **Impatto** | Privacy, NFR, architettura |
| **Urgenza** | Media — prima del pilota |
| **Decide** | Founder |
| **Stato** | `Proposed` |

### OQ-004 — Segmento e scope vertical

| Campo | Valore |
|-------|--------|
| **ID** | OQ-004 |
| **Domanda** | Beta generalista (direzione A brainstorming) o focalizzata lavoro (direzione C)? |
| **Opzioni** | Generalista / vertical (es. report & presentazioni per professionisti) / ibrido (UI generalista + copy e esempi verticali) |
| **Raccomandazione** | **Ibrido leggero:** UI generalista, validazione con 15–20 casi professionali (brainstorming §13) |
| **Impatto** | Prompt di sistema, marketing, rubric di valutazione |
| **Urgenza** | Media — prima del pilota esterno |
| **Decide** | Founder |
| **Stato** | `Open` |

### OQ-005 — Modello operativo costi inferenza

| Campo | Valore |
|-------|--------|
| **ID** | OQ-005 |
| **Domanda** | Chi sostiene i costi LLM in beta e come limitare abuso? |
| **Opzioni** | Chiave founder / invite-only / rate limit per IP / cap giornaliero globale |
| **Raccomandazione** | Beta chiusa o semi-chiusa + rate limiting server-side + budget alert |
| **Impatto** | NFR sicurezza/costi, roadmap |
| **Urgenza** | Alta — prima deploy pubblico |
| **Decide** | Founder |
| **Stato** | `Open` |

---

## Decisioni importanti ma rinviabili post-MVP beta

### OQ-006 — Nome commerciale definitivo

| Campo | Valore |
|-------|--------|
| **ID** | OQ-006 |
| **Opzioni** | PromptPilot (README) vs AI Prompt Assistant vs altro |
| **Raccomandazione** | Mantenere PromptPilot come working name fino a validazione |
| **Urgenza** | Bassa |
| **Stato** | `Deferred` |

### OQ-007 — Modello di business

| Campo | Valore |
|-------|--------|
| **ID** | OQ-007 |
| **Contesto** | Brainstorming §15 |
| **Raccomandazione** | Nessun pagamento in beta; raccogliere segnali willingness-to-pay in interviste |
| **Urgenza** | Bassa per beta tecnica |
| **Stato** | `Deferred` |

### OQ-008 — Esecuzione integrata del prompt

| Campo | Valore |
|-------|--------|
| **ID** | OQ-008 |
| **Domanda** | Oltre a generare, eseguire il prompt nel prodotto? |
| **Raccomandazione** | **Won't** per prima beta — allineato a ipotesi in `cursor-planning-prompt.md` e brainstorming §19 |
| **Urgenza** | Bassa (già orientamento chiaro) |
| **Stato** | `Proposed` — attende conferma founder |

### OQ-009 — Upload file

| Campo | Valore |
|-------|--------|
| **ID** | OQ-009 |
| **Raccomandazione** | **Won't** beta — complessità privacy e prompt injection |
| **Stato** | `Proposed` |

### OQ-010 — Autenticazione utenti

| Campo | Valore |
|-------|--------|
| **ID** | OQ-010 |
| **Raccomandazione** | **Won't** beta pubblica iniziale; eventuale gate beta (password/env) a livello deploy |
| **Stato** | `Proposed` |

### OQ-011 — Libreria template / cronologia cloud

| Campo | Valore |
|-------|--------|
| **ID** | OQ-011 |
| **Raccomandazione** | **Could** post-beta; **Won't** per validazione valore core |
| **Stato** | `Proposed` |

### OQ-012 — Conformità legale (GDPR, informativa)

| Campo | Valore |
|-------|--------|
| **ID** | OQ-012 |
| **Domanda** | Pubblico UE, hosting, trattamento dati verso provider US? |
| **Raccomandazione** | Consultare professionista prima pilota ampia; informativa minima + minimizzazione dati fin da subito |
| **Urgenza** | Media prima pilota esterno |
| **Stato** | `Open` |

---

## ADR suggeriti (da creare in implementazione)

| ID ADR | Titolo | Quando |
|--------|--------|--------|
| ADR-001 | Scelta stack | Dopo OQ-001 Accepted |
| ADR-002 | Provider LLM | Dopo OQ-002 Accepted |
| ADR-003 | Modello persistenza sessione | Dopo OQ-003 Accepted |

---

## Tracciabilità

Le decisioni **Accepted** devono riflettersi in aggiornamento di `technical-architecture.md` e task roadmap (prefisso `BETA-`).
