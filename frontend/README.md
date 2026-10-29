# IntentDraft — Frontend

UI conversazionale basata su [react-typescript-template](https://github.com/luismalamoc/react-typescript-template) (Vite, React, TypeScript, Tailwind, Radix Slot).

## Avvio locale

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Apri `http://localhost:5173`. Con **`VITE_USE_MOCK=true`** (default) auth, chat e upload usano adapter **mock** (dati nel browser). Con **`VITE_USE_MOCK=false`** l’app chiama il backend su `VITE_API_URL` (cookie di sessione, CORS con credentials). Login Google: redirect a `VITE_GOOGLE_AUTH_START_URL`.

## Script

| Comando | Descrizione |
| ------- | ----------- |
| `npm run dev` | Dev server |
| `npm run build` | Build produzione |
| `npm run preview` | Anteprima build |

## Roadmap

Vedi [`docs/product/planning/frontend-roadmap.md`](../docs/product/planning/frontend-roadmap.md).
