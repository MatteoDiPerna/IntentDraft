# Test e valutazione qualità — PromptPilot (beta)

**Documento:** `testing-and-evaluation.md`  
**Versione:** 1.0  
**Stack test:** da allineare a OQ-001 — ipotesi **Vitest/Jest** (unit/integration) + **Playwright** (E2E) per Next.js.

---

## 1. Strategia generale

| Livello                    | Scopo                                     | Tool ipotizzato       |
| -------------------------- | ----------------------------------------- | --------------------- |
| Unit                       | Validatori, orchestrator puro, parse JSON | Vitest                |
| Integration                | API routes con LLM mockato                | Vitest + MSW          |
| E2E                        | Flussi UI critici                         | Playwright            |
| Valutazione qualità prompt | Rubric su dataset                         | Script + review umana |

**Regola:** non inventare risultati; definire test e criteri attesi.

---

## 2. Mock del provider LLM

- Fixture JSON IntentModel / PromptArtifact per scenari 1–3 (`user-journeys-and-ux.md`).
- Test errori: 429, 503, body malformato, timeout.
- Test regressione: hash struttura sezioni prompt (non testo verbatim instabile).

---

## 3. Test funzionali mappati

### 3.0 Fondamenta (T-AUTH / T-DB / T-FILE)

| ID        | Descrizione                          | FR/NFR | Pass                     |
| --------- | ------------------------------------ | ------ | ------------------------ |
| T-AUTH-01 | Register + login + accesso protetto  | FR-021 | 200 + cookie             |
| T-AUTH-02 | Logout invalida sessione             | FR-021 | 401 su `/me`             |
| T-DB-01   | Conversazione sopravvive refresh     | FR-022 | stesso `conversation_id` |
| T-FILE-01 | Upload file ammesso in conversazione | FR-023 | record DB + file FS      |
| T-I18N-01 | Switch IT→EN su label auth           | FR-024 | testo EN visibile        |

### 3.1 Conversazione (T-CONV)

| ID        | Descrizione                                       | FR     | Pass                               |
| --------- | ------------------------------------------------- | ------ | ---------------------------------- |
| T-CONV-01 | Richiesta semplice → nessuna domanda obbligatoria | FR-004 | 0 questions with critical unfilled |
| T-CONV-02 | Ambiguità marketing → almeno 1 domanda            | FR-003 | ≥1 question                        |
| T-CONV-03 | Dopo 3 turni → assumptions non vuote              | FR-011 | assumptions.length ≥ 1             |
| T-CONV-04 | Merge risposta utente aggiorna intent             | FR-005 | objective/audience aggiornati      |

### 3.2 Prompt (T-PROMPT)

| ID          | Descrizione                                     | FR     | Pass                    |
| ----------- | ----------------------------------------------- | ------ | ----------------------- |
| T-PROMPT-01 | Prompt contiene obiettivo esplicito             | FR-006 | regex / section         |
| T-PROMPT-02 | Assunzioni visibili in prompt o UI              | FR-011 | section "Assunzioni"    |
| T-PROMPT-03 | Caso Excel+presentazione → ≥4 passaggi numerati | FR-007 | count steps             |
| T-PROMPT-04 | No dati inventati su input vuoto                | NFR    | no fake "file allegato" |

### 3.3 E2E (T-E2E)

| ID       | Descrizione                                | Pass                     |
| -------- | ------------------------------------------ | ------------------------ |
| T-E2E-01 | Invio richiesta → interpretazione visibile | UI text present          |
| T-E2E-02 | Flusso chiarimento completo                | 2 turni                  |
| T-E2E-03 | Copia clipboard                            | navigator.clipboard mock |
| T-E2E-04 | Rigenera sostituisce prompt                | content change           |
| T-E2E-05 | Nuova conversazione resetta stato          | thread empty             |

### 3.4 Errori (T-ERR)

| ID       | Descrizione          | FR      |
| -------- | -------------------- | ------- |
| T-ERR-01 | 503 → Riprova        | FR-015  |
| T-ERR-02 | Input vuoto bloccato | FR-001  |
| T-ERR-03 | Input > max chars    | NFR-004 |

### 3.5 Sicurezza (T-SEC)

| ID       | Descrizione                                            | FR      |
| -------- | ------------------------------------------------------ | ------- |
| T-SEC-01 | Richiesta medico → refusal, no prompt                  | FR-012  |
| T-SEC-02 | API key assente in bundle client                       | NFR-001 |
| T-SEC-03 | Injection phrase in user msg → no privilege escalation | engine  |

---

## 4. Dataset di valutazione iniziale

**Fonte:** 15–20 richieste sintetiche ispirate a brainstorming + 5 reali anonimizzate (con consenso).

| ID caso     | Tipo                           | Note                         |
| ----------- | ------------------------------ | ---------------------------- |
| EV-01       | **Note** / appunti strutturati | Pilota founder (semplice)    |
| EV-02       | **Post LinkedIn** breve        | Pilota founder (semplice)    |
| EV-03       | Excel + presentazione          | Caso complesso (differito)   |
| EV-04       | Riassunto articolo (no URL)    | gap input                    |
| EV-05       | Codice Python script           | taskType other               |
| EV-06       | Consiglio legale               | refusal                      |
| EV-07–EV-15 | Vari professionali             | report, slide, meeting notes |

Conservare in `tests/fixtures/eval/` (da creare in implementazione).

---

## 5. Rubric di valutazione (1–5)

Valutazione **umana primaria**; LLM-as-judge solo supporto opzionale e mai unico criterio.

| Criterio               | 1                      | 3           | 5                                  |
| ---------------------- | ---------------------- | ----------- | ---------------------------------- |
| **Aderenza obiettivo** | Fuori tema             | Parziale    | Allineato                          |
| **Completezza**        | Mancano vincoli chiave | Accettabile | Copre contesto utente              |
| **Chiarezza**          | Confuso                | Usabile     | Chiaro per LLM                     |
| **Ambiguità gestite**  | Ignorate               | Parziale    | Domande/assunzioni corrette        |
| **Vincoli rispettati** | Violati                | Parziale    | Rispettati                         |
| **No invenzioni**      | Dati inventati         | Lievi       | Solo fatti dati/assunzioni marcate |
| **Proporzione**        | Troppo lungo/corto     | OK          | Adatto al task                     |

**Pass caso:** mediana ≥ 4 su Aderenza, Completezza, No invenzioni; nessun 1 su No invenzioni.

---

## 6. Baseline comparativa

Per ogni caso EV-*:

1. **Baseline A:** testo utente originale → stesso LLM downstream (manuale o script).  
2. **Trattamento:** prompt PromptPilot → stesso LLM, stessi parametri.  
3. Confronto cieco (ordine random) da 2 revisori su rubric.  
4. **Successo ipotesi:** PromptPilot vince o pareggia in ≥70% casi su Completezza + Aderenza.

---

## 7. Metriche tecniche

| Metrica                        | Target beta (ipotesi)  |
| ------------------------------ | ---------------------- |
| p95 latency API (mock escluso) | < 15s                  |
| Error rate 5xx                 | < 2% sessioni          |
| JSON parse failure dopo retry  | < 1%                   |
| Token medi / sessione          | Monitor + soglia alert |

---

## 8. Metriche prodotto (pilota)

- Tasso completamento → copia  
- Domande medie / sessione  
- % feedback positivo (FR-017)  
- % sessioni con rigenerazione  

---

## 9. Criteri pass/fail beta (qualità)

| Gate | Criterio                                       |
| ---- | ---------------------------------------------- |
| G1   | 100% test T-E2E Must verdi in CI               |
| G2   | ≥80% casi EV pass rubric                       |
| G3   | Baseline beat/pareggio ≥70%                    |
| G4   | Zero leak chiavi API in audit manuale          |
| G5   | Informativa privacy/limiti pubblicata (FR-016) |

---

## 10. Limiti e rischi valutazione

- Rubric soggettiva → più revisori.  
- LLM downstream stochastico → ripetizioni multiple per casi borderline.  
- Dataset piccolo → non generalizzabile.  
- Overfitting prompt di sistema → test regressione struttura, non frasi fisse.

---

## 11. Tracciabilità

| Requisito Must | Test minimi              |
| -------------- | ------------------------ |
| FR-003–005     | T-CONV-02, T-CONV-04     |
| FR-006–007     | T-PROMPT-01, T-PROMPT-03 |
| FR-010         | T-E2E-03                 |
| FR-012         | T-SEC-01                 |
| FR-015         | T-ERR-01                 |
| NFR-001        | T-SEC-02                 |

Roadmap: BETA-080–BETA-095.
