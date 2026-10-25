# Roadmap frontend — PromptPilot (fase 1)

**Documento:** `frontend-roadmap.md`  
**Versione:** 1.2  
**Scope:** solo UI in `frontend/` — **mock API** (localStorage + motore demo); **backend in fase 2** (Node, Prisma, MySQL, delete/rename/pin via API).  
**Template base:** [react-typescript-template](https://github.com/luismalamoc/react-typescript-template)  
**Stato fase 1:** mock + **rifacimento UX chat/sidebar/brand** (2026-10-25) — **verifica umana pending**

**Legenda:** `[X]` completato · `[~]` completato ma sostituito/semplificato · `[ ]` da fare

---

## Obiettivo fase (aggiornato)

Applicazione Vite/React navigabile in locale con:

- landing + auth mock (registrazione, login demo, logout);
- i18n IT/EN (file `.ts` centralizzati);
- **shell chat semplificata** (input in alto, risultato/prompt in basso, mock engine);
- sidebar stile ChatGPT (collassabile, logo, Progetti / Fissate / Recenti);
- azioni chat su **Recenti** (rinomina, sposta in progetto, elimina, fissa) — solo store locale;
- brand (logo PNG trasparente, favicon, script `npm run brand:assets`);
- upload file (UI mock).

**DoD verifica umana:** `npm run dev` → home → accesso demo → `#/app` → nuova chat → invia → (eventuali domande) → risultato → copia; sidebar: collassa/espandi, rinomina/elimina/fissa chat recente; impostazioni lingua/tema; nessuno scroll orizzontale sidebar.

---

## FE-0 — Scaffold e template

- [X] FE-001 — Cartella `frontend/` da template (Vite, TS, Tailwind, Radix base) — **P0**
- [X] FE-002 — `package.json` PromptPilot, script dev/build, path alias `@/` — **P0**
- [X] FE-003 — Theme light/dark (next-themes) — **P1**
- [X] FE-004 — README `frontend/README.md` avvio locale — **P1**

---

## FE-1 — i18n e layout

- [X] FE-010 — i18next IT/EN — **P0** — FR-024 *(switch spostato in menu impostazioni ⚙; visitatori: stesso menu)*  
- [X] FE-011 — `MainLayout` (header, footer, viewport `/app` senza scroll pagina) — **P0** *(link **Limiti e privacy** nel **footer**, non in header)*  
- [X] FE-012 — Pagina statica Limiti e privacy — **P1** — FR-016  
- [X] FE-013 — Traduzioni in `src/i18n/locales/it.ts` e `en.ts` — **P0**

---

## FE-2 — Auth (UI + mock)

- [X] FE-020 — Pagine Login / Register (react-hook-form + zod) — **P0** — FR-021  
- [X] FE-021 — `authStore` mock (localStorage users + session) — **P0**  
- [X] FE-022 — Route protette + redirect — **P0**  
- [X] FE-023 — Logout + menu utente — **P0**  
- [X] FE-024 — Accesso demo (`loginDemo`) per valutazione UI — **P1**

---

## FE-3 — Conversazioni (mock persistenza)

- [~] FE-030 — Sidebar lista conversazioni + Nuova — **P0** — FR-013, FR-022 *(sostituito da FE-070)*  
- [X] FE-031 — Modello messaggi / stati UI in store (`pinned`, `inProject`, titolo) — **P0**  
- [X] FE-032 — Persistenza conversazioni in localStorage (per utente mock) — **P0**  
- [X] FE-033 — `deleteConversation`, `renameConversation`, `togglePin`, `toggleInProject` — **P0** *(solo client; API in fase 2)*

---

## FE-4 — Chat e flusso prompt (mock engine)

- [X] FE-040 — Composer + thread (bubble user/assistant, area messaggi compatta) — **P0** — FR-001  
- [X] FE-041 — Stati loading / analyzing / generating — **P0** — FR-014  
- [~] FE-042 — Pannello «Cosa ho capito» — **P0** — FR-002, FR-011 *(rimosso per UX semplice; interpretazione resta in store per mock engine)*  
- [X] FE-043 — Domande chiarimento + skip assunzione — **P0** — FR-003–005  
- [X] FE-044 — Area **Risultato** (ex editor prompt) + Rigenera + conferma — **P0** — FR-008–009  
- [X] FE-045 — Copia negli appunti + toast — **P0** — FR-010  
- [X] FE-046 — Mock engine (notes + LinkedIn, edge empty input) — **P0**  
- [X] FE-047 — Messaggi errore / fuori scope (demo) — **P1** — FR-012, FR-015  
- [X] FE-048 — Empty state nuova chat (titolo + sottotitolo) — **P1**

---

## FE-5 — Upload (UI mock)

- [X] FE-050 — Pulsante file stile app (`FileInputButton`) + lista allegati — **P0** — FR-023  
- [X] FE-051 — Validazione client (tipo/dimensione) + copy i18n errori — **P1** — NFR-004  
- [ ] FE-052 — Upload reale verso API (multipart) — **P0** *(bloccato: backend)*

---

## FE-6 — Qualità UI

- [~] FE-060 — Responsive mobile — **P1** — NFR-007 *(pannello dettagli mobile rimosso con layout semplificato; da rivedere su device reali)*  
- [X] FE-061 — Build produzione senza errori TS — **P0**  
- [X] FE-062 — `.env.example` (`VITE_API_URL`, `VITE_USE_MOCK=true`) — **P1**  
- [X] FE-063 — Gutter ~30px, footer ancorato, home/auth centrati — **P1**

---

## FE-7 — UX chat, sidebar, brand (2026-10-25)

- [X] FE-070 — Sidebar collassabile (default aperta), logo espandi se chiusa — **P0**  
- [X] FE-071 — Sezioni: Nuova chat, Progetti (cartella mock), Fissate, Recenti — **P0**  
- [X] FE-072 — Azioni hover su Recenti: rinomina, progetto, elimina, fissa + tooltip — **P0**  
- [X] FE-073 — Allineamento header colonne (`shellHeaderRow` h-16) — **P1**  
- [X] FE-074 — Menu impostazioni (lingua segmentata IT/EN, tema) — **P0**  
- [X] FE-075 — Brand: `src/assets/brand/`, logo trasparente, favicon, `BrandLogo` — **P0**  
- [X] FE-076 — Sidebar: niente scrollbar orizzontale (overlay icone) — **P1**

---

## FE-8 — Landing pubblica

- [X] FE-080 — Home marketing (`PublicPageFrame`, logo, feature list i18n) — **P1**  
- [ ] FE-081 — Allineamento visivo landing ↔ app autenticata (token brand unificati ovunque) — **P2**  
- [ ] FE-082 — SEO base home (Helmet, meta OG) — **P2**

---

## Verifica umana (checklist)

- [ ] Registrazione nuovo utente  
- [ ] Login / logout + **accesso demo**  
- [ ] Impostazioni: switch IT ↔ EN e tema chiaro/scuro  
- [ ] Landing → Accedi / Registrati  
- [ ] Sidebar: collassa / espandi (logo), Nuova chat  
- [ ] Recenti: hover azioni, **rinomina**, **fissa**, **sposta in progetto**, **elimina**  
- [ ] Nuova chat → messaggio «organizza appunti riunione» → risultato → **copia**  
- [ ] Messaggio vago LinkedIn → domande → risposta → risultato  
- [ ] Upload file (lista visibile)  
- [ ] Footer: link Limiti e privacy  
- [ ] Favicon e logo sidebar/header coerenti  

---

## Mancante — solo frontend (pre-backend)

| ID | Descrizione | Priorità | Note |
|----|-------------|----------|------|
| FE-100 | Completare **verifica umana** checklist sopra | P0 | Gate prima di considerare fase 1 chiusa |
| FE-101 | Stesse azioni hover (o menu) su chat **Fissate** e **Progetti** | P2 | Oggi solo **Recenti** |
| FE-102 | Progetti: più cartelle / CRUD cartelle (mock) | P2 | Oggi una «cartella principale» + flag `inProject` |
| FE-103 | Conferma modale prima di **elimina** chat | P1 | UX sicurezza |
| FE-104 | Titolo chat auto da primo messaggio (mock) | P2 | Oggi default «Nuova chat» fino a rinomina |
| FE-105 | Client API tipizzato + adapter store (`VITE_USE_MOCK`) | P0 | Preparazione fase 2; stub senza BE ok |
| FE-106 | Gestione errori rete / retry UI quando API esiste | P1 | Dopo FE-105 |
| FE-107 | Test E2E smoke (Playwright) login → chat → copia | P2 | Opzionale beta |
| FE-108 | `.gitignore` / repo: non versionare `dist/`, `node_modules` | P1 | Igiene repo |
| FE-109 | Accessibilità pass (focus trap impostazioni, keyboard sidebar) | P2 | NFR |

---

## Fase 2 — Backend (non in scope attuale)

Quando si lavorerà sul backend, il frontend dovrà:

- sostituire persistenza locale con API (`VITE_USE_MOCK=false`);
- collegare **DELETE/PATCH** conversazioni (elimina, rinomina, pin, progetto);
- upload file verso storage/API;
- auth JWT/session reale al posto di `authStore` mock;
- motore prompt **Claude Sonnet** lato server (sostituisce `mockConversationEngine`).

Riferimenti: [`beta-roadmap.md`](beta-roadmap.md) (FOUND-*), [`../architecture/frontend-backend-operations.md`](../architecture/frontend-backend-operations.md).

---

## Post verifica umana (ordine suggerito)

1. FE-100 checklist + fix regressions  
2. FE-103 conferma elimina (se serve)  
3. FE-105 adapter API (interfacce pronte, mock still default)  
4. Backend FOUND-011+ in parallelo quando team passa al BE  
5. Integrazione LLM reale (BETA-060+)
