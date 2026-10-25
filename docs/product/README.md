# Documentazione prodotto — PromptPilot

Indice documentazione prodotto e tecnica.

### Stato (2026-10-25)

- [X] Pacchetto documenti 1–8 + DB + operazioni FE/BE
- [X] Decisioni founder registrate (`open-questions-and-decisions.md` v1.2)
- [X] Requisiti approvati (`product-requirements.md` v1.1)
- [ ] Implementazione **FOUND-010+** (Vite FE + Node API + Prisma/MySQL)
- [ ] Integrazione **Claude Sonnet** (fase tardiva, BETA-060+)
- [X] Template UI: [react-typescript-template](https://github.com/luismalamoc/react-typescript-template) (**OQ-013**)
- [X] Sessioni DB + **Prisma** (**OQ-014**, **OQ-015**, ADR-001)

| #   | Documento                                                            | Contenuto                             |
| --- | -------------------------------------------------------------------- | ------------------------------------- |
| —   | [`../initial-brainstorming.md`](../initial-brainstorming.md)         | Concept sorgente                      |
| 1   | [`product-requirements.md`](product-requirements.md)                 | FR/NFR, MoSCoW                        |
| 2   | [`user-journeys-and-ux.md`](user-journeys-and-ux.md)                 | Journey, stati UI, scenari            |
| 3   | [`technical-architecture.md`](technical-architecture.md)             | Architettura FE/BE + MySQL + AI (fasi) |
| 4   | [`ai-prompt-engine-design.md`](ai-prompt-engine-design.md)           | IntentModel, flusso AI                |
| 5   | [`testing-and-evaluation.md`](testing-and-evaluation.md)             | Test, rubric, pilota notes/LinkedIn   |
| 6   | [`beta-roadmap.md`](beta-roadmap.md)                                 | FOUND + BETA checklist                |
| 7   | [`open-questions-and-decisions.md`](open-questions-and-decisions.md) | Registro decisioni                    |
| 8   | [`repository-assessment.md`](repository-assessment.md)               | Stato repo                            |
| 9   | [`database-design.md`](database-design.md)                           | Schema MySQL / ER                     |
| 10  | [`frontend-backend-operations.md`](frontend-backend-operations.md)   | Operazioni API e collaborazione FE/BE |
| 11  | [`adr-001-stack-and-auth.md`](adr-001-stack-and-auth.md)             | ADR stack, Prisma, sessioni, template |

**Prossimo passo:** **FOUND-010** in `beta-roadmap.md` (scaffold progetto locale).
