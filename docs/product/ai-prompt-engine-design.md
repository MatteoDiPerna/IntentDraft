# Design motore AI — interpretazione, chiarimenti, generazione

**Documento:** `ai-prompt-engine-design.md`  
**Versione:** 1.0  
**Requisiti:** FR-002–007, FR-011–012, FR-020

---

## 1. Obiettivo del motore

Trasformare messaggi utente in:

1. **IntentModel** strutturato (interpretazione + gap + decisione domande);
2. **PromptArtifact** (testo finale per LLM esterno), eventualmente con decomposition.

**Principio beta:** massimo valore via **istruzioni al modello + validazione deterministica leggera**; niente agenti autonomi multi-step esecutivi.

---

## 2. Schema dati — IntentModel (JSON)

```typescript
// Tipi illustrativi — da implementare in src/types/
interface IntentModel {
  version: "1";
  language: "it" | "en" | string;
  taskSummary: string;
  objective: string;
  audience?: string;
  context?: string;
  inputs?: string[];
  constraints?: string[];
  desiredOutputFormat?: string;
  successCriteria?: string[];
  complexity: "low" | "medium" | "high";
  taskType?:
    | "writing"
    | "analysis"
    | "planning"
    | "communication"
    | "learning"
    | "decision"
    | "research"
    | "other";
  gaps: GapItem[];
  assumptions: AssumptionItem[];
  clarificationPlan: ClarificationPlan;
  decomposition?: TaskStep[];
  safety: SafetyFlags;
}

interface GapItem {
  field: string;
  description: string;
  impact: "critical" | "moderate" | "low";
  canAssume: boolean;
  suggestedAssumption?: string;
}

interface AssumptionItem {
  field: string;
  text: string;
  reason: string;
}

interface ClarificationPlan {
  shouldAsk: boolean;
  questions: ClarificationQuestion[];
  maxTurnsRemaining: number;
}

interface ClarificationQuestion {
  id: string;
  userFacingText: string;
  resolvesGap: string; // field ref
  impact: "critical" | "moderate";
  optionalSkip: boolean;
}

interface TaskStep {
  order: number;
  title: string;
  instruction: string;
  dependsOn?: number[];
}

interface SafetyFlags {
  outOfScope: boolean;
  highStakesDomain?: "medical" | "legal" | "financial" | "other";
  refusalReason?: string;
}
```

---

## 3. PromptArtifact

```typescript
interface PromptArtifact {
  version: "1";
  title: string;
  bodyMarkdown: string; // prompt completo per copia
  sections: { heading: string; content: string }[];
  decompositionIncluded: boolean;
  warnings?: string[]; // es. "Verifica dati sensibili"
}
```

---

## 4. Classificazione taskType

**Raccomandazione:** classificazione **leggera** dentro analisi (campo `taskType`) per adattare etichette sezioni — non pipeline separate per dominio in beta.

---

## 5. Gap analysis e impatto

| impact | Definizione | Azione default |
|--------|-------------|----------------|
| critical | Cambia sostanzialmente output o destinatario | Domanda obbligatoria o assunzione esplicita + conferma |
| moderate | Migliora qualità | Domanda se turni disponibili, altrimenti assunzione |
| low | Dettaglio nice-to-have | Assunzione silenziosa **vietata** — sempre elencare in assumptions se usata |

---

## 6. Criteri: domanda vs procedere vs assunzione

```
function decide(plan, turnCount, maxTurns=3):
  if safety.outOfScope: return REFUSE
  if any gap impact=critical and not filled:
    if canAssume and turnCount >= maxTurns:
      apply suggestedAssumption to assumptions
    else if not canAssume or turnCount < maxTurns:
      return ASK (max 3 questions, sorted by impact desc)
  fill moderate gaps via questions if turnCount < maxTurns else assumptions
  return GENERATE
```

**Regole UX/engine:**

- Richiesta **low complexity** + zero gap critical → **GENERATE** senza domande.
- Non chiedere più di **3 domande** per turno.
- Dopo **3 turni** chiarimenti → procedere con assunzioni visibili (FR-011).

---

## 7. Stato conversazionale (orchestrator)

| Stato engine | Input | Output |
|--------------|-------|--------|
| `ANALYZE` | Tutti i messaggi user | IntentModel |
| `WAIT_USER` | questions non vuote | UI clarifying |
| `GENERATE` | IntentModel consolidato | PromptArtifact |
| `REGENERATE` | IntentModel + feedback opzionale | PromptArtifact |
| `REFUSE` | safety | Messaggio rifiuto |

Stato mantenuto in client come `{ messages, intent?, prompt?, turnCount }`.

---

## 8. System prompt — fase ANALYZE (outline)

Istruzioni chiave al modello:

- Ruolo: analista requisiti per utenti non tecnici.
- Output **solo JSON** conforme IntentModel.
- Non inventare fatti sull’utente; `inputs` solo se menzionati.
- `gaps` solo per informazioni mancanti **rilevanti**.
- `assumptions` vuoto se non necessario.
- Segnalare `safety.outOfScope` per consigli medico/legali/finanziari personalizzati ad alto rischio.
- Lingua domande = lingua utente.

---

## 9. System prompt — fase GENERATE (outline)

- Ruolo: compositore di istruzioni per LLM generalista.
- Input: IntentModel serializzato + transcript conversazione.
- Produrre prompt **autocontenuto** per copia in ChatGPT/Claude/etc.
- Includere: obiettivo, contesto, vincoli, formato output, criteri qualità, divieto inventare dati.
- Se `decomposition` presente o complexity=high → elenco numerato passaggi.
- Sezione “Assunzioni” se non vuota.
- Adattare tono sezioni a `taskType`.
- Output: JSON PromptArtifact **oppure** markdown diretto (prefer JSON + render UI).

---

## 10. Decomposition — criteri

| Condizione | Strategia beta |
|------------|----------------|
| complexity=low | Singolo blocco istruzioni |
| complexity=medium + 2+ fasi distinte | Elenco passaggi nel **singolo** prompt |
| complexity=high + dipendenze chiare | `TaskStep[]` nel IntentModel + sezione passaggi |

**Won't beta:** più prompt coordinati con ID workflow (brainstorming 7.2).

---

## 11. Struttura prompt finale (flessibile)

Sezioni possibili (includere solo pertinenti):

1. Ruolo / prospettiva  
2. Obiettivo  
3. Contesto e destinatario  
4. Input disponibili  
5. Attività (numerate se decomposition)  
6. Vincoli e regole  
7. Formato output  
8. Criteri di qualità e verifica  
9. Assunzioni e limiti  
10. Cosa **non** fare  

---

## 12. Fuori ambito e sicurezza input

- Trattare tutto l’input utente come **untrusted data** (delimitazione XML o JSON quote).
- Rifiuto template per `safety.outOfScope`.
- No esecuzione codice generato dal motore in beta.

---

## 13. Validazione e QA deterministica

Post-LLM (app):

| Check | Azione |
|-------|--------|
| JSON parse fail | Retry prompt “correggi schema” |
| `objective` vuoto | Blocca generate, chiedi chiarimento generico |
| Prompt > MAX_PROMPT_CHARS | Troncamento sezione opzionale o rigenera |
| Parole chiave “ignora istruzioni precedenti” in user input | Log + pass-through senza privilegio |
| Mismatch lingua | Warning + rigenera opzionale |

**Non garantire** factual accuracy — includere disclaimer in UI (FR-016).

---

## 14. Retry e fallback

1. Retry tecnico (429/503/parse error): max 2.  
2. Fallback modello più economico: **Could** post-beta.  
3. Fallback statico: messaggio “riprova più tardi” — no prompt generico di bassa qualità.

---

## 15. Flusso (pseudocodice)

```
onUserSubmit(text):
  append user message
  intent = callLLM_ANALYZE(messages)
  if intent.safety.outOfScope: show refusal; return
  if intent.clarificationPlan.shouldAsk and turnCount < MAX_TURNS:
    show questions; state = WAIT_USER; return
  prompt = callLLM_GENERATE(intent, messages)
  validate(prompt)
  show interpretation + prompt; state = prompt_ready

onUserAnswerClarification(text):
  append message; turnCount++
  goto onUserSubmit (re-analyze with full thread)

onRegenerate():
  prompt = callLLM_GENERATE(intent, messages, hint="variant")
  validate(prompt)
```

---

## 16. Esempi input/output

### Input

“Fammi un post LinkedIn sul nostro nuovo servizio di consulenza.”

### IntentModel (estratti)

- gap critical: pubblico target, tono brand, dettagli servizio  
- clarificationPlan.shouldAsk: true  
- questions: [ “Chi vuoi raggiungere su LinkedIn?”, “Qual è il messaggio principale in una frase?” ]

### Dopo risposta utente → PromptArtifact (estratti)

Sezioni: Obiettivo, Contesto, Vincoli (lunghezza post, no claim non verificabili), Formato (hook + corpo + CTA), Assunzioni.

---

## 17. Limiti noti

- Qualità dipende dal modello scelto (OQ-002).  
- Decomposition testuale non garantisce esecuzione corretta nel LLM downstream.  
- Valutazione umana necessaria per casi ad alto impatto.  
- Classificazione taskType può essere errata — mitigazione: prompt flessibile.

---

## 18. Tracciabilità

| Meccanismo | FR | Test |
|------------|-----|------|
| IntentModel + gap | FR-002–004 | T-CONV-*, T-PROMPT-01 |
| Assumptions | FR-011 | T-PROMPT-02 |
| Decomposition | FR-007 | T-PROMPT-03 |
| Safety | FR-012 | T-SEC-01 |
