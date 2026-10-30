# Runbook — rotazione segreti (IntentDraft)

**Scope:** sviluppo locale, staging, produzione beta.  
**Owner:** maintainer del repo / deploy.

---

## 1. Inventario segreti

| Segreto | Dove | Impatto rotazione |
| ------- | ---- | ----------------- |
| `DATABASE_URL` | `backend/.env`, CI, hosting API | Riconnettere Prisma; nessuna invalidazione sessioni |
| `SESSION_SECRET` | `backend/.env` | **Invalida tutti i cookie** — logout globale |
| `GOOGLE_CLIENT_SECRET` | `backend/.env` | OAuth Google fino ad aggiornamento console + env |
| `ANTHROPIC_API_KEY` | `backend/.env` | Solo chiamate LLM (`LLM_ENABLED=true`) |
| `DEV_ADMIN_PASSWORD` | `backend/.env` (solo dev) | Prossimo avvio/seed aggiorna hash utente dev |

**Mai** committare `.env` né secret in frontend (`VITE_*` solo URL pubblici).

---

## 2. Rotazione `SESSION_SECRET`

1. Generare stringa ≥ 32 caratteri (password manager / `openssl rand -base64 32`).
2. Aggiornare su host API e in secret manager CI se usato.
3. Riavviare API (`pm2 restart intentdraft --update-env` o deploy).
4. Comunicare agli utenti: nuovo login richiesto (cookie firmati col vecchio secret non validi).
5. Opzionale: `DELETE FROM idt_sess WHERE expires_at < now()` per pulizia DB.

---

## 3. Rotazione password database (Supabase)

1. Supabase Dashboard → Database → reset password.
2. Aggiornare `DATABASE_URL` su API e CI (`DATABASE_URL` secret GitHub).
3. Verificare `GET /api/health` → `"db": true`.
4. Eseguire smoke: login + una conversazione.

---

## 4. Rotazione OAuth Google

1. Google Cloud Console → Credentials → nuovo client secret o rigenera.
2. Aggiornare `GOOGLE_CLIENT_SECRET` in env API.
3. Verificare redirect URI invariati (`GOOGLE_CALLBACK_URL`).
4. Riavvio API; test login Google (popup).

---

## 5. Rotazione Anthropic

1. Console Anthropic → revoca vecchia key, crea nuova.
2. Aggiornare `ANTHROPIC_API_KEY` solo sul server API.
3. Riavvio API; invio messaggio con `LLM_ENABLED=true`.

---

## 6. CI / GitHub Actions

Secrets repository (Settings → Secrets and variables → Actions):

- `DATABASE_URL` — job **integration** (opzionale se usi Postgres service nel workflow).

Dopo rotazione: rieseguire workflow su PR aperta o `workflow_dispatch`.

---

## 7. Checklist post-rotazione

- [ ] `/api/health` ok
- [ ] Login email/password e (se configurato) Google
- [ ] Invio messaggio in chat
- [ ] Nessun segreto vecchio in log o commit (`git log -p` spot check)

---

## Riferimenti

- [`../../backend/README.md`](../../backend/README.md) — env
- [`../product/architecture/cloud-deployment-guide.md`](../product/architecture/cloud-deployment-guide.md) — produzione
