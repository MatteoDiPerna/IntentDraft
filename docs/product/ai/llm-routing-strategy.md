# Strategia di routing LLM — IntentDraft

**Documento:** `llm-routing-strategy.md`  
**Versione:** 1.0 (2026-10-31)  
**Stato:** fase 1 in produzione = **solo Claude** (Anthropic); routing multi-modello pianificato

---

## 1. Visione (allineata ai diagrammi prodotto)

Il flusso end-to-end non invia il testo utente “grezzo” al modello. IntentDraft agisce come **core product**:

1. **Input utente** — linguaggio naturale (4–5 frasi).
2. **Fase 1 — Intent & context detection** — obiettivo, ambito, complessità, vincoli, contesto, gap informativi.
3. **Fase 2 — Model selection** — scelta del modello più adatto al task (oggi: default Claude; domani: Claude / Gemini / OpenAI).
4. **Fase 3 — Prompt engineering engine** — prompt dinamico, strutturato, specifico per il modello selezionato.
5. **Output** — risposta / artifact restituiti all’utente (PromptArtifact markdown).

IntentDraft **non sostituisce** l’LLM scelto dall’utente per l’esecuzione finale del compito: produce istruzioni ottimizzate e, in evoluzione, può anche **inviare** la richiesta al provider selezionato.

---

## 2. Fase 1 — Intent & context detection

**Input:** messaggio(i) utente, locale, metadata conversazione, allegati (testo estratto / descrizione).

**Output:** `IntentModel` (vedi [`ai-prompt-engine-design.md`](./ai-prompt-engine-design.md)) con almeno:

- `taskType`, `complexity`, `language`
- `objective`, `constraints`, `gaps`, `clarificationPlan`
- **Routing hints** (nuovo, estensione pianificata):

```typescript
interface RoutingHints {
  preferredProviders: Array<'anthropic' | 'google' | 'openai'>;
  requiresLongContext: boolean;
  requiresStructuredJson: boolean;
  codingHeavy: boolean;
  visionRequired: boolean;
}
```

**Implementazione attuale (B9):** analisi via Claude o mock; estrazione euristiche + JSON validato.

---

## 3. Fase 2 — Model selection (oggi vs domani)

### 3.1 Regole v1 (implementate / in corso)

| Condizione | Modello |
| ---------- | ------- |
| `LLM_ENABLED=false` o errore provider | Motore **mock** server-side |
| Default produzione | **Claude** (`ANTHROPIC_MODEL`) |
| Tutti i task beta | Stesso modello per ANALYZE e GENERATE |

### 3.2 Regole v2 (pianificate)

Tabella decisionale **deterministica prima**, ML/ranking dopo:

| Segnale | Preferenza |
| ------- | ---------- |
| Task analitico / lungo contesto | Claude o Gemini 1.5+ |
| Task codice / tool use | Claude o OpenAI |
| Task multimodale (immagini) | Gemini / GPT-4o |
| Bassa latenza / costo | Modello “small” configurabile |
| Utente premium | Override da piano abbonamento |

**Fallback:** se provider primario fallisce (timeout, 429, 5xx) → retry → provider secondario → mock degradato con messaggio UX.

**Config:** `config/llm-routing.json` (versionato) + override admin in DB.

---

## 4. Fase 3 — Prompt engineering per modello

Ogni provider riceve:

- **System prompt** specifico (tono, format obbligatori, anti-leak).
- **User payload** strutturato (IntentModel serializzato + istruzioni step).
- **Adapter output:** stesso `PromptArtifact` indipendentemente dal modello.

File di riferimento implementazione backend:

- `backend/src/services/llm/` — client Anthropic
- `backend/src/services/orchestrator/` — fasi ANALYZE / GENERATE

Estensione: `PromptTemplateRegistry.get(provider, phase, taskType)`.

---

## 5. Tracciamento e costi (admin)

Ogni invocazione LLM deve loggare:

- `userId`, `conversationId`, `phase`, `provider`, `model`
- `inputTokens`, `outputTokens`, `latencyMs`, `estimatedCostUsd`

Alimenta la console admin (vedi [`admin-capabilities-plan.md`](../planning/admin-capabilities-plan.md)).

---

## 6. Roadmap tecnica

| Step | Deliverable |
| ---- | ----------- |
| R0 | Claude-only, fallback mock (B9) ✓ |
| R1 | Documentazione allineata (questo file + architettura) ✓ |
| R2 | `RoutingHints` in IntentModel + log strutturato usage |
| R3 | Abstraction `LlmProvider` + registry |
| R4 | Primo secondo provider (es. OpenAI) behind flag |
| R5 | Selezione automatica + admin template per provider |

---

## 7. Riferimenti codice e doc

- [`docs/product/architecture/technical-architecture.md`](../architecture/technical-architecture.md) — § Motore AI e routing
- [`docs/product/ai/ai-prompt-engine-design.md`](./ai-prompt-engine-design.md) — IntentModel e fasi
- [`docs/product/planning/backend-implementation-plan.md`](../planning/backend-implementation-plan.md) — B9, B10+
