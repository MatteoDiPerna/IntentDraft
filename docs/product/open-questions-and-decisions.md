# Decisioni aperte e registro decisioni — PromptPilot

**Documento:** `open-questions-and-decisions.md`  
**Versione:** 1.2  
**Ultimo aggiornamento decisioni founder:** 2026-10-25

Legenda **stato:** `Open` | `Proposed` | `Accepted` | `Deferred`

---

## Riepilogo decisioni founder (2026-10-25)

| ID     | Decisione sintetica                                                                            |
| ------ | ---------------------------------------------------------------------------------------------- |
| OQ-001 | **Vite React TS** (template) + **API Node** + **Prisma/MySQL** (vedi ADR-001)                  |
| OQ-013 | Template [react-typescript-template](https://github.com/luismalamoc/react-typescript-template) |
| OQ-014 | Cookie httpOnly + tabella **`sessions`**                                                       |
| OQ-015 | **Prisma**                                                                                     |
| OQ-002 | **Anthropic Claude Sonnet** — integrazione API **fase tardiva**                                |
| OQ-003 | **C** — Persistenza server + DB (con account)                                                  |
| OQ-004 | **A** — Prodotto generalista                                                                   |
| OQ-005 | **A** — Solo uso locale / team (localhost), no hosting ora                                     |
| OQ-006 | Nome **PromptPilot**                                                                           |
| OQ-007 | Pagamenti **versione ufficiale v1**, non ora                                                   |
| OQ-008 | **Solo testo prompt** — no esecuzione task nel prodotto                                        |
| OQ-009 | **Upload file — Must** in beta                                                                 |
| OQ-010 | **Auth utente subito** + **MySQL**                                                             |
| OQ-012 | Hosting/privacy produzione **rinviati** — localhost                                            |
| —      | Lingue **IT + EN**; pilota **notes / post LinkedIn**; requisiti FR approvati                   |

---

## Decisioni accettate

### OQ-001 — Stack applicativo

| Campo         | Valore                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| **Stato**     | `Accepted` (rivisto con template UI)                                                                         |
| **Decisione** | **Frontend:** Vite + React + TS (template OQ-013). **Backend:** Node API + **Prisma** + **MySQL**. Monorepo. |
| **Nota**      | Scelta originale Next monolith sostituita per allineamento al template e confini chiari multi-utente.        |
| **ADR**       | [`adr-001-stack-and-auth.md`](adr-001-stack-and-auth.md)                                                     |

### OQ-002 — Provider LLM e modello

| Campo         | Valore                                                                           |
| ------------- | -------------------------------------------------------------------------------- |
| **Stato**     | `Accepted` (provider) · implementazione **`Deferred`**                           |
| **Decisione** | **Anthropic — Claude Sonnet** quando si integrerà l’API                          |
| **Nota**      | Fase iniziale: fondamenta FE/BE **senza** chiamate LLM; flag `LLM_ENABLED=false` |
| **ADR**       | ADR-002 al kickoff integrazione (fase BETA-060+)                                 |

### OQ-003 — Persistenza conversazioni

| Campo         | Valore                                |
| ------------- | ------------------------------------- |
| **Stato**     | `Accepted`                            |
| **Decisione** | **C** — DB MySQL + utente autenticato |
| **Schema**    | `database-design.md`                  |

### OQ-004 — Segmento

| Campo         | Valore              |
| ------------- | ------------------- |
| **Stato**     | `Accepted`          |
| **Decisione** | **A** — generalista |

### OQ-005 — Accesso e costi inferenza

| Campo         | Valore                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| **Stato**     | `Accepted` (fase corrente)                                                        |
| **Decisione** | **A** — sviluppo **localhost**, solo founder/team; nessun deploy pubblico per ora |
| **Nota**      | Rate limit e budget cloud rilevanti quando si attiva LLM + hosting                |

### OQ-006 — Nome

| Campo         | Valore          |
| ------------- | --------------- |
| **Stato**     | `Accepted`      |
| **Decisione** | **PromptPilot** |

### OQ-007 — Pagamenti

| Campo         | Valore                                                                        |
| ------------- | ----------------------------------------------------------------------------- |
| **Stato**     | `Deferred`                                                                    |
| **Decisione** | Pagamenti nella **prima versione ufficiale**, non in questa fase; da indagare |

### OQ-008 — Esecuzione integrata

| Campo         | Valore                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| **Stato**     | `Accepted`                                                             |
| **Decisione** | **No** — output principale = **prompt (testo)**; utente esegue altrove |

### OQ-009 — Upload file

| Campo         | Valore                                                         |
| ------------- | -------------------------------------------------------------- |
| **Stato**     | `Accepted`                                                     |
| **Decisione** | **Must** in beta — vedi `frontend-backend-operations.md` OP-F* |

### OQ-010 — Autenticazione e DBMS

| Campo         | Valore                                         |
| ------------- | ---------------------------------------------- |
| **Stato**     | `Accepted`                                     |
| **Decisione** | **Login/registrazione subito**; DBMS **MySQL** |

### OQ-012 — Hosting e conformità

| Campo         | Valore                                                           |
| ------------- | ---------------------------------------------------------------- |
| **Stato**     | `Deferred`                                                       |
| **Decisione** | Tutto **localhost** per ora; domande hosting/GDPR **più avanti** |

---

## Decisioni ancora aperte / proposte

### OQ-011 — Libreria template / cronologia avanzata

| Campo     | Valore                                      |
| --------- | ------------------------------------------- |
| **Stato** | `Deferred`                                  |
| **Nota**  | Cronologia base coperta da DB conversazioni |

### OQ-013 — Template UI frontend

| Campo         | Valore                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------- |
| **Stato**     | `Accepted`                                                                                        |
| **Decisione** | [luismalamoc/react-typescript-template](https://github.com/luismalamoc/react-typescript-template) |
| **Task**      | FOUND-040, FOUND-041 — no Firebase; auth via backend                                              |

### OQ-014 — Meccanismo sessione

| Campo         | Valore                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| **Stato**     | `Accepted`                                                                 |
| **Decisione** | Cookie **httpOnly** + tabella MySQL **`sessions`** (revoca e multi-device) |
| **Doc**       | `database-design.md` §6 · ADR-001                                          |

### OQ-015 — ORM

| Campo         | Valore                                           |
| ------------- | ------------------------------------------------ |
| **Stato**     | `Accepted`                                       |
| **Decisione** | **Prisma** + MySQL                               |
| **Motivo**    | Migrazioni, tipi, adatto a crescita multi-utente |

---

## ADR

| ID ADR  | Titolo                          | Stato                                                    |
| ------- | ------------------------------- | -------------------------------------------------------- |
| ADR-001 | Stack FE/BE + Prisma + sessioni | [`adr-001-stack-and-auth.md`](adr-001-stack-and-auth.md) |
| ADR-002 | Anthropic Sonnet                | Da scrivere (pre-integrazione LLM)                       |
| ADR-003 | (incluso in ADR-001)            | —                                                        |

---

## Tracciabilità

OQ-013, OQ-014, OQ-015 **Accepted** — vedi ADR-001 e documenti architettura/roadmap.
