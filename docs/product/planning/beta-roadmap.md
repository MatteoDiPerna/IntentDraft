# Roadmap verso la prima beta — PromptPilot

**Documento:** `beta-roadmap.md`  
**Versione:** 1.1  
**Stato:** decisioni founder registrate (2026-10-25) · **priorità implementazione = fondamenta FE/BE locali**

Legenda priorità: **P0** critico | **P1** alto | **P2** medio

---

## Percorso critico (sintesi)

```mermaid
flowchart LR
  F2[Decisioni OQ] --> FOUND[Fondamenta FE BE MySQL]
  FOUND --> UI[Shell UI template]
  UI --> AI[Integrazione Claude Sonnet]
  AI --> CHAT[Flusso prompt completo]
  CHAT --> T[Test e pilota]
```

**Parallelo possibile:** i18n (FOUND-015) con auth; scelta template (FOUND-040) quando vuoi.

**Nota:** LLM (**BETA-060+**) **dopo** FOUND-* — allineato a founder.

**Legenda checklist:** `[X]` completato · `[ ]` da fare

---

## Fase 0 — Progettazione documentale ✅

**Obiettivo:** analisi e specifiche pre-implementazione (senza codice applicativo).  
**Stato:** completata (2026-10-25).

- [X] PLAN-001 — `repository-assessment.md` — **P0**
- [X] PLAN-002 — `product-requirements.md` (FR/NFR, MoSCoW) — **P0**
- [X] PLAN-003 — `user-journeys-and-ux.md` (3 scenari) — **P0**
- [X] PLAN-004 — `technical-architecture.md` — **P0**
- [X] PLAN-005 — `ai-prompt-engine-design.md` — **P0**
- [X] PLAN-006 — `testing-and-evaluation.md` — **P0**
- [X] PLAN-007 — `beta-roadmap.md` — **P0**
- [X] PLAN-008 — `open-questions-and-decisions.md` — **P0**
- [X] PLAN-009 — Verifica coerenza requisiti ↔ test ↔ roadmap — **P0**
- [X] PLAN-010 — Indice `docs/product/README.md` — **P1**
- [X] PLAN-011 — Allineamento tabelle Markdown (`scripts/align_markdown_tables.py`) — **P2**
- [X] PLAN-012 — Integrazione decisioni founder in documentazione — **P0**
- [X] PLAN-013 — `database-design.md` — **P0**
- [X] PLAN-014 — `frontend-backend-operations.md` — **P0**

**DoD:** pacchetto `docs/product/` completo; nessuna dipendenza runtime aggiunta.

---

## Fase 1 — Discovery e repository ✅

**Obiettivo:** capire cosa esiste.  
**Stato:** completata (2026-10-25).

- [X] BETA-001 — Ispezionare struttura repo e documenti (`repository-assessment.md`) — **P0**
- [X] BETA-002 — Allineare concept da [`../../concept/initial-brainstorming.md`](../../concept/initial-brainstorming.md) — **P0**
- [X] BETA-003 — Produrre pacchetto documentazione `docs/product/` — **P0**

**DoD:** documenti 1–8 presenti e incrociati.

---

## Fase 2 — Decisioni prodotto essenziali ✅

**Obiettivo:** sbloccare implementazione.  
**Stato:** completata (2026-10-25).

- [X] BETA-010 — **OQ-001** Next.js + TypeScript — **P0**
- [X] BETA-011 — **OQ-002** Anthropic Claude Sonnet (integrazione **rinviata**) — **P0**
- [X] BETA-012 — **OQ-003** persistenza **MySQL + account** — **P1**
- [X] BETA-013 — **OQ-005** localhost / solo team — **P0**
- [X] BETA-014 — **OQ-008** output solo prompt testuale — **P1**
- [X] BETA-015 — Scope beta: **Must** auth + upload; **Won't** pagamenti (ora) — **P1**

**DoD:** [`../decisions/open-questions-and-decisions.md`](../decisions/open-questions-and-decisions.md) v1.2.

---

## Fase 3 — Requisiti e UX (documentazione)

**Obiettivo:** baseline congelata per dev.

- [X] BETA-020 — Review founder `product-requirements.md` — **P1**
- [ ] BETA-021 — Review founder scenari UX (opzionale) — **P2**
- [X] BETA-022 — Pilota semplice: **notes** + **post LinkedIn** — **P1**

**DoD:** EV-01/EV-02 aggiornati in `testing-and-evaluation.md`.

---

## Fase 4 — Implementazione fondamenta (priorità attuale)

**Obiettivo:** frontend + backend + MySQL per operazioni basilari (**senza LLM**).  
**Dipende da:** Fase 2. **Doc:** `database-design.md`, `frontend-backend-operations.md`.

- [ ] FOUND-010 — Monorepo `frontend/` (Vite) + `backend/` (Node API) + lint — **P0** _(FE: **[X]** vedi [`frontend-roadmap.md`](frontend-roadmap.md))_
- [ ] FOUND-011 — Prisma + MySQL + `.env.example` — **P0**
- [ ] FOUND-012 — Migrazioni schema v1 (`users`, `sessions`, …) — **P0**
- [ ] FOUND-013 — `POST/GET` auth (register, login, logout, me) — **P0** — FR-021
- [X] FOUND-014 — Route protette + pagine login/register (**UI mock**) — **P0**
- [X] FOUND-015 — i18n IT/EN (minimo navigazione + auth) — **P0** — FR-024
- [X] FOUND-020 — CRUD conversazioni UI (lista, crea, dettaglio; mock localStorage) — **P0** — FR-022
- [ ] FOUND-021 — API messaggi backend (persistenza; stub pre-LLM) — **P0**
- [ ] FOUND-022 — Test integrazione auth + conversazione — **P1**
- [ ] FOUND-035 — Upload file multipart + storage locale — **P0** — FR-023
- [X] FOUND-036 — UI lista allegati + delete (mock) — **P1**
- [X] FOUND-040 — Template UI: [react-typescript-template](https://github.com/luismalamoc/react-typescript-template) — **P1**
- [X] FOUND-041 — Adattato template in `frontend/` (auth + chat, no Firebase) — **P1**

**DoD:** flusso OP-A + OP-C + OP-F01 verde in locale; `LLM_ENABLED=false`.

---

## Fase 5 — Architettura contratti AI (pre-codice LLM)

**Dipende da:** FOUND-010.

- [ ] BETA-030 — Tipi `IntentModel`, `PromptArtifact` in repo — **P0**
- [ ] BETA-031 — Definire tipi `IntentModel`, `PromptArtifact` (`ai-prompt-engine-design.md`) — **P0** — FR-002, FR-006
- [ ] BETA-032 — Contratto API conversazione AI (analyze/generate/regenerate) — **P0** — dopo FOUND
- [ ] BETA-033 — Documentazione avvio locale (MySQL + app) — **P0**
- [ ] BETA-034 — ADR-002 Anthropic Sonnet + strategia 2-step — **P1**

**Verifica:** contratti TypeScript + mock MSW.

---

## Fase 6 — Moduli server (pre-LLM e LLM)

**Dipende da:** FOUND-011, BETA-030.

- [ ] BETA-040 — Modulo `llm/` Anthropic client (feature flag off fino a ready) — **P0** — NFR-002
- [ ] BETA-041 — Modulo `validation/` input + output — **P0** — NFR-004
- [ ] BETA-042 — CI minima (lint + unit test su PR) — **P1**
- [ ] BETA-043 — Health endpoint — **P2**

---

## Fase 7 — Flusso principale UI (chat + prompt)

**Dipende da:** FOUND-020+, BETA-040, integrazione LLM attiva.

- [ ] BETA-050 — Layout chat + composer (FR-001, FR-014) — **P0**
- [ ] BETA-051 — Pannello “Cosa ho capito” (FR-002, FR-011) — **P0**
- [ ] BETA-052 — UI domande chiarimento + skip assunzione (FR-003–005) — **P0**
- [ ] BETA-053 — Editor prompt + Copia/Rigenera/Nuova sessione (FR-008–010, FR-013) — **P0**
- [ ] BETA-054 — Stati loading/error UX (FR-015) — **P0**
- [ ] BETA-055 — Messaggi edge case vuoto/limite (FR-001, NFR-004) — **P0**
- [ ] BETA-056 — Responsive base (NFR-007) — **P1**

**DoD:** T-E2E-01, T-E2E-03 verdi con LLM mock.

---

## Fase 8 — Motore AI (Claude Sonnet)

**Dipende da:** BETA-031, BETA-040, FOUND completata.

- [ ] BETA-060 — Prompt template ANALYZE + parse IntentModel (FR-002–004) — **P0**
- [ ] BETA-061 — Policy turni/domande in orchestrator (FR-004, FR-011) — **P0**
- [ ] BETA-062 — Prompt template GENERATE + PromptArtifact (FR-006–007, FR-020) — **P0**
- [ ] BETA-063 — Refusal fuori scope (FR-012) — **P0**
- [ ] BETA-064 — Rigenerazione (FR-009) — **P1**
- [ ] BETA-065 — Regressione fixture scenari 1–3 — **P1** — T-CONV, T-PROMPT

**DoD:** T-CONV-01..04, T-PROMPT-01..03 verdi.

---

## Fase 9 — Errori, sicurezza, privacy, costi

**Dipende da:** BETA-040, BETA-050.

- [ ] BETA-070 — Rate limiting (NFR-003) — **P0**
- [ ] BETA-071 — Logging senza contenuto conversazione (NFR-005) — **P0**
- [ ] BETA-072 — Pagina “Limiti e privacy” (FR-016, OQ-012) — **P0**
- [ ] BETA-073 — Metriche token/costo per request (NFR-010) — **P1**
- [ ] BETA-074 — Audit manuale no secret in client (NFR-001) — **P0**

**DoD:** T-SEC-02, checklist G4.

---

## Fase 10 — Test e valutazione

**Dipende da:** Fase 6–8.

- [ ] BETA-080 — Suite unit/integration con MSW — **P0**
- [ ] BETA-081 — Suite E2E Playwright — **P0**
- [ ] BETA-082 — Implementare T-ERR, T-SEC — **P0**
- [ ] BETA-083 — Creare `tests/fixtures/eval/` EV-01..15 — **P1**
- [ ] BETA-084 — Sessione rubric con 2 revisori — **P1**
- [ ] BETA-085 — Confronto baseline vs PromptPilot — **P1**
- [ ] BETA-086 — Feedback utile/non utile (FR-017) — **P2**

**DoD:** Gate G1–G3 (`testing-and-evaluation.md`).

---

## Fase 11 — Beta interna (localhost / team)

**Dipende da:** BETA-080–082, BETA-072.

- [ ] BETA-090 — Ambiente demo locale documentato (no cloud obbligatorio) — **P0**
- [ ] BETA-091 — Smoke test end-to-end locale — **P0**
- [ ] BETA-092 — Dogfooding team/founder (≥10 sessioni) — **P1**
- [ ] BETA-093 — Triage bug P0/P1 — **P0**

---

## Fase 12 — Beta pilota utenti

**Dipende da:** BETA-090, BETA-084.

- [ ] BETA-100 — Reclutare 5–10 utenti target (P1 persona) — **P1**
- [ ] BETA-101 — Script onboarding + consenso uso dati — **P0**
- [ ] BETA-102 — Raccolta metriche completamento/copia — **P1**
- [ ] BETA-103 — Interviste brevi post-uso — **P1**

---

## Fase 13 — Go/No-Go e retrospettiva

- [ ] BETA-110 — Checklist beta pronta (sezione sotto) — **P0**
- [ ] BETA-111 — Decisione Go/No-Go founder — **P0**
- [ ] BETA-112 — Retro documentata + backlog post-beta — **P1**

---

## Checklist — Beta pronta

- [ ] Tutti FR **Must** implementati (tracciabilità `product-requirements.md` §17)
- [ ] NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-009 verificati
- [ ] Gate G1–G5 qualità
- [ ] Auth + MySQL + upload verificati (FOUND)
- [ ] LLM Sonnet integrato con chiavi solo server-side (NFR-001)
- [ ] Informativa limiti/privacy pubblicata
- [ ] Runbook incidenti minimi (rotazione chiave API)
- [ ] Nessun P0 bug aperto

---

## Criteri Go / No-Go

| Go                                     | No-Go                       |
| -------------------------------------- | --------------------------- |
| ≥70% casi EV pass rubric               | <50% pass                   |
| Baseline vinta/pareggiata ≥70%         | Perdita netta vs baseline   |
| Flusso copia completato da ≥80% pilota | Abbandono precoce sistemico |
| Costo/sessione entro budget OQ-002     | Costi fuori controllo       |

---

## Problemi che bloccano il rilascio

1. Chiavi API esposte (NFR-001).  
2. Auth assente o upload non sicuro (file path traversal).  
3. Test E2E Must rossi in CI.  
4. Mancanza informativa trattamento dati verso LLM (FR-016).  
5. Refusal categorie ad alto rischio non funzionante (FR-012).

---

## Miglioramenti post-beta (backlog)

- Libreria prompt locali (OQ-011)
- Export .txt / Markdown download
- Scelta modello UI
- Pagamenti (OQ-007)
- Hosting e GDPR (OQ-012)
- Template verticali marketing/report
- Esecuzione integrata task (sempre fuori scope attuale)

---

## Prossimo passo implementativo

Iniziare **Fase 4 — FOUND-010** (scaffold Next.js + MySQL).

---

## Tracciabilità requisiti Must → task

| FR / NFR   | Task                 |
| ---------- | -------------------- |
| FR-021     | FOUND-010–014        |
| FR-022     | FOUND-020–021        |
| FR-023     | FOUND-035–036        |
| FR-024     | FOUND-015            |
| NFR-012–13 | FOUND-011–012        |
| FR-001+    | BETA-050+ (post LLM) |
| FR-006–010 | BETA-053, BETA-062+  |
| FR-016     | BETA-072             |
| NFR-001    | BETA-040, BETA-074   |
