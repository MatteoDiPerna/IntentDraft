# Requisiti di prodotto — PromptPilot (beta)

**Documento:** `product-requirements.md`  
**Versione:** 1.1  
**Stato:** **Approvato dal founder** (2026-10-25) — aggiornato per auth, MySQL, upload, i18n  
**Fonti:** [`../../concept/initial-brainstorming.md`](../../concept/initial-brainstorming.md), [`../discovery/repository-assessment.md`](../discovery/repository-assessment.md)

---

## 1. Executive summary

PromptPilot è un assistente conversazionale per utenti **non esperti** di prompt engineering. L’utente descrive in linguaggio naturale cosa vuole ottenere; il sistema interpreta l’intento, chiede chiarimenti mirati quando servono, e produce un **prompt strutturato** da usare in un LLM esterno (copia/incolla).

**Obiettivo beta:** produrre un **prompt testuale** di qualità (copiabile in un LLM esterno), con flusso conversazionale, **account**, **persistenza su MySQL** e **upload file**. Pagamenti ed hosting cloud **non** fanno parte di questa fase; integrazione **Anthropic Claude Sonnet** in **fase implementativa successiva** alle fondamenta FE/BE.

---

## 2. Problema e opportunità

**Problema:** molti utenti sanno *cosa* vogliono ma non *come* istruire un LLM (contesto, vincoli, formato, verifiche). Risultati generici, allucinazioni non controllate, troppi round-trip.

**Opportunità:** un layer di **comprensione dell’intento + gap analysis + composizione** può differenziarsi dalla riscrittura puramente stilistica, soprattutto su compiti complessi e professionali (brainstorming §6).

---

## 3. Target

| Segmento                                 | Priorità beta | Note                                       |
| ---------------------------------------- | ------------- | ------------------------------------------ |
| **Generalista** (decisione OQ-004 **A**) | **Primario**  | Notes, post social, email, compiti vari    |
| Professionisti / PMI                     | Secondario    | Stessi flussi, validazione pilota semplice |
| Studenti                                 | Could         | WTP incerto                                |

**Metodo di validazione segmento:** 15–20 richieste reali + 5–8 interviste (brainstorming §13); metriche in §12.

---

## 4. Personas essenziali

### P1 — Laura, analista commerciale

Usa ChatGPT per bozze. Frustrata quando deve riscrivere tre volte una richiesta. Non conosce “system prompt” o JSON.

### P2 — Marco, project manager

Compiti multi-step (piano, comunicazione stakeholder). Vuole chiarezza e checklist nel prompt finale.

### P3 — Giulia, consulente

Attenta a tono e destinatario. Ha bisogno che il sistema chieda **pubblico** e **formato** quando mancano.

---

## 5. Jobs-to-be-done

| JTBD                                                                                                  | Outcome desiderato                         |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Quando devo ottenere un output utile da un LLM, voglio tradurre il mio bisogno in istruzioni complete | Meno iterazioni, meno ambiguità            |
| Quando non so quali dettagli servono, voglio domande semplici e pertinenti                            | Prompt allineato al risultato reale        |
| Quando il compito è articolato, voglio passaggi ordinati nel prompt                                   | Esecuzione più controllata nel LLM esterno |
| Quando il prompt è pronto, voglio copiarlo e adattarlo rapidamente                                    | Controllo e portabilità                    |

---

## 6. Casi d’uso prioritari (beta)

| ID    | Caso                                           | Priorità |
| ----- | ---------------------------------------------- | -------- |
| UC-01 | Richiesta semplice → prompt senza chiarimenti  | Must     |
| UC-02 | Richiesta ambigua → 1–N domande → prompt       | Must     |
| UC-03 | Richiesta complessa → decomposition nel prompt | Must     |
| UC-04 | Revisione manuale e rigenerazione prompt       | Must     |
| UC-05 | Copia negli appunti                            | Must     |
| UC-06 | Input vuoto / non supportato / troppo vago     | Must     |
| UC-07 | Errore provider / timeout                      | Must     |
| UC-08 | Feedback minimo (“utile / non utile”)          | Should   |
| UC-09 | Registrazione / login / logout                 | Must     |
| UC-10 | Upload file associato a conversazione          | Must     |
| UC-11 | Ripresa conversazione dopo refresh (DB)        | Must     |

---

## 7. Proposta di valore

> Tu spieghi cosa vuoi ottenere. PromptPilot trasforma la tua idea in istruzioni chiare per il tuo LLM — chiedendo solo ciò che conta.

Non: “prompt più lunghi”. Sì: intento, vincoli, formato, verificabilità, assunzioni esplicite.

---

## 8. Obiettivi della beta

1. **Completamento flusso:** ≥80% sessioni pilota arrivano a prompt copiabile (metrica ipotesi, da calibrare).
2. **Qualità percepita:** maggioranza valutazioni “utile” su dataset interno (rubric in `testing-and-evaluation.md`).
3. **Efficienza chiarimenti:** mediana ≤2 domande per sessioni che richiedono chiarimenti (ipotesi).
4. **Affidabilità tecnica:** errori non gestiti < soglia definita in test (NFR).

---

## 9. Non-obiettivi e fuori scope beta

| Elemento                        | MoSCoW             | Motivazione                          |
| ------------------------------- | ------------------ | ------------------------------------ |
| Esecuzione prompt nel prodotto  | **Won't**          | OQ-008 — output = testo prompt       |
| Account / login                 | **Must**           | OQ-010 — auth subito                 |
| Persistenza conversazioni       | **Must**           | OQ-003 **C** — MySQL                 |
| Upload file                     | **Must**           | OQ-009 — beta                        |
| Pagamenti                       | **Won't** (ora)    | OQ-007 — v1 ufficiale futura         |
| Hosting cloud / deploy pubblico | **Won't** (ora)    | OQ-005 **A**, OQ-012 — localhost     |
| Integrazione LLM Anthropic      | **Must** (roadmap) | OQ-002 — **dopo** fondamenta FE/BE   |
| Scelta modello da UI            | **Could**          | Config server; Sonnet default futuro |
| Template UI GitHub              | **Should**         | OQ-013 — scelta repo in corso        |
| Multi-utente / team             | **Won't**          | Fase post-beta                       |
| Analytics avanzate              | **Could**          | Dopo pilota                          |

---

## 10. Requisiti funzionali

| ID         | Requisito                                                                                                                      | MoSCoW | Traccia            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------ |
| **FR-001** | L’utente può inserire una richiesta testuale libera (multilinea).                                                              | Must   | UC-01, BETA-030    |
| **FR-002** | Il sistema analizza la richiesta e produce un’**interpretazione** comprensibile (obiettivo, contesto noto, assunzioni).        | Must   | UC-01–03, BETA-040 |
| **FR-003** | Il sistema rileva gap critici e pone **domande di chiarimento** in linguaggio non tecnico.                                     | Must   | UC-02, BETA-040    |
| **FR-004** | Il sistema limita le domande (no questionario eccessivo su richieste semplici).                                                | Must   | BETA-040, TEST     |
| **FR-005** | L’utente può rispondere ai chiarimenti e il sistema aggiorna l’interpretazione.                                                | Must   | UC-02, BETA-035    |
| **FR-006** | Il sistema genera un **prompt finale** strutturato e adattato alla complessità del task.                                       | Must   | UC-01–03, BETA-045 |
| **FR-007** | Per compiti complessi, il prompt può includere **passaggi / sotto-compiti** ordinati (decomposition testuale, non esecuzione). | Must   | UC-03, BETA-045    |
| **FR-008** | L’utente può **modificare** il testo del prompt nell’UI.                                                                       | Must   | UC-04, BETA-050    |
| **FR-009** | L’utente può **rigenerare** il prompt (stesso contesto conversazionale).                                                       | Must   | UC-04, BETA-050    |
| **FR-010** | L’utente può **copiare** il prompt negli appunti con feedback di successo.                                                     | Must   | UC-05, BETA-050    |
| **FR-011** | Il sistema dichiara **assunzioni** quando procede senza chiarimento.                                                           | Must   | BETA-040           |
| **FR-012** | Il sistema gestisce richieste **fuori ambito** o non supportate con messaggio chiaro (senza prompt fittizio).                  | Must   | UC-06, BETA-055    |
| **FR-013** | L’utente può avviare una **nuova sessione** / conversazione.                                                                   | Must   | BETA-035           |
| **FR-014** | Stati di **caricamento** visibili durante le chiamate al modello.                                                              | Must   | BETA-030           |
| **FR-015** | Messaggi di **errore recuperabili** (retry) e non recuperabili.                                                                | Must   | UC-07, BETA-060    |
| **FR-016** | Informativa su **limiti** (non garanzia correttezza, dati inviati al provider LLM).                                            | Must   | BETA-065           |
| **FR-017** | Feedback opzionale utile/non utile sul prompt.                                                                                 | Should | UC-08, BETA-070    |
| **FR-018** | Mostrare conteggio approssimativo domande rimanenti / progresso conversazione.                                                 | Could  | BETA-050           |
| **FR-019** | Esportazione prompt come file `.txt`.                                                                                          | Could  | Post-beta          |
| **FR-020** | Adattamento etichetta sezioni prompt per “tipo attività” (scrittura, analisi, …).                                              | Should | BETA-045           |
| **FR-021** | Registrazione, login, logout con sessione sicura (cookie httpOnly).                                                            | Must   | FOUND-010–014      |
| **FR-022** | Conversazioni e messaggi persistiti per utente autenticato (sopravvivono al refresh).                                          | Must   | FOUND-030–034      |
| **FR-023** | Upload file (tipi e dimensione limitati) collegabile a una conversazione.                                                      | Must   | FOUND-035–038      |
| **FR-024** | Interfaccia e messaggi di sistema in **italiano e inglese** (selezione lingua).                                                | Must   | FOUND-015          |

---

## 11. Requisiti non funzionali

| ID          | Requisito                                                                                | MoSCoW | Note             |
| ----------- | ---------------------------------------------------------------------------------------- | ------ | ---------------- |
| **NFR-001** | Chiavi API LLM **solo server-side**; mai esposte al client.                              | Must   | BETA-020         |
| **NFR-002** | Timeout configurabile sulle chiamate provider; UX di retry.                              | Must   | BETA-060         |
| **NFR-003** | Rate limiting base anti-abuso (per IP/sessione).                                         | Must   | BETA-060, OQ-005 |
| **NFR-004** | Validazione input: lunghezza max, sanitizzazione base.                                   | Must   | BETA-055         |
| **NFR-005** | Log minimizzati: no contenuto conversazione in log produzione di default.                | Must   | BETA-060         |
| **NFR-006** | Tempo risposta percepito: feedback entro 500 ms UI; operazioni LLM async con indicatori. | Should |                  |
| **NFR-007** | UI **responsive** (mobile usable).                                                       | Should | BETA-030         |
| **NFR-008** | Accessibilità: navigazione tastiera, contrasto, label form (WCAG 2.1 AA come target).    | Should | BETA-075         |
| **NFR-009** | UI **IT + EN**; prompt generati in lingua coerente con preferenza utente (default IT).   | Must   | FOUND-015        |
| **NFR-012** | Password hash sicuro (bcrypt/argon2); nessuna password in chiaro in DB o log.            | Must   | FOUND-010        |
| **NFR-013** | MySQL locale documentato; migrazioni versionate.                                         | Must   | FOUND-020–022    |
| **NFR-010** | Costo inferenza monitorato (metriche per sessione).                                      | Should | BETA-060         |
| **NFR-011** | Disponibilità target beta: best-effort; nessun SLA formale.                              | Could  |                  |

---

## 12. Criteri di accettazione (requisiti Must)

### FR-001

- **Dato** la home/chat, **quando** l’utente inserisce testo e invia, **allora** la richiesta appare nel thread e scatta l’analisi.

### FR-003 / FR-004

- **Dato** una richiesta con ambiguità ad alto impatto (es. “fammi un piano marketing” senza pubblico), **allora** compare almeno una domanda mirata entro 2 turni.
- **Dato** “Scrivimi un’email di ringraziamento al cliente Mario per l’ordine di ieri, tono cordiale”, **allora** zero domande obbligatorie prima della generazione (eventuali assunzioni esplicite).

### FR-006 / FR-007

- **Dato** contesto sufficiente, **allora** il prompt include obiettivo, contesto/input noti, formato output o criteri di qualità quando rilevanti.
- **Dato** richiesta multi-step (es. analisi vendite + raccomandazioni + slide), **allora** il prompt contiene elenco numerato di passaggi.

### FR-010

- **Dato** prompt visualizzato, **quando** l’utente clicca Copia, **allora** clipboard contiene il testo integrale e compare conferma non tecnica.

### FR-011

- **Quando** il sistema procede senza chiedere un dato utile, **allora** l’interpretazione elenca l’assunzione in linguaggio plain.

### FR-012

- **Dato** richiesta chiaramente fuori scope (es. consiglio medico/legal), **allora** rifiuto educato + nessun prompt che simuli expertise certificata.

### FR-015

- **Dato** errore 503 provider simulato, **allora** messaggio comprensibile + azione Riprova.

### NFR-001

- **Verifica:** ispezione bundle client e network tab — nessuna chiave API; solo endpoint backend.

### FR-021

- **Dato** credenziali valide, **quando** login, **allora** sessione creata e pagine protette accessibili.
- **Quando** logout, **allora** sessione invalidata.

### FR-022 / FR-023

- **Dato** utente loggato, **dopo** refresh, **allora** conversazioni e messaggi ancora visibili.
- **Dato** file ammesso, **quando** upload completato, **allora** compare in lista allegati conversazione.

### FR-024

- **Quando** utente seleziona EN, **allora** label UI principali in inglese (copertura minima definita in FOUND-015).

---

## 13. Assunzioni

- Output prodotto = **testo prompt** (OQ-008 **Accepted**); esecuzione solo in LLM esterno.
- **MySQL** su localhost; nessun hosting produzione in questa fase (OQ-012 **Deferred**).
- Provider LLM: **Anthropic Claude Sonnet** (OQ-002); codice integrato **dopo** auth/DB/upload.
- Pilota qualità su casi **semplici**: note / post LinkedIn (founder 2026-10-25).
- Template visivo da repo GitHub esterna (OQ-013 **Open**).

---

## 14. Decisioni aperte

Vedi [`../decisions/open-questions-and-decisions.md`](../decisions/open-questions-and-decisions.md) (OQ-001 … OQ-012).

---

## 15. Rischi prodotto e dipendenze

| Rischio                          | Mitigazione                                                  |
| -------------------------------- | ------------------------------------------------------------ |
| Percepito come “ChatGPT wrapper” | Trasparenza interpretazione + decomposition + rubric qualità |
| Troppe domande                   | Policy in `ai-prompt-engine-design.md`                       |
| Costi LLM                        | Rate limit, beta chiusa                                      |
| Qualità variabile                | Test regressione prompt + dataset                            |
| Dipendenza provider              | Astrazione sottile API                                       |

---

## 16. Metriche e ipotesi di validazione

| Metrica                                             | Tipo     | Uso               |
| --------------------------------------------------- | -------- | ----------------- |
| Tasso completamento flusso → copia                  | Prodotto | Successo beta     |
| N. domande chiarimento / sessione                   | Prodotto | UX                |
| % rigenerazioni                                     | Prodotto | Qualità percepita |
| Tempo a prompt soddisfacente                        | Prodotto | Efficienza        |
| Costo USD/sessione                                  | Tecnico  | Sostenibilità     |
| Score rubric (aderenza, completezza, no invenzioni) | Qualità  | Go/No-Go          |

Baseline di confronto: richiesta utente incollata direttamente nello stesso LLM **vs** prompt PromptPilot (stesso modello downstream) — metodo in `testing-and-evaluation.md`.

---

## 17. Tracciabilità

| Obiettivo beta         | Requisiti                  | Test       | Roadmap        |
| ---------------------- | -------------------------- | ---------- | -------------- |
| Auth e account         | FR-021, NFR-012            | T-AUTH-*   | FOUND-010–014  |
| Persistenza            | FR-022, NFR-013            | T-DB-*     | FOUND-020–034  |
| Upload                 | FR-023                     | T-FILE-*   | FOUND-035–038  |
| i18n                   | FR-024, NFR-009            | T-I18N-*   | FOUND-015      |
| Flusso conversazionale | FR-001–005, FR-013–014     | T-CONV-*   | BETA-050+ (AI) |
| Prompt di qualità      | FR-006–007, FR-011, FR-020 | T-PROMPT-* | BETA-060+      |
| Controllo utente       | FR-008–010                 | T-E2E-03   | BETA-050+      |
| Robustezza             | FR-012, FR-015             | T-ERR-*    | BETA-054+      |
| Trust                  | FR-016, NFR-001, NFR-005   | T-SEC-*    | BETA-072+      |
