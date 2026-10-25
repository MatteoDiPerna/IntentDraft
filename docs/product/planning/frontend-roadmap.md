# Roadmap frontend — PromptPilot (fase 1)

**Documento:** `frontend-roadmap.md`  
**Versione:** 1.1  
**Scope:** solo UI in `frontend/` — **mock API** (localStorage + motore demo); backend in fase 2.  
**Template base:** [react-typescript-template](https://github.com/luismalamoc/react-typescript-template)  
**Stato fase 1:** implementata (2026-10-25) — **verifica umana pending**

**Legenda:** `[X]` completato · `[ ]` da fare

---

## Obiettivo fase

Applicazione Vite/React navigabile in locale con:

- login/registrazione (mock, persistenza locale);
- i18n IT/EN;
- shell chat + pannello interpretazione + editor prompt;
- upload file (UI + lista, mock);
- flusso conversazionale **demo** (notes / post LinkedIn) fino a copia prompt.

**DoD verifica umana:** `npm run dev` → registrati → nuova chat → invia richiesta → (eventuali domande) → prompt → copia.

---

## FE-0 — Scaffold e template

- [X] FE-001 — Cartella `frontend/` da template (Vite, TS, Tailwind, Radix base) — **P0**
- [X] FE-002 — `package.json` PromptPilot, script dev/build, path alias `@/` — **P0**
- [X] FE-003 — Theme light/dark (next-themes) — **P1**
- [X] FE-004 — README `frontend/README.md` avvio locale — **P1**

---

## FE-1 — i18n e layout

- [X] FE-010 — i18next IT/EN + switch lingua (header) — **P0** — FR-024
- [X] FE-011 — `MainLayout` PromptPilot (header, footer, link Limiti) — **P0**
- [X] FE-012 — Pagina statica Limiti e privacy (placeholder) — **P1** — FR-016

---

## FE-2 — Auth (UI + mock)

- [X] FE-020 — Pagine Login / Register (react-hook-form + zod) — **P0** — FR-021
- [X] FE-021 — `authStore` mock (localStorage users + session) — **P0**
- [X] FE-022 — Route protette + redirect — **P0**
- [X] FE-023 — Logout + menu utente — **P0**

---

## FE-3 — Conversazioni (mock persistenza)

- [X] FE-030 — Sidebar lista conversazioni + Nuova — **P0** — FR-013, FR-022
- [X] FE-031 — Modello messaggi / stati UI in store — **P0**
- [X] FE-032 — Persistenza conversazioni in localStorage (per utente mock) — **P0**

---

## FE-4 — Chat e flusso prompt (mock engine)

- [X] FE-040 — Composer + thread (bubble user/assistant) — **P0** — FR-001
- [X] FE-041 — Stati loading / analyzing / generating — **P0** — FR-014
- [X] FE-042 — Pannello «Cosa ho capito» (interpretazione + assunzioni) — **P0** — FR-002, FR-011
- [X] FE-043 — Domande chiarimento + skip assunzione — **P0** — FR-003–005
- [X] FE-044 — Editor prompt + Rigenera + conferma sovrascrittura — **P0** — FR-008–009
- [X] FE-045 — Copia negli appunti + toast — **P0** — FR-010
- [X] FE-046 — Mock engine (notes + LinkedIn, edge empty input) — **P0**
- [X] FE-047 — Messaggi errore / fuori scope (demo) — **P1** — FR-012, FR-015

---

## FE-5 — Upload (UI mock)

- [X] FE-050 — Input file + lista allegati conversazione — **P0** — FR-023
- [X] FE-051 — Validazione client (tipo/dimensione) — **P1** — NFR-004

---

## FE-6 — Qualità UI

- [X] FE-060 — Responsive (collapsible pannello dettagli mobile) — **P1** — NFR-007
- [X] FE-061 — Build produzione senza errori TS — **P0**
- [X] FE-062 — `.env.example` (`VITE_API_URL`, `VITE_USE_MOCK=true`) — **P1**

---

## Verifica umana (checklist)

- [ ] Registrazione nuovo utente
- [ ] Login / logout
- [ ] Switch IT ↔ EN
- [ ] Nuova conversazione + messaggio «organizza appunti riunione» → prompt
- [ ] Messaggio vago LinkedIn → domande → risposta → prompt
- [ ] Copia prompt
- [ ] Upload file (lista visibile)
- [ ] Tema chiaro/scuro

---

## Post verifica umana (fase 2)

- Backend Node + Prisma + MySQL (`FOUND-011+`)
- Client API al posto del mock (`VITE_USE_MOCK=false`)
- Vedi [`../architecture/frontend-backend-operations.md`](../architecture/frontend-backend-operations.md)
