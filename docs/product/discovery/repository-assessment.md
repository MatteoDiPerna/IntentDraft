# Valutazione della repository — IntentDraft

**Documento:** `repository-assessment.md`  
**Versione:** 1.1  
**Stato:** Basato su ispezione del 2026-10-25 · fase **PLAN-001**–**PLAN-011** completata  
**Tipo:** **Fatto osservato** (verificato) / **Ipotesi** dove indicato

---

## 1. Executive summary

**Fatto osservato:** la repository `intentdraft` è un monorepo **IntentDraft** (frontend + backend + docs): esiste controllo versione Git, un README minimale e documentazione di concept in `docs/`. **Non** sono presenti codice applicativo, dipendenze, pipeline CI, test, configurazione di build o infrastruttura di deployment.

**Raccomandazione:** la fase di implementazione partirà da **setup fondamentale** (stack, struttura repo, integrazione LLM lato server). La progettazione deve proporre un’architettura minima per la beta senza presupporre componenti già implementati.

---

## 2. Struttura e componenti

### 2.1 Albero verificato (radice)

| Percorso                                 | Tipo           | Note                                  |
| ---------------------------------------- | -------------- | ------------------------------------- |
| `README.md`                              | Documentazione | Tagline prodotto in inglese, una riga |
| `docs/concept/initial-brainstorming.md`  | Documentazione | Concept v0.1, ~695 righe              |
| `docs/process/cursor-planning-prompt.md` | Documentazione | Istruzioni per fase di progettazione  |
| `.git/`                                  | VCS            | Repository Git inizializzato          |

**Fatto osservato:** non esistono cartelle `src/`, `app/`, `packages/`, `tests/`, `.github/`, file di configurazione (`package.json`, `pyproject.toml`, `Dockerfile`, ecc.).

### 2.2 Componenti applicativi

| Componente              | Stato           |
| ----------------------- | --------------- |
| Frontend                | Assente         |
| Backend / API           | Assente         |
| Database                | Assente         |
| Autenticazione          | Assente         |
| Integrazione LLM        | Assente         |
| Logging / osservabilità | Assente         |
| Deployment              | Non configurato |

---

## 3. Stack e versioni

**Fatto osservato:** nessuno stack tecnologico è dichiarato o implementato nella repository.

**Ipotesi / decisione aperta:** la scelta dello stack è documentata in `../architecture/technical-architecture.md` e `../decisions/open-questions-and-decisions.md` (decisione **OQ-001**).

---

## 4. Funzionalità già implementate

Nessuna funzionalità di prodotto è implementata.

Il concept funzionale è descritto in:

- `docs/concept/initial-brainstorming.md` — flusso conversazionale, MVP ipotizzato, principi UX/qualità
- `README.md` — proposta di valore sintetica

---

## 5. Test e controlli di qualità

**Fatto osservato:** assenti test automatizzati, linter, formatter e type checker configurati a livello di progetto.

**Lacuna beta:** andranno introdotti insieme al primo codice (vedi `../quality/testing-and-evaluation.md`, fase roadmap **BETA-010** e successive).

---

## 6. Documentazione esistente

| File                                     | Contenuto                               | Da preservare                |
| ---------------------------------------- | --------------------------------------- | ---------------------------- |
| `docs/concept/initial-brainstorming.md`  | Concept, target, rischi, MVP ipotizzato | Sì — documento sorgente idea |
| `docs/process/cursor-planning-prompt.md` | Processo di progettazione               | Sì — meta-processo           |
| `docs/product/**`                        | Specifiche per area (requirements, …)   | Deliverable beta             |

---

## 7. Debito tecnico e rischi osservati

| Rischio                           | Gravità           | Note                                                                |
| --------------------------------- | ----------------- | ------------------------------------------------------------------- |
| Assenza di codice e contratti API | Alta per timeline | Normale in greenfield; mitigare con architettura e roadmap atomiche |
| Nome prodotto                      | —                 | **IntentDraft** (repo `intentdraft`)                                |
| README con errori grammaticali    | Bassa             | Non blocca beta; migliorare in fase polish                          |
| Nessuna CI                        | Media             | Introduzione consigliata con primo PR significativo                 |
| Decisioni prodotto ancora aperte  | Media             | Registrate in `../decisions/open-questions-and-decisions.md`        |

---

## 8. Lacune rispetto ai requisiti della beta

Rispetto agli obiettivi in `docs/concept/initial-brainstorming.md` e ai requisiti Must in `requirements/product-requirements.md`:

| Area                                               | Lacuna                                   |
| -------------------------------------------------- | ---------------------------------------- |
| UI conversazionale                                 | Da costruire                             |
| Motore interpretazione / chiarimenti / generazione | Da costruire                             |
| Proxy sicuro verso provider LLM                    | Da costruire                             |
| Gestione errori, loading, stati UX                 | Da costruire                             |
| Copia / modifica / rigenerazione prompt            | Da costruire                             |
| Test e dataset di valutazione                      | Da definire ed eseguire                  |
| Privacy policy / informativa uso LLM               | Da redigere (contenuto, non solo codice) |

---

## 9. Elementi da riutilizzare

- **Concept e principi** in `docs/concept/initial-brainstorming.md` (intent, gap analysis, decomposition, qualità)
- **Checklist MVP** sezione 7.1 del brainstorming — allineata ai requisiti FR della beta
- **Tagline** e direzione README — coerente con proposta di valore

Non c’è codice da riutilizzare.

---

## 10. Elementi da chiarire (founder)

Priorità alta — vedi `../decisions/open-questions-and-decisions.md`:

1. Stack tecnologico (**OQ-001**)
2. Provider LLM e modello default (**OQ-002**)
3. Persistenza sessioni / cronologia beta (**OQ-003**)
4. Segmento iniziale e generalista vs focalizzato (**OQ-004**)
5. Hosting e chi paga le inferenze in beta (**OQ-005**)

---

## 11. Cosa non è stato possibile verificare

- Remote Git (presenza di branch protetti, CI su host remoto): non ispezionato oltre `.git/config` locale in questa fase
- Account o chiavi API provider: non applicabile (assenti)
- Conformità legale (GDPR, ecc.): richiede decisione su pubblico e hosting — **non verificato**

---

## 12. Riferimenti incrociati

- Requisiti: `../requirements/product-requirements.md`
- Architettura: `../architecture/technical-architecture.md`
- Roadmap: `../planning/beta-roadmap.md`
