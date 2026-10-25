# Requisiti di prodotto — PromptPilot (beta)

**Documento:** `product-requirements.md`  
**Versione:** 1.0  
**Stato:** Proposta di progettazione — non approvata dal founder  
**Fonti:** `docs/initial-brainstorming.md`, `repository-assessment.md`

---

## 1. Executive summary

PromptPilot è un assistente conversazionale per utenti **non esperti** di prompt engineering. L’utente descrive in linguaggio naturale cosa vuole ottenere; il sistema interpreta l’intento, chiede chiarimenti mirati quando servono, e produce un **prompt strutturato** da usare in un LLM esterno (copia/incolla).

**Obiettivo beta:** dimostrare che il flusso riduce ambiguità e iterazioni rispetto a “incollare la richiesta grezza” o a una semplice riscrittura generica, senza introdurre account, pagamenti o esecuzione integrata dei task.

---

## 2. Problema e opportunità

**Problema:** molti utenti sanno *cosa* vogliono ma non *come* istruire un LLM (contesto, vincoli, formato, verifiche). Risultati generici, allucinazioni non controllate, troppi round-trip.

**Opportunità:** un layer di **comprensione dell’intento + gap analysis + composizione** può differenziarsi dalla riscrittura puramente stilistica, soprattutto su compiti complessi e professionali (brainstorming §6).

---

## 3. Target

| Segmento | Priorità beta | Note |
|----------|---------------|------|
| Professionisti che usano già LLM per lavoro | **Primario (ipotesi)** | Report, email, presentazioni, analisi |
| PMI / liberi professionisti | Secondario | Stessi casi d’uso, meno tempo per validazione iniziale |
| Studenti | Could post-beta | WTP incerto |
| Uso personale generalista | Could | Ampio ma debole differenziazione |

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

| JTBD | Outcome desiderato |
|------|-------------------|
| Quando devo ottenere un output utile da un LLM, voglio tradurre il mio bisogno in istruzioni complete | Meno iterazioni, meno ambiguità |
| Quando non so quali dettagli servono, voglio domande semplici e pertinenti | Prompt allineato al risultato reale |
| Quando il compito è articolato, voglio passaggi ordinati nel prompt | Esecuzione più controllata nel LLM esterno |
| Quando il prompt è pronto, voglio copiarlo e adattarlo rapidamente | Controllo e portabilità |

---

## 6. Casi d’uso prioritari (beta)

| ID | Caso | Priorità |
|----|------|----------|
| UC-01 | Richiesta semplice → prompt senza chiarimenti | Must |
| UC-02 | Richiesta ambigua → 1–N domande → prompt | Must |
| UC-03 | Richiesta complessa → decomposition nel prompt | Must |
| UC-04 | Revisione manuale e rigenerazione prompt | Must |
| UC-05 | Copia negli appunti | Must |
| UC-06 | Input vuoto / non supportato / troppo vago | Must |
| UC-07 | Errore provider / timeout | Must |
| UC-08 | Feedback minimo (“utile / non utile”) | Should |

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

| Elemento | MoSCoW | Motivazione |
|----------|--------|-------------|
| Esecuzione prompt nel prodotto | **Won't** | Riduce scope; OQ-008 |
| Account / login | **Won't** | Non necessario per validare valore core |
| Cronologia cloud / libreria | **Won't** | Privacy e complessità |
| Upload file | **Won't** | Injection e privacy |
| Pagamenti | **Won't** | Pre-validazione |
| Scelta modello da UI | **Could** | Config lato server in beta |
| Template predefiniti | **Could** post-beta | |
| Multi-utente / team | **Won't** | |
| Analytics avanzate | **Should** minimo (eventi aggregati anonimi) | Solo se privacy-compatible |

---

## 10. Requisiti funzionali

| ID | Requisito | MoSCoW | Traccia |
|----|-----------|--------|---------|
| **FR-001** | L’utente può inserire una richiesta testuale libera (multilinea). | Must | UC-01, BETA-030 |
| **FR-002** | Il sistema analizza la richiesta e produce un’**interpretazione** comprensibile (obiettivo, contesto noto, assunzioni). | Must | UC-01–03, BETA-040 |
| **FR-003** | Il sistema rileva gap critici e pone **domande di chiarimento** in linguaggio non tecnico. | Must | UC-02, BETA-040 |
| **FR-004** | Il sistema limita le domande (no questionario eccessivo su richieste semplici). | Must | BETA-040, TEST |
| **FR-005** | L’utente può rispondere ai chiarimenti e il sistema aggiorna l’interpretazione. | Must | UC-02, BETA-035 |
| **FR-006** | Il sistema genera un **prompt finale** strutturato e adattato alla complessità del task. | Must | UC-01–03, BETA-045 |
| **FR-007** | Per compiti complessi, il prompt può includere **passaggi / sotto-compiti** ordinati (decomposition testuale, non esecuzione). | Must | UC-03, BETA-045 |
| **FR-008** | L’utente può **modificare** il testo del prompt nell’UI. | Must | UC-04, BETA-050 |
| **FR-009** | L’utente può **rigenerare** il prompt (stesso contesto conversazionale). | Must | UC-04, BETA-050 |
| **FR-010** | L’utente può **copiare** il prompt negli appunti con feedback di successo. | Must | UC-05, BETA-050 |
| **FR-011** | Il sistema dichiara **assunzioni** quando procede senza chiarimento. | Must | BETA-040 |
| **FR-012** | Il sistema gestisce richieste **fuori ambito** o non supportate con messaggio chiaro (senza prompt fittizio). | Must | UC-06, BETA-055 |
| **FR-013** | L’utente può avviare una **nuova sessione** / conversazione. | Must | BETA-035 |
| **FR-014** | Stati di **caricamento** visibili durante le chiamate al modello. | Must | BETA-030 |
| **FR-015** | Messaggi di **errore recuperabili** (retry) e non recuperabili. | Must | UC-07, BETA-060 |
| **FR-016** | Informativa su **limiti** (non garanzia correttezza, dati inviati al provider LLM). | Must | BETA-065 |
| **FR-017** | Feedback opzionale utile/non utile sul prompt. | Should | UC-08, BETA-070 |
| **FR-018** | Mostrare conteggio approssimativo domande rimanenti / progresso conversazione. | Could | BETA-050 |
| **FR-019** | Esportazione prompt come file `.txt`. | Could | Post-beta |
| **FR-020** | Adattamento etichetta sezioni prompt per “tipo attività” (scrittura, analisi, …). | Should | BETA-045 |

---

## 11. Requisiti non funzionali

| ID | Requisito | MoSCoW | Note |
|----|-----------|--------|------|
| **NFR-001** | Chiavi API LLM **solo server-side**; mai esposte al client. | Must | BETA-020 |
| **NFR-002** | Timeout configurabile sulle chiamate provider; UX di retry. | Must | BETA-060 |
| **NFR-003** | Rate limiting base anti-abuso (per IP/sessione). | Must | BETA-060, OQ-005 |
| **NFR-004** | Validazione input: lunghezza max, sanitizzazione base. | Must | BETA-055 |
| **NFR-005** | Log minimizzati: no contenuto conversazione in log produzione di default. | Must | BETA-060 |
| **NFR-006** | Tempo risposta percepito: feedback entro 500 ms UI; operazioni LLM async con indicatori. | Should | |
| **NFR-007** | UI **responsive** (mobile usable). | Should | BETA-030 |
| **NFR-008** | Accessibilità: navigazione tastiera, contrasto, label form (WCAG 2.1 AA come target). | Should | BETA-075 |
| **NFR-009** | Lingua UI italiana; prompt generati in lingua coerente con l’utente (default IT). | Must | |
| **NFR-010** | Costo inferenza monitorato (metriche per sessione). | Should | BETA-060 |
| **NFR-011** | Disponibilità target beta: best-effort; nessun SLA formale. | Could | |

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

---

## 13. Assunzioni

- Beta = **generazione + copia**, LLM esterno (**Ipotesi**, allineata OQ-008 Proposed).
- Utenti beta italiani o bilingui; contenuti principalmente in italiano.
- Un provider LLM unico in v1 implementazione.
- Sessione non persistita oltre tab/browser salvo decisione OQ-003.

---

## 14. Decisioni aperte

Vedi `open-questions-and-decisions.md` (OQ-001 … OQ-012).

---

## 15. Rischi prodotto e dipendenze

| Rischio | Mitigazione |
|---------|-------------|
| Percepito come “ChatGPT wrapper” | Trasparenza interpretazione + decomposition + rubric qualità |
| Troppe domande | Policy in `ai-prompt-engine-design.md` |
| Costi LLM | Rate limit, beta chiusa |
| Qualità variabile | Test regressione prompt + dataset |
| Dipendenza provider | Astrazione sottile API |

---

## 16. Metriche e ipotesi di validazione

| Metrica | Tipo | Uso |
|---------|------|-----|
| Tasso completamento flusso → copia | Prodotto | Successo beta |
| N. domande chiarimento / sessione | Prodotto | UX |
| % rigenerazioni | Prodotto | Qualità percepita |
| Tempo a prompt soddisfacente | Prodotto | Efficienza |
| Costo USD/sessione | Tecnico | Sostenibilità |
| Score rubric (aderenza, completezza, no invenzioni) | Qualità | Go/No-Go |

Baseline di confronto: richiesta utente incollata direttamente nello stesso LLM **vs** prompt PromptPilot (stesso modello downstream) — metodo in `testing-and-evaluation.md`.

---

## 17. Tracciabilità

| Obiettivo beta | Requisiti | Test | Roadmap |
|----------------|-----------|------|---------|
| Flusso conversazionale | FR-001–005, FR-013–014 | T-CONV-* | BETA-030–035 |
| Prompt di qualità | FR-006–007, FR-011, FR-020 | T-PROMPT-* | BETA-040–045 |
| Controllo utente | FR-008–010 | T-E2E-03 | BETA-050 |
| Robustezza | FR-012, FR-015 | T-ERR-* | BETA-055–060 |
| Trust | FR-016, NFR-001, NFR-005 | T-SEC-* | BETA-065 |
