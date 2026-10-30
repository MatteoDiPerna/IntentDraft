# Documentazione IntentDraft

Indice generale della cartella `docs/`. Il codice applicativo vive in `frontend/` (e in futuro `backend/`).

## Mappa

```
docs/
├── README.md                 ← sei qui
├── concept/                  Idea di prodotto (sorgente)
├── process/                  Meta-processi di progettazione
└── product/                  Specifiche beta (requisiti, architettura, roadmap)
    ├── README.md
    ├── requirements/
    ├── experience/
    ├── architecture/
    ├── ai/
    ├── decisions/
    ├── planning/
    ├── quality/
    └── discovery/
```

## Concept

| Documento              | Percorso                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| Brainstorming iniziale | [`concept/initial-brainstorming.md`](concept/initial-brainstorming.md) |

## Process

| Documento                                   | Percorso                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| Prompt pianificazione Cursor (fase analisi) | [`process/cursor-planning-prompt.md`](process/cursor-planning-prompt.md) |

## Product (beta)

Indice dettagliato: [`product/README.md`](product/README.md).

| Area             | Contenuto                                   |
| ---------------- | ------------------------------------------- |
| **requirements** | Requisiti funzionali e non funzionali       |
| **experience**   | User journey e UX                           |
| **architecture** | Architettura, database, operazioni FE/BE    |
| **ai**           | Motore interpretazione e generazione prompt |
| **decisions**    | Decisioni aperte e ADR                      |
| **planning**     | Roadmap beta e frontend                     |
| **quality**      | Test e valutazione                          |
| **discovery**    | Assessment repository                       |

## Convenzioni

- I nomi file restano stabili (es. `product-requirements.md`) per tracciabilità FR/BETA/FE.
- I riferimenti incrociati usano path relativi dalla cartella del documento o link dall’indice `product/README.md`.
- Non spostare `concept/initial-brainstorming.md` senza aggiornare gli indici: è il documento sorgente dell’idea.

## Codice correlato

| Percorso                       | Descrizione                                      |
| ------------------------------ | ------------------------------------------------ |
| [`../frontend/`](../frontend/) | UI Vite/React (adapter API pronti, mock default) |
| [`../worklog.md`](../worklog.md) | **Worklog** — prossimi passi ordinati per lo sviluppatore |
| [`../backend/`](../backend/) | API Fastify + Prisma (PostgreSQL / Supabase) |
| [`product/architecture/cloud-deployment-guide.md`](product/architecture/cloud-deployment-guide.md) | Guida deploy localhost → cloud |
| [`product/planning/backend-implementation-plan.md`](product/planning/backend-implementation-plan.md) | Piano backend demo → beta AI |
| [`../scripts/`](../scripts/)   | Utility repo (es. allineamento tabelle Markdown) |
