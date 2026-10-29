# Specifica implementazione frontend — IntentDraft

**Documento:** `frontend-implementation-spec.md`  
**Versione:** 1.3  
**Data:** 2026-10-29  
**Ultimo aggiornamento checklist:** 2026-10-29 — implementazione agente completata (gate §17 parziale); **test manuali founder → §18**  
**Nome prodotto (canonico):** **IntentDraft** — slug repo/cartella `intentdraft` (OQ-006 aggiornato in `open-questions-and-decisions.md`).
**Audience:** agente AI / sviluppatore che completa il frontend **prima** e **durante** l’integrazione backend  
**Fonti:** tutta la cartella `docs/` (requirements, architecture, UX, ADR-001, roadmap FE, assessment repo) + codice attuale in `frontend/`

---

## 1. Scopo e confini

### 1.1 Obiettivo

Completare la **struttura frontend** dell’app web **IntentDraft** in modo che:

1. **Fase A (pre-backend o backend stub):** esista un layer API tipizzato, adapter mock/reale, tipi allineati al DB, pagine auth/impostazioni pronte, UX chat allineata ai requisiti — **senza** dipendere da MySQL/Anthropic già funzionanti.
2. **Fase B (backend FOUND-*):** sostituire persistenza mock con chiamate HTTP reali (`VITE_USE_MOCK=false`) cambiando **solo** adapter e bootstrap, non i componenti pagina.
3. **Fase C (motore AI BETA-*):** sostituire `mockConversationEngine` con risposte server; UI già predisposta per stati `analyzing` / `clarifying` / `generating` / `prompt_ready`.

### 1.2 Fuori scope di questo documento

- Implementazione backend Node/Prisma/MySQL (solo **contratto** atteso).
- Integrazione Anthropic (solo preparazione tipi e stati UI).
- Pagamenti, hosting produzione, team multi-tenant (OQ-007, OQ-012).
- Esecuzione del prompt dentro IntentDraft (OQ-008 **Accepted** — output = testo copiabile).

### 1.3 Nome prodotto e rebrand

| Elemento | Valore |
| -------- | ------ |
| **Nome app** | **IntentDraft** |
| **Significato** | L’utente esprime un *intento*; l’app produce una *bozza* di istruzioni strutturate da copiare nel proprio LLM. |
| **Tagline (IT)** | Dal tuo intento alla bozza di istruzioni per l’AI. |
| **Tagline (EN)** | From your intent to a draft your AI can follow. |
| **Slug tecnico** | `intentdraft` (package npm, chiavi storage, email demo) |

**Rebrand (§17 Fase 0 — completato):** testi UI (i18n), `index.html`, README, `package.json`, cartella repo `intentdraft/`, remote GitHub `intentdraft`. Chiavi `localStorage` / Zustand: prefisso `intentdraft_*` con lettura one-shot delle chiavi legacy `promptpilot_*` per non perdere sessioni demo.

### 1.4 Estensione richiesta dal founder (non ancora in FR ufficiali)

| Feature | Stato docs prodotto | Istruzione implementazione |
| ------- | ------------------- | -------------------------- |
| **Login con Google** | Non in `product-requirements.md` / ADR-001 | **Must** per questa fase frontend: UI + flusso OAuth redirect; backend dovrà esporre endpoint documentati in §8.6 |
| **Pagina / area impostazioni utente** | Parziale (solo menu ⚙ lingua/tema in navbar) | **Must**: profilo, password (se account locale), preferenze, logout, link privacy |

Registrare in futuro **ADR-004** o aggiornamento OQ quando il backend implementa Google.

---

## 2. Stato attuale del codice (`frontend/`)

### 2.1 Completato (fase 1 mock — verifica umana pending)

| Area | File / modulo | Note |
| ---- | ------------- | ---- |
| Scaffold | Vite, TS, Tailwind, alias `@/` | `package.json`, `vite.config.ts` |
| Routing | `HashRouter`, `AppRoutes.tsx` | Route: `/`, `/login`, `/register`, `/limits`, `/app` |
| Layout | `MainLayout`, `Navbar`, footer + link limiti | |
| Brand | `components/brand/*`, `brand-tokens.css` | Vedi `frontend-brand-ui.md` |
| i18n | `i18n/` IT+EN | Locale in `localStorage` — migrare a `intentdraft_locale` |
| Auth UI | `LoginPage`, `RegisterPage`, `ProtectedRoute` | Form zod + react-hook-form |
| Auth mock | `store/authStore.ts` | Password in chiaro in localStorage — **solo demo** |
| Chat UI | `ChatPage`, `ChatSidebar`, composer, risultato, copia | |
| Mock engine | `lib/mockConversationEngine.ts` + pipeline in `conversationStore` | |
| Conversazioni mock | `conversationStore.ts` + persist Zustand | `pinned`, `inProject` solo client |
| Upload mock | `FileInputButton`, `fileBlobStore.ts` | Blob in IndexedDB/local |
| UX | Sidebar collassabile, pin/progetto/rename/delete su **Recenti** | Delete **senza** modale conferma |
| Modali | `ConfirmModal` | Solo rigenerazione prompt in `ChatPage` |
| Config | `config/index.ts`, `.env.example` | `VITE_API_URL`, `VITE_USE_MOCK` |
| Document preview | `DocumentPreviewPanel`, pdfjs | Extra rispetto a roadmap minima |

### 2.2 Assente o stub (da implementare)

| Lacuna | Evidenza |
| ------ | -------- |
| Client HTTP / API | Nessuna cartella `src/api/` o `src/services/` |
| Adapter mock ↔ API | `appConfig.useMock` usato solo per demo login banner |
| Bootstrap sessione `GET /api/auth/me` | `ProtectedRoute` legge solo Zustand |
| Logout server-side | `logout()` azzera solo stato locale |
| Google OAuth | Nessun riferimento codice |
| Pagina impostazioni / profilo | Solo `SettingsMenu` (lingua/tema) |
| Schemas centralizzati | `schemas/index.ts` vuoto |
| Hooks riusabili | `hooks/index.ts` vuoto |
| Gestione errori API / retry | Non implementata |
| Tipi `IntentModel` / `PromptArtifact` | Solo tipi semplificati in `conversation.ts` |
| Allineamento schema DB | `Conversation` FE ≠ tabella MySQL (metadata pin/progetto) |
| Test automatizzati | Nessun Vitest/Playwright in `frontend/` |
| SEO OG | Helmet base; FE-082 non fatto |
| Feedback utile/non utile | FR-017 Should — assente |
| Contatore caratteri input | NFR-004 — assente in UI |
| `error_fatal` UI state | Definito in UX doc, non in `ConversationUiPhase` |

---

## 3. Principi architetturali frontend (best practice obbligatorie)

### 3.1 Separazione dei layer

```
UI (pages/components)
  → hooks (useAuth, useConversations, …)
    → services / adapters (MockAuthAdapter | ApiAuthAdapter)
      → api/client (fetch wrapper, credentials, parse errori)
```

**Regola:** i componenti React **non** chiamano `fetch` direttamente. **Non** importano `localStorage` per dominio auth/chat (eccetto theme/i18n guest).

### 3.2 Feature flag mock

- `VITE_USE_MOCK=true` (default dev): adapter mock delegano agli store Zustand esistenti **oppure** a MSW — preferenza: **adapter che wrappano gli store** per non duplicare logica demo.
- `VITE_USE_MOCK=false`: stessi metodi adapter chiamano REST; store Zustand diventano **cache UI** sincronizzata da server, non source of truth.

### 3.3 Source of truth

| Dato | Mock (fase A) | Con backend (fase B) |
| ---- | ------------- | -------------------- |
| Sessione utente | `authStore.currentUser` | Cookie httpOnly + `/api/auth/me` |
| Lista chat | `conversationStore.byUser` | GET `/api/conversations` + invalidazione |
| Messaggi thread | Array in conversation | GET `/api/conversations/:id` |
| File allegati | Blob store locale | Metadati API + download URL |
| Prompt testo | Campo `promptText` in store | `prompt_artifacts.body_markdown` via API |
| Pin / cartella progetto | Flag locali | `conversations.metadata` JSON (contratto §8.4) |

### 3.4 Sicurezza client

- **Mai** memorizzare password in chiaro quando `useMock=false`.
- **Mai** mettere chiavi Anthropic o segreti in variabili `VITE_*` (NFR-001).
- Tutte le richieste autenticate: `fetch(url, { credentials: 'include' })`.
- Sanitizzare display name in UI (React escape default); non usare `dangerouslySetInnerHTML` su contenuti utente/LLM senza pipeline markdown sicura.

### 3.5 Errori API

Contratto backend (`frontend-backend-operations.md` §9):

```typescript
interface ApiErrorBody {
  error: {
    code:
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'VALIDATION_ERROR'
      | 'RATE_LIMITED'
      | 'INTERNAL_ERROR'
      | string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

Il client deve:

1. Parsare JSON errori in modo uniforme (`ApiError` class).
2. Mappare `code` → chiavi i18n (`errors.unauthorized`, …).
3. Esporre `isRetryable` per `RATE_LIMITED`, errori rete, 503.

### 3.6 Convenzioni codice (allineate al repo)

- Path alias `@/`.
- Componenti brand da `@/components/brand` per pagine nuove.
- Testi utente in `src/i18n/locales/it.ts` e `en.ts` (**stesso shape TypeScript** — esportare tipo `Translation` da `it.ts` e soddisfarlo in `en.ts`).
- ID client temporanei: `createId()` finché il server non assegna UUID; dopo POST sostituire ID optimistic con ID server.
- Form: **zod** + **react-hook-form**; schemas in `src/schemas/`.
- Stato server async: preferire **TanStack Query (React Query)** v5 **oppure** Zustand + metodi async espliciti — **scegliere una sola strategia**; raccomandazione: **React Query** per cache/liste/invalidation, Zustand solo per UI locale (sidebar collapsed, document preview).

### 3.7 Routing

- Mantenere `HashRouter` (deploy statico semplice) salvo decisione founder.
- Route protette: wrapper `ProtectedRoute` che attende `authStatus: 'loading' | 'authenticated' | 'anonymous'` (bootstrap `/me`).
- Aggiungere route documentate in §7.

---

## 4. Struttura cartelle target

Creare/organizzare (senza spostare file inutilmente se costoso — ma **nuovo codice** va qui):

```
frontend/src/
  api/
    client.ts              # fetch base, credentials, ApiError
    endpoints.ts             # path constants
  adapters/
    types.ts                 # interfacce AuthPort, ConversationPort, …
    mock/
      mockAuthAdapter.ts
      mockConversationAdapter.ts
      mockFilesAdapter.ts
    api/
      apiAuthAdapter.ts
      apiConversationAdapter.ts
      apiFilesAdapter.ts
    index.ts                 # factory getAdapters(appConfig.useMock)
  schemas/
    auth.ts
    profile.ts
    conversation.ts
  types/
    auth.ts                  # estendere User, Session, AuthProvider
    conversation.ts          # allineare a DB + UI phase
    api.ts                   # DTO request/response
    intent.ts                # IntentModel (da ai-prompt-engine-design.md)
    prompt.ts                # PromptArtifact
  hooks/
    useAuth.ts
    useSessionBootstrap.ts
    useConversations.ts
    useConversationDetail.ts
    useFileUpload.ts
  pages/
    auth/                    # esistente
    settings/
      SettingsPage.tsx
      ProfileSection.tsx
      SecuritySection.tsx
      PreferencesSection.tsx
    chat/                    # esistente
  providers/
    AdapterProvider.tsx      # React context con ports
  lib/
    mockConversationEngine.ts  # resta fino a fase AI
  store/
    authStore.ts             # ridurre a cache / deprecare gradualmente
    conversationStore.ts     # idem
    uiStore.ts               # resta UI pura
```

---

## 5. Configurazione ambiente

### 5.1 Variabili `.env`

Aggiornare `.env.example`:

```env
# Backend API
VITE_API_URL=http://localhost:3001

# true = adapter mock (default dev senza backend)
VITE_USE_MOCK=true

# Google OAuth (frontend)
# URL assoluto del backend che avvia il flow (redirect browser)
VITE_GOOGLE_AUTH_START_URL=http://localhost:3001/api/auth/google

# Callback path gestito dal backend; il FE mostra solo stati success/error su /login
# VITE_OAUTH_CALLBACK handled server-side

# Limiti UI (allineare a backend quando esiste)
VITE_MAX_MESSAGE_CHARS=12000
VITE_MAX_UPLOAD_BYTES=5242880
```

Aggiornare `src/vite-env.d.ts` con le nuove chiavi.

### 5.2 CORS (nota per integrazione)

Backend deve consentire origin `http://localhost:5173` con `credentials: true` (ADR-001). Il frontend **non** workarounda CORS.

---

## 6. Tipi e mapping database

### 6.1 User (allineato a `users`)

```typescript
export type Locale = 'it' | 'en';

export type AuthProvider = 'local' | 'google';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  locale: Locale;
  authProvider: AuthProvider;
  hasPassword: boolean; // false per solo-Google
  createdAt: string;
}
```

Rimuovere `StoredUser` e `passwordHash` dal tipo pubblico quando si migra off mock.

### 6.2 Conversation (DB + estensioni UI)

DB (`database-design.md`): `id`, `user_id`, `title`, `status: 'active' | 'archived'`, timestamps.

Frontend aggiunge **metadata** persistita lato server (proporre al backend):

```typescript
export interface ConversationMetadata {
  pinned?: boolean;
  inProject?: boolean;
  projectId?: string | null; // futuro OQ-011; per beta usare solo inProject boolean
}

export interface ConversationSummary {
  id: string;
  title: string;
  status: 'active' | 'archived';
  metadata: ConversationMetadata;
  updatedAt: string;
  createdAt: string;
  lastMessagePreview?: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ChatMessage[];
  latestPrompt?: PromptArtifact | null;
  files: UploadedFileMeta[];
  phase: ConversationUiPhase; // derivato lato FE da ultimo messaggio/stato API
}
```

**Mappatura pin/progetto:** finché non esiste tabella progetti, inviare `PATCH /api/conversations/:id` con body `{ metadata: { pinned, inProject } }`. Il backend salva JSON in colonna `metadata` (**da aggiungere in migrazione** — documentare dipendenza FOUND-012b).

### 6.3 Messaggi

```typescript
export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    interpretation?: Interpretation;
    clarificationQuestions?: ClarificationQuestion[];
    safetyRefusal?: boolean;
  };
  createdAt: string;
}
```

### 6.4 File

```typescript
export interface UploadedFileMeta {
  id: string;
  conversationId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  scanStatus: 'pending' | 'ok' | 'rejected';
  createdAt: string;
  downloadUrl?: string; // path relativo API
}
```

### 6.5 IntentModel e PromptArtifact

Copiare struttura da `docs/product/ai/ai-prompt-engine-design.md` §2–3 in `types/intent.ts` e `types/prompt.ts` **integralmente** (version `"1"`). Il mock engine può continuare a produrre sottoinsiemi; l’UI deve tollerare campi opzionali.

### 6.6 Stati UI conversazione

Estendere `ConversationUiPhase`:

```typescript
export type ConversationUiPhase =
  | 'idle'
  | 'analyzing'
  | 'clarifying'
  | 'ready_to_generate' // opzionale se AI separa analyze/generate
  | 'generating'
  | 'prompt_ready'
  | 'error_recoverable'
  | 'error_fatal'
  | 'unsupported';
```

Derivazione con backend AI (fase C): includere in response messaggio o header `X-Conversation-Phase` **oppure** campo `conversation.phase` nel JSON — fino ad allora derivare da mock/store come oggi.

---

## 7. Routing e pagine da implementare

| Path | Componente | Auth | Descrizione |
| ---- | ---------- | ---- | ----------- |
| `/` | `HomePage` | No | Esistente; allineare token brand (FE-081) |
| `/login` | `LoginPage` | No | + Google + gestione errori OAuth query |
| `/register` | `RegisterPage` | No | |
| `/limits` | `LimitsPage` | No | FR-016 |
| `/app` | `ChatPage` | Sì | Shell chat |
| `/app/settings` | `SettingsPage` | Sì | **Nuova** — impostazioni utente |
| `/auth/callback` | `OAuthCallbackPage` | No | **Nuova** — opzionale se backend redirecta a FE con token/error in query; preferire cookie-only senza token in URL |

### 7.1 OAuth callback (Google)

Flusso raccomandato (sicuro, ADR sessioni):

1. FE: pulsante “Continua con Google” → `window.location.href = VITE_GOOGLE_AUTH_START_URL`.
2. BE: OAuth con Google → crea/aggancia user → `Set-Cookie` sessione → redirect a `http://localhost:5173/#/app` o `/#/login?oauth=success`.
3. FE: su mount app, `useSessionBootstrap` chiama `/me`.

**UI login:**

- Divider “oppure”.
- Pulsante Google con icona + i18n `auth.continueWithGoogle`.
- Stati: loading redirect, errore `auth.googleError`.

Se `useMock=true`, simulare Google con `loginDemo` separato o mock adapter `loginWithGoogle()` che crea user `google@mock.local`.

---

## 8. Contratto API atteso (frontend → backend)

Il backend implementerà FOUND-*; il frontend **deve** essere scritto assumendo questo contratto. Se il backend diverge, aggiornare **questo documento** e gli adapter.

### 8.1 Auth

| Metodo | Path | Body | Success | Note |
| ------ | ---- | ---- | ------- | ---- |
| POST | `/api/auth/register` | `{ email, password, displayName? }` | `201` `{ user }` + Set-Cookie | |
| POST | `/api/auth/login` | `{ email, password }` | `200` `{ user }` + Set-Cookie | |
| POST | `/api/auth/logout` | — | `204` | invalida cookie |
| GET | `/api/auth/me` | — | `200` `{ user }` | `401` se non loggato |
| GET | `/api/auth/google` | — | `302` Google | start OAuth |
| GET | `/api/auth/google/callback` | — | redirect FE + cookie | implementazione BE |

### 8.2 Utente

| Metodo | Path | Body | Success |
| ------ | ---- | ---- | ------- |
| PATCH | `/api/users/me` | `{ displayName?, locale? }` | `200` `{ user }` |
| POST | `/api/users/me/password` | `{ currentPassword, newPassword }` | `204` | solo `hasPassword` |
| DELETE | `/api/users/me` | `{ password }` o conferma | `204` | opzionale P2 |

### 8.3 Conversazioni

| Metodo | Path | Body | Success |
| ------ | ---- | ---- | ------- |
| GET | `/api/conversations` | — | `200` `{ items: ConversationSummary[] }` |
| POST | `/api/conversations` | `{ title? }` | `201` `{ conversation }` |
| GET | `/api/conversations/:id` | — | `200` `ConversationDetail` |
| PATCH | `/api/conversations/:id` | `{ title?, status?, metadata? }` | `200` |
| DELETE | `/api/conversations/:id` | — | `204` |

### 8.4 Messaggi (pre-LLM / post-LLM)

| Metodo | Path | Body | Success |
| ------ | ---- | ---- | ------- |
| POST | `/api/conversations/:id/messages` | `{ content, attachments?: fileIds[] }` | `201` `{ userMessage, assistantMessage?, conversationPhase?, prompt? }` |

Pre-LLM: assistant stub (“Motore AI non collegato”).  
Post-LLM: risposta completa con interpretazione/domande/prompt.

Endpoint aggiuntivi fase AI (preparare tipi FE, implementare adapter stub che throw `NOT_IMPLEMENTED`):

| POST | `/api/conversations/:id/regenerate` | `{ feedback? }` |
| POST | `/api/conversations/:id/skip-clarification` | — |

### 8.5 Prompt artifacts

| Metodo | Path | Body | Success |
| ------ | ---- | ---- | ------- |
| GET | `/api/conversations/:id/prompts/latest` | — | `200` `PromptArtifact` |
| PUT | `/api/prompts/:id` | `{ bodyMarkdown }` | `200` |

### 8.6 File

| Metodo | Path | Body | Success |
| ------ | ---- | ---- | ------- |
| POST | `/api/conversations/:id/files` | `multipart/form-data` | `201` `{ file }` |
| GET | `/api/conversations/:id/files` | — | `200` `{ items }` |
| DELETE | `/api/files/:id` | — | `204` |
| GET | `/api/files/:id/download` | — | stream | aprire in preview o download |

### 8.7 Health

| GET | `/api/health` | — | `200` `{ ok: true, db: true }` |

Usare opzionalmente in banner dev “Backend non raggiungibile”.

---

## 9. Implementazione per area funzionale

### 9.1 FE-105 — Client API e factory adapter (**P0**)

**Task:**

1. Implementare `api/client.ts`:
   - `baseUrl` da config.
   - `request<T>(method, path, options?)` con JSON, FormData per upload.
   - Gestione 401: emettere evento globale o callback `onUnauthorized` → logout + redirect login.
2. Implementare ports in `adapters/types.ts`:
   - `AuthPort`, `UserPort`, `ConversationPort`, `MessagePort`, `FilePort`, `PromptPort`.
3. Mock adapters: delega a logica store esistente (refactor minimo).
4. API adapters: chiamate §8.
5. `getPorts(): Ports` in `adapters/index.ts`.
6. `AdapterProvider` + hook `usePorts()`.

**DoD:** cambiando `.env` da mock a real, l’app tenta HTTP (anche se fallisce finché BE assente); nessun import diretto store auth/conversation dalle pagine **nuove**; pagine esistenti migrate gradualmente.

### 9.2 Autenticazione completa (**P0** — FR-021)

**Login / Register:**

- Rimuovere copy “mock” quando `useMock=false`.
- Disabilitare submit durante `isSubmitting` async verso adapter.
- Mostrare errori `VALIDATION_ERROR` field-level se `details.fields` presente.
- Normalizzare email lato client (trim, lowercase).

**Logout:**

- Chiamare `authPort.logout()` (POST) poi clear cache locale (conversazioni in memory, query cache).
- Redirect `/login`.

**Session bootstrap:**

- Hook `useSessionBootstrap` in `App.tsx` o `ProtectedRoute`:
  - All’avvio: `GET /me` se `!useMock`.
  - Stati: loading spinner globale leggero; failure 401 → anonymous.
- `ProtectedRoute`: se `loading`, mostrare skeleton; se anonymous, redirect.

**Sicurezza UX:**

- Dopo logout, `history.replaceState` e reset store conversazioni (privacy multi-utente stesso browser).

### 9.3 Google Sign-In (**P0** founder)

- UI in `LoginPage` e opzionalmente `RegisterPage` (link “registrati con email”).
- Mock: bottone chiama `authPort.loginWithGoogleMock()`.
- Real: redirect a `VITE_GOOGLE_AUTH_START_URL`.
- i18n + accessibilità (`aria-label`).

### 9.4 Impostazioni utente (**P0** founder)

**Pagina `/app/settings`** (`PublicPageFrame` / `AppPanelFrame` + `GlassPanel`):

Sezioni (tab o scroll):

1. **Profilo:** display name (edit), email read-only, provider badge (Google / password).
2. **Preferenze:** lingua IT/EN (PATCH `/users/me` + i18n), tema (resta client-side `next-themes` + opzionale sync futuro).
3. **Sicurezza:** cambio password (se `hasPassword`); link “Password dimenticata” **P2** (solo placeholder i18n).
4. **Account:** logout button; elimina account **P2**.
5. **Privacy:** link a `/limits`.

**Navbar:**

- Aggiungere voce “Impostazioni” o icona utente → menu dropdown: Impostazioni, Esci.
- Evitare doppio `SettingsMenu` per utenti loggati (oggi Guest + logged mostrano due ingranaggi — **bug UX da correggere**).

### 9.5 Conversazioni (**P0** — FR-022, FR-013)

**Lista / sidebar:**

- Caricare `GET /conversations` on mount / dopo mutazioni.
- Optimistic UI opzionale su create/rename/delete.
- **FE-103:** modale conferma prima di delete (riusare `ConfirmModal`) — anche per chat fissate/progetti quando FE-101 done.
- **FE-104:** titolo auto da primo messaggio — già in store; con API inviare PATCH title dopo primo send.

**Azioni pin / progetto / rename:**

- `PATCH` metadata e title.
- **FE-101:** stesse azioni hover su sezioni Fissate e Progetti (parità UX).

**Nuova chat:**

- POST conversazione; evitare duplicati chat vuote (logica esistente `emptyConversation` / blank recent).

**Persistenza refresh:**

- Con API, dopo F5 la lista torna da server — rimuovere dipendenza persist Zustand per `byUser` quando `useMock=false`.

### 9.6 Messaggi e pipeline chat (**P0** mock, **P1** API)

**Refactor `conversationStore`:**

- Estrarre `runConversationPipeline` behind `MessagePort.sendMessage`.
- Mock: comportamento attuale.
- API: POST message → aggiornare stato da response; **non** simulare delay artificiali se non in mock.

**Allineamento UX doc:**

- Max 3 domande per messaggio assistant (verificare rendering).
- Pulsante skip assunzione (esiste `skipClarification`) — visibile in fase `clarifying`.
- **FR-018 Could:** indicatore progresso turni (“Domanda 1 di 2”) — opzionale.

**Input validation (NFR-004):**

- Contatore caratteri sotto composer con `VITE_MAX_MESSAGE_CHARS`.
- Blocco invio oltre limite + toast.

**Modifica messaggio utente:**

- Mantenere `ChatEditableUserMessage`; con API: strategia **delete messages after + re-post** o endpoint dedicato PATCH — finché assente, inviare nuovo thread come “edit” documentato in commento adapter.

### 9.7 Upload file (**P0** — FR-023)

**FE-052:**

- Progress bar o spinner durante multipart.
- Errori: tipo/dimensione (allineare allowlist a BE).
- Lista allegati da API; preview PDF/testo continua a usare download URL o blob mock.
- Delete file: DELETE endpoint + update UI.

Allowlist attuale client (mantenere finché BE conferma):

- `text/plain`, `text/markdown`, `application/pdf`, docx, eventualmente xlsx se sidebar già mostra icone spreadsheet.

### 9.8 Prompt — copia, modifica, rigenera (**P0**)

- **Copia:** solo FE (FR-010) — già ok.
- **Modifica:** debounce PUT `/prompts/:id` quando API attiva; conflict handling semplice (last write wins).
- **Rigenera:** conferma modale se testo modificato manualmente (UX doc §6) — estendere logica oltre random mock.
- Feedback utile/non utile (**FR-017 Should**): due pulsanti thumb sotto risultato → POST `/api/prompts/:id/feedback` `{ useful: boolean }` (endpoint **da aggiungere backend** — FE prepara UI disabilitata se 404).

### 9.9 Stati errore (**P1** — FR-015)

- `error_recoverable`: banner in chat + pulsante Riprova (re-invoca ultima azione).
- `error_fatal`: pagina/modale con messaggio admin beta.
- Rate limit: toast + backoff suggerito.

Implementare `ErrorBoundary` route-level per crash React.

### 9.10 i18n (**P0** — FR-024)

- Copertura minima FOUND-015: navigazione, auth, chat, errori API, settings, OAuth.
- Preferenza utente loggata: sync `user.locale` da `/me` all’avvio.
- Visitatori: solo localStorage.

### 9.11 Accessibilità (**P2** — NFR-008)

- Focus trap in menu impostazioni e modali (`FocusScope` Radix se aggiunto, o implementazione FE-109).
- `aria-live="polite"` su stati analyzing/generating/error.
- Sidebar: keyboard nav su voci chat (frecce + Enter).
- Contrasto: usare token brand esistenti.

### 9.12 Responsive (**P1** — NFR-007)

- Rivedere `ChatPage` su viewport &lt; 768px: sidebar overlay, pannello document preview full screen.
- Touch target ≥ 44px su controlli sidebar.

### 9.13 Landing e SEO (**P2**)

- FE-081: token brand unificati home ↔ app.
- FE-082: meta OG in `Helmet` su `HomePage`.

### 9.14 Qualità repo (**P1**)

- FE-108: verificare `.gitignore` root e frontend (`dist`, `node_modules`).
- Aggiungere script `lint` / `typecheck` se ESLint introdotto (opzionale P2).

### 9.15 Test (**P2**)

- Vitest: unit su `api/client` parse errori, adapters mock.
- Playwright FE-107: login demo → nuova chat → invio → copia (mock).
- Quando BE pronto: test integrazione manuale checklist §12.

---

## 10. Migrazione mock → API (checklist sviluppatore)

1. Implementare adapter API parallelamente ai mock.
2. Migrare `LoginPage` / `RegisterPage` a `useAuth`.
3. Bootstrap `/me` prima di mostrare `/app`.
4. Migrare sidebar lista a `useConversations`.
5. Migrare send message / upload.
6. Disabilitare `persist` middleware Zustand per dati server (`partialize` solo preferenze UI locali).
7. Test con backend FOUND-013+ su MySQL locale.
8. Rimuovere banner “mock” e account demo in build staging (`VITE_USE_MOCK=false`).

---

## 11. Backlog UX frontend (da roadmap)

| ID | Priorità | Descrizione |
| -- | -------- | ----------- |
| FE-100 | P0 | Completare verifica umana checklist `frontend-roadmap.md` |
| FE-101 | P2 | Azioni hover su Fissate e Progetti |
| FE-102 | P2 | CRUD cartelle progetto (mock/API metadata) |
| FE-103 | P1 | Modale conferma elimina chat |
| FE-104 | P2 | Titolo auto (già parziale) |
| FE-105 | P0 | Adapter API — questo documento §9.1 |
| FE-106 | P1 | Errori rete / retry |
| FE-107 | P2 | Playwright smoke |
| FE-108 | P1 | Igiene gitignore |
| FE-109 | P2 | Pass accessibilità |

---

## 12. Definition of Done — “Frontend pronto per backend”

Considerare chiusa la fase quando **tutti** i punti sono veri:

- [x] Esiste `api/client.ts` + adapter mock/API per auth, user, conversations, messages, files, prompts.
- [x] `VITE_USE_MOCK` commuta senza modifiche ai componenti pagina (solo provider).
- [x] Login, register, logout, bootstrap sessione implementati contro contratto §8.1–8.2.
- [x] Google OAuth UI + flusso redirect documentato; mock funzionante.
- [x] Pagina `/app/settings` con profilo, preferenze, sicurezza, logout.
- [x] Bug doppio ingranaggio navbar risolto.
- [x] Sidebar chat usa port conversazioni; delete con conferma (FE-103).
- [x] Upload usa port files (multipart pronto).
- [x] Tipi `IntentModel` / `PromptArtifact` presenti in `types/`.
- [x] Gestione errori API centralizzata + i18n.
- [x] Contatore caratteri messaggio con limite configurabile.
- [x] `.env.example` aggiornato.
- [x] `npm run build` senza errori TS.
- [x] Documento README frontend aggiornato con mock vs API e OAuth.

---

## 13. Ordine di implementazione consigliato (per agente AI)

Eseguire **in sequenza** per minimizzare rework:

1. **Struttura** — cartelle §4, `api/client.ts`, tipi `api.ts`, errori.
2. **Ports + mock adapters** — wrappare store esistenti.
3. **Hooks auth** — bootstrap `/me`, migrate login/register/logout pages.
4. **Settings page** — profilo + PATCH locale mock/API.
5. **Google OAuth** — UI + mock adapter + env.
6. **Ports conversazioni** — lista/create/delete/rename/patch metadata.
7. **Migrate ChatPage/sidebar** — usare hooks; FE-103 modale delete.
8. **Messages port** — estrarre pipeline; preparare POST API.
9. **Files port** — multipart + UI progress.
10. **Prompt port** — GET/PUT latest; rigenera stub API.
11. **Error/retry UI** — FE-106.
12. **Polish** — a11y, responsive, i18n gap, FE-100 checklist.
13. **Test** — Vitest client; Playwright opzionale.

Parallelo ammesso: i18n strings mentre si implementano feature.

---

## 14. Dipendenze backend esplicite (per fase successiva)

Quando inizierà FOUND-011+, il backend **deve** fornire:

| Priorità | Elemento |
| -------- | -------- |
| P0 | Endpoints §8.1, §8.3, §8.4 (stub assistant), §8.6 |
| P0 | Cookie sessione + CORS credentials |
| P0 | Colonna `conversations.metadata` JSON **o** equivalente per pin/progetto |
| P1 | §8.2 PATCH user locale/displayName |
| P1 | §8.5 prompt artifacts |
| P1 | Google OAuth §8.1 |
| P2 | Feedback prompt, change password endpoint |

Il frontend **non deve bloccarsi** se mancano P1/P2: feature flag UI o disabilitazione graceful.

---

## 15. Tracciabilità requisiti

| Requisito | Sezione doc |
| --------- | ----------- |
| FR-021 Auth | §9.2, §8.1 |
| FR-022 Persistenza | §9.5, §6.2 |
| FR-023 Upload | §9.7 |
| FR-024 i18n | §9.10 |
| FR-001–005 Chat | §9.6 |
| FR-008–010 Prompt | §9.8 |
| FR-014 Loading | §6.6, stati esistenti |
| FR-015 Errori | §9.9 |
| FR-016 Limiti | `/limits` + link settings |
| FR-017 Feedback | §9.8 |
| NFR-004 Validazione input | §9.6 contatore |
| NFR-007 Responsive | §9.12 |
| NFR-008 a11y | §9.11 |
| NFR-001 No secret client | §3.4, §5.1 |

---

## 16. Riferimenti incrociati

| Documento | Path |
| --------- | ---- |
| Requisiti | `docs/product/requirements/product-requirements.md` |
| Operazioni API | `docs/product/architecture/frontend-backend-operations.md` |
| Schema DB | `docs/product/architecture/database-design.md` |
| ADR stack/auth | `docs/product/decisions/adr-001-stack-and-auth.md` |
| UX stati | `docs/product/experience/user-journeys-and-ux.md` |
| Brand UI | `docs/product/experience/frontend-brand-ui.md` |
| Roadmap FE | `docs/product/planning/frontend-roadmap.md` |
| Motore AI (tipi) | `docs/product/ai/ai-prompt-engine-design.md` |
| Test | `docs/product/quality/testing-and-evaluation.md` |

---

**Prossimo passo umano:** review founder di questo documento → handoff ad agente implementazione frontend (**§17 checklist obbligatoria**) → in parallelo avvio backend FOUND-011 con contratto §8.

---

## 17. Checklist / roadmap agente — frontend completo (UX, UI, architettura)

**Istruzioni per l’agente implementatore**

- Eseguire le fasi **in ordine** salvo dove indicato “parallelo”.
- Ogni task ha ID univoco: segnare `[x]` solo con **DoD verificato** (`npm run build` ok + verifica manuale breve dove indicato).
- **Obiettivo finale:** app web **IntentDraft** completa lato frontend — mock funzionante end-to-end, layer API pronto, UX/UI allineata a `user-journeys-and-ux.md` e `frontend-brand-ui.md`. Backend e chiamate AI reali si **agganciano** senza riscrivere pagine (solo adapter + flag env).
- **Non** implementare logica LLM nel browser; **non** esporre segreti in `VITE_*`.

**Legenda priorità:** **P0** bloccante · **P1** alto · **P2** polish

---

### Fase 0 — Rebrand IntentDraft (**P0**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | R-001 | Aggiornare `app.name`, tagline, copy Limiti/auth in `i18n/locales/it.ts` e `en.ts` | Nessuna stringa “PromptPilot” visibile in UI |
| [x] | R-002 | `index.html` `<title>`, meta description | Tab browser = IntentDraft |
| [x] | R-003 | `package.json` / README frontend (`intentdraft-frontend`) | Nome package coerente |
| [x] | R-004 | Email demo `demo@intentdraft.local`; aggiornare hint i18n | Login demo funziona |
| [x] | R-005 | Migrare chiavi storage: `intentdraft_locale`, `intentdraft-theme`, Zustand `intentdraft_*_v1`, IndexedDB blob store | Lettura fallback chiavi `promptpilot_*` una volta |
| [x] | R-006 | Verificare logo/favicon: testo alt e aria-label con IntentDraft | Accessibilità nome app |

---

### Fase 1 — Architettura e best practice (**P0**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | A-001 | Creare `api/client.ts` (credentials, JSON, ApiError) | Unit test o smoke manual su 404/401 |
| [x] | A-002 | `adapters/types.ts` + factory mock/API (§4) | `getPorts()` usabile da provider |
| [x] | A-003 | `AdapterProvider` + `usePorts()` | Pagine non importano store dominio direttamente (obiettivo) |
| [x] | A-004 | Schemas zod in `schemas/auth.ts`, `profile.ts` | Form settings/register condividono schema |
| [x] | A-005 | Tipi `IntentModel`, `PromptArtifact` in `types/intent.ts`, `types/prompt.ts` | Allineati ad `ai-prompt-engine-design.md` |
| [x] | A-006 | `.env.example` completo (§5.1) + `vite-env.d.ts` | Documentato in README |
| [x] | A-007 | (Raccomandato) TanStack Query per liste/mutazioni server | Facade `useConversations` + `refreshFromApi`; TanStack opzionale post-BE |

---

### Fase 2 — Auth, sessione, Google (**P0**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | U-001 | `useSessionBootstrap` + stati loading in `ProtectedRoute` | Refresh `/app` con mock: utente resta loggato |
| [x] | U-002 | Login/register async via `AuthPort`; rimuovere copy “mock” se `useMock=false` | Errori API mappati i18n |
| [x] | U-003 | Logout: POST adapter + clear cache conversazioni | Navbar logout ok |
| [x] | U-004 | Pulsante **Continua con Google** + redirect URL env | Mock: login Google simulato |
| [x] | U-005 | Gestione query `?oauth=error` su login | Messaggio umano, no stack trace |
| [x] | U-006 | Pagina `/app/settings` (§7) con sezioni profilo/preferenze/sicurezza | Brand `GlassPanel` / `AppPanelFrame` |
| [x] | U-007 | PATCH profilo (displayName, locale) via `UserPort` | IT/EN sync con i18n |
| [x] | U-008 | Cambio password UI (disabilitata se `!hasPassword`) | Form zod + messaggi errore |
| [x] | U-009 | **UX navbar:** un solo menu impostazioni; dropdown utente (Impostazioni, Esci) | Niente doppio ingranaggio |
| [x] | U-010 | Link “Password dimenticata” placeholder i18n (**P2**) | Non blocca |

---

### Fase 3 — UX/UI pagine pubbliche (**P1**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | P-001 | **Home:** hero con tagline IntentDraft, CTA Accedi/Registrati, feature list aggiornata | `PublicPageFrame` + token brand |
| [x] | P-002 | Allineamento visivo landing ↔ app autenticata (FE-081) | `PublicPageFrame` usa `BrandScene subtle` come `AppPanelFrame` |
| [x] | P-003 | **Login/Register:** layout `AuthPageShell`, divider OAuth, stati loading | Mobile: card full width leggibile |
| [x] | P-004 | **Limiti e privacy:** testo IntentDraft, dati verso LLM futuro, localhost | FR-016 |
| [x] | P-005 | SEO base: Helmet OG title/description su Home (FE-082) | Meta presenti in sorgente |
| [x] | P-006 | Footer coerente su tutte le route pubbliche | Link limiti sempre raggiungibile |

---

### Fase 4 — Shell chat e layout app (**P0**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | S-001 | `/app` layout: sidebar + `AppPanelFrame`, no scroll orizzontale sidebar | FE-076 |
| [x] | S-002 | Header colonne allineate (`shellHeaderRow` h-16) | FE-073 |
| [x] | S-003 | Sidebar collassabile + logo expand (FE-070) | Stato persistito in `uiStore` |
| [x] | S-004 | Sezioni Nuova chat, Progetti, Fissate, Recenti (FE-071) | Navigazione chiara |
| [x] | S-005 | **Mobile:** sidebar overlay/drawer, backdrop, chiusura tap | NFR-007 |
| [x] | S-006 | Empty state nuova chat: titolo + sottotitolo tono non tecnico (UX §4) | `brand-heading-hero` |
| [x] | S-007 | Route `/app/settings` accessibile da shell (non perdere sidebar opzionale) | UX consistente |

---

### Fase 5 — Sidebar conversazioni e progetti (**P0** / **P1**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | C-001 | Lista conversazioni via `ConversationPort` (mock ok) | Ordine per `updatedAt` |
| [x] | C-002 | Nuova chat senza duplicati vuoti | Logica blank recent |
| [x] | C-003 | Hover azioni Recent: pin, progetto, rinomina, elimina (FE-072) | Tooltip i18n |
| [x] | C-004 | **FE-103:** `ConfirmModal` prima di eliminare | Elimina annullabile |
| [x] | C-005 | **FE-101:** stesse azioni su Fissate e Progetti (**P2**) | Parità UX |
| [x] | C-006 | Titolo auto da primo messaggio + PATCH titolo (FE-104) | Sidebar mostra titolo |
| [x] | C-007 | Pin/progetto persistiti in `metadata` (adapter) | Mock: estendere store |
| [x] | C-008 | Ricerca chat in sidebar (campo Search già presente) — filtro client-side (**P2**) | Filtra per titolo |

---

### Fase 6 — Thread, composer, stati conversazione (**P0**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | T-001 | Bubble user/assistant distinte; timestamp opzionale (**P2**) | `formatMessageTime` su bubble user/assistant |
| [x] | T-002 | Stati `analyzing` / `generating`: indicatori + input disabilitato (FR-014) | Copy UX §4 |
| [x] | T-003 | Fase `clarifying`: max 3 domande visibili; motivo domanda (FR-003) | Allineato journey |
| [x] | T-004 | Pulsante **Salta — usa assunzione** (FR-011) | Visibile in clarifying |
| [x] | T-005 | Contatore caratteri composer + blocco oltre `VITE_MAX_MESSAGE_CHARS` | NFR-004 |
| [x] | T-006 | Shift+Enter newline, Enter invia (documentare in tooltip **P2**) | Copy `chat.composeHint` sotto composer |
| [x] | T-007 | `aria-live="polite"` su banner stato analisi/errore | NFR-008 |
| [x] | T-008 | Messaggi edge: vuoto, fuori scope, `error_recoverable` + Riprova (FR-012, FR-015) | Pannello + `handleRetry` su errori API recuperabili |
| [x] | T-009 | Estrarre invio messaggio su `MessagePort` | Mock engine invariato |
| [x] | T-010 | (Opzionale **P1**) Pannello “Ecco cosa ho capito” collassabile | FR-002 visibile senza clutter |

---

### Fase 7 — Area risultato prompt (**P0**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | PR-001 | Editor risultato (`GlassPanel compact`); modifica libera (FR-008) | |
| [x] | PR-002 | Copia + toast conferma (FR-010) | Clipboard ok |
| [x] | PR-003 | Rigenera + modale se testo modificato (UX §6 edge case) | ConfirmModal |
| [x] | PR-004 | `PromptPort` GET/PUT latest (mock: store) | Pronto per API |
| [x] | PR-005 | Feedback utile/non utile (**FR-017 Should**) | UI + stub adapter |
| [x] | PR-006 | Hint post-copia: “Incolla nel tuo strumento AI” (i18n) | UX §4 |

---

### Fase 8 — Upload e anteprima documenti (**P0** / **P1**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | F-001 | `FileInputButton` + lista allegati per conversazione | FR-023 UI |
| [x] | F-002 | Validazione tipo/dimensione + errori i18n | Allineato allowlist §9.7 |
| [x] | F-003 | `FilePort` multipart + progress indicator (**FE-052**) | Mock: simula progress |
| [x] | F-004 | Elimina allegato (lista + API stub) | |
| [x] | F-005 | Preview pannello documento: chiusura mobile full-width | `max-md`: pannello `inset-0` full width |
| [x] | F-006 | Download via URL API quando non mock (**P1**) | `downloadAttachment` + pulsante anteprima |

---

### Fase 9 — Impostazioni globali e tema (**P1**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | G-001 | Menu impostazioni: focus trap + Esc chiude (FE-109) | a11y |
| [x] | G-002 | Tema chiaro/scuro coerente brand dark mode | Token `brand-tokens.css` |
| [x] | G-003 | Lingua visitatore vs utente loggato (sync PATCH locale) | FR-024 |
| [~] | G-004 | Banner dev mock sotto navbar | **Rimosso** su richiesta founder (2026-10-29); copy resta su login se `useMock` |

---

### Fase 10 — Errori, resilienza, health (**P1**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | E-001 | Mappa `ApiError.code` → toast/banner i18n (FE-106) | |
| [x] | E-002 | Retry su errori recuperabili | Chat retry + banner health |
| [x] | E-003 | `ErrorBoundary` per route `/app` | Crash non white screen |
| [x] | E-004 | Banner “Backend non raggiungibile” se health fail e `!useMock` (**P2**) | `BackendHealthBanner` + `checkHealth` |
| [x] | E-005 | 401 globale → logout + redirect login | |

---

### Fase 11 — Integrazione-ready (backend futuro) (**P0**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | I-001 | Con `VITE_USE_MOCK=false`, app avvia e fallisce gracefully senza BE | Sessione anonima + banner/toast rete |
| [x] | I-002 | Nessuna password/chiave API in bundle (`npm run build` + grep) | NFR-001 |
| [x] | I-003 | Rimuovere persist Zustand dati dominio quando API attiva | `auth`/`conversations` persist solo se `useMock` |
| [x] | I-004 | Documentare in README flusso mock vs API + OAuth | |
| [x] | I-005 | Checklist §12 Definition of Done tutta `[x]` | Gate merge (§12 aggiornato) |

---

### Fase 12 — Qualità e verifica umana (**P1** / **P2**)

| Stato | ID | Task | DoD |
| ----- | -- | ---- | --- |
| [x] | Q-001 | `npm run build` zero errori TS | |
| [ ] | Q-002 | Verifica umana: spuntare tutti i test P0 in **§18** | Checklist founder in questo file |
| [x] | Q-003 | Vitest: client API + parse errori (**P2**) | `src/api/client.test.ts` — `npm run test` |
| [x] | Q-004 | Playwright smoke: login → chat → copia (**P2**) | `e2e/smoke.spec.ts` — `npm run test:e2e` |
| [x] | Q-005 | Pass responsive iPhone/Android emulator | `e2e/responsive.spec.ts` — progetti iPhone 13 + Pixel 7 |
| [x] | Q-006 | `.gitignore` dist/node_modules (FE-108) | |

**Riepilogo task dev ancora aperti (non bloccano test mock):** A-007, P-002, T-001, T-006, T-008, F-005, F-006, E-002, E-004, I-001, I-003, I-005, Q-003, Q-004, Q-005.

---

### Gate finale — “Frontend IntentDraft pronto”

Tutte le voci devono essere **sì** prima di considerare chiuso il mandato agente:

1. **Rebrand:** nessuna stringa utente “PromptPilot”; nome **IntentDraft** ovunque in UI.
2. **Percorso happy path:** registrazione/login (o demo) → nuova chat → messaggio → (chiarimenti opz.) → prompt → copia.
3. **Auth completa:** logout, settings, Google UI (mock ok).
4. **Architettura:** ports + client HTTP; pagine migrati ai hook/ports (non solo store legacy).
5. **UX:** stati loading/errori/chiarimenti/skip conformi a §9 e `user-journeys-and-ux.md`.
6. **UI:** brand system rispettato; landing e app visivamente coerenti.
7. **Pronto al backend:** contratto §8 implementato negli adapter API (anche se BE non esiste ancora).
8. **Pronto all’AI:** tipi IntentModel/PromptArtifact e stati UI per fase C senza refactor massivo.

---

### Ordine di esecuzione consigliato (sintesi)

```
Fase 0 R-*  →  Fase 1 A-*  →  Fase 2 U-*  →  Fase 3 P-*
     →  Fase 4 S-*  →  Fase 5 C-*  →  Fase 6 T-*  →  Fase 7 PR-*
     →  Fase 8 F-*  →  Fase 9 G-*  →  Fase 10 E-*  →  Fase 11 I-*  →  Fase 12 Q-*
     →  Gate finale
```

Parallelo ammesso: **P-*** con **U-006**; **G-*** con **T-***; i18n stringhe durante ogni fase.

---

### Note UX/UI obbligatorie (non saltare)

- Tono **non tecnico** in tutti i messaggi di sistema (vedi tabella copy in `user-journeys-and-ux.md` §4).
- **Copia** sempre con conferma umana (“Copiato negli appunti”).
- **Non** promettere esecuzione task nell’app — solo testo prompt (OQ-008).
- Preferire componenti `@/components/brand` invece di duplicare sfondi Tailwind.
- Touch target ≥ 44px su controlli primari mobile.
- Evitare scroll orizzontale in sidebar e thread.

---

**Fine checklist agente — IntentDraft frontend v1.3**

---

## 18. Test manuali da eseguire (Q-002 / FE-100)

**File di riferimento implementazione:** questo documento (`frontend-implementation-spec.md`).  
**Setup:** `cd frontend && npm install && npm run dev` → `http://localhost:5173`  
**Env:** `VITE_USE_MOCK=true` (default) salvo sezione backend.  
**Device:** desktop + mobile (≤768px).

**Istruzioni:** spunta `[x]` ogni voce completata. **Q-002** in §17 è OK solo se tutte le voci **P0** (PRE, PUB, AUTH, SET, SH, CHAT, FILE) sono `[x]` senza bug bloccanti.

### 18.0 Pre-flight (P0)

- [ ] **PRE-01** — `npm run build` in `frontend/` → exit 0, zero errori TS
- [ ] **PRE-02** — Tab home → titolo **IntentDraft**; nessun “PromptPilot” in UI
- [ ] **PRE-03** — DevTools → Local Storage → chiavi `intentdraft_*` (ok se restano legacy `promptpilot_*`)
- [ ] **PRE-04** — Sorgente home → meta OG (Helmet) presenti

### 18.1 Pagine pubbliche (P0)

- [ ] **PUB-01** — `/` visitatore → IntentDraft, tagline, logo, CTA Accedi/Registrati
- [ ] **PUB-02** — Footer → Limiti e privacy → testo IntentDraft
- [ ] **PUB-03** — Menu ⚙ visitatore → IT ↔ EN (label aggiornate)
- [ ] **PUB-04** — Menu ⚙ → tema chiaro/scuro + persistenza dopo F5
- [ ] **PUB-05** — `/login` → form, **Continua con Google**, divider “oppure”
- [ ] **PUB-06** — `/register` → nuovo utente → redirect `/app`
- [ ] **PUB-07** — In `/app` **nessun** banner “Modalità demo” sotto navbar (rimosso)

### 18.2 Autenticazione (P0)

- [ ] **AUTH-01** — Accesso demo → entra in `/app`
- [ ] **AUTH-02** — Logout (menu utente → Esci) → `/app` protetto
- [ ] **AUTH-03** — Login utente registrato → ok
- [ ] **AUTH-04** — Login password errata → messaggio errore
- [ ] **AUTH-05** — F5 su `/app` loggato → sessione e chat ok
- [ ] **AUTH-06** — Google (mock) → app; Impostazioni = provider Google, no cambio password
- [ ] **AUTH-07** — `/#/login?oauth=error` → messaggio errore Google

### 18.3 Impostazioni (P0)

- [ ] **SET-01** — Menu utente → Impostazioni (`/app/settings`)
- [ ] **SET-02** — Cambia nome visualizzato → Salva → navbar + toast
- [ ] **SET-03** — Lingua EN in settings → UI in inglese
- [ ] **SET-04** — Cambio password (account locale) → re-login ok
- [ ] **SET-05** — Link Limiti e privacy da settings
- [ ] **SET-06** — Esc chiude menu ⚙

### 18.4 Sidebar e shell (P0)

- [ ] **SH-01** — Nuova chat → empty state; no troppe chat vuote
- [ ] **SH-02** — Collassa/espandi sidebar (desktop)
- [ ] **SH-03** — Mobile: hamburger → drawer + chiusura backdrop
- [ ] **SH-04** — Ricerca chat per titolo
- [ ] **SH-05** — Progetti / Fissate / Recenti; no scroll orizzontale
- [ ] **SH-06** — Recenti: rinomina, fissa, progetto, elimina (hover)
- [ ] **SH-07** — Fissate e Progetti: stesse azioni di Recenti
- [ ] **SH-08** — Elimina chat → modale conferma
- [ ] **SH-09** — Documenti in sidebar → anteprima file

### 18.5 Chat e prompt mock (P0)

- [ ] **CHAT-01** — *organizza appunti riunione* → prompt + titolo sidebar
- [ ] **CHAT-02** — Copia → toast “incolla nel tuo strumento AI…” + clipboard
- [ ] **CHAT-03** — Modifica prompt → Rigenera → modale se testo cambiato
- [ ] **CHAT-04** — Messaggio vago LinkedIn → domande → prompt
- [ ] **CHAT-05** — Salta — usa assunzione → prompt
- [ ] **CHAT-06** — Pannello “Ecco cosa ho capito” apri/chiudi
- [ ] **CHAT-07** — Invio vuoto → toast
- [ ] **CHAT-08** — Consiglio medico/legal → rifiuto, no prompt
- [ ] **CHAT-09** — Feedback utile / non utile → toast
- [ ] **CHAT-10** — analyzing/generating → composer disabilitato
- [ ] **CHAT-11** — Oltre ~12000 caratteri → blocco invio

### 18.6 Upload file (P0)

- [ ] **FILE-01** — `.txt` o `.pdf` &lt; 5 MB → allegato visibile
- [ ] **FILE-02** — File troppo grande → toast
- [ ] **FILE-03** — Tipo non ammesso → toast
- [ ] **FILE-04** — Rimuovi allegato
- [ ] **FILE-05** — Anteprima PDF → chiudi con X o backdrop

### 18.7 Accessibilità e i18n (P1)

- [ ] **A11Y-01** — Tab su login → focus visibile
- [ ] **A11Y-02** — Enter invia; Shift+Enter newline nel composer
- [ ] **I18N-01** — Chat in italiano → risposte mock IT
- [ ] **I18N-02** — UI EN → stati analyzing in EN

### 18.8 Visuale (P1)

- [ ] **VIS-01** — Coerenza home ↔ `/app` (task P-002 se KO)
- [ ] **VIS-02** — Preview documento su mobile (task F-005 se KO)

### 18.9 Backend (dopo FOUND-*)

- [ ] **BE-01** — `VITE_USE_MOCK=false`, BE spento → errori chiari
- [ ] **BE-02** — Register / login / logout + cookie
- [ ] **BE-03** — Conversazioni + messaggi persistono dopo F5
- [ ] **BE-04** — Upload multipart
- [ ] **BE-05** — Google OAuth reale

### 18.10 Chiusura Q-002

Quando tutte le checkbox **P0** (§18.0–18.6) sono `[x]`:

1. Segna in §17: **Q-002 [x]**
2. Procedi con backend (contratto **§8**)
