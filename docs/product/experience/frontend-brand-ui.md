# Sistema UI brand — frontend IntentDraft

**Documento:** `frontend-brand-ui.md`  
**Versione:** 1.0  
**Aggiornato:** 2026-10-25  
**Codice:** `frontend/src/components/brand/`, `frontend/src/styles/`

---

## 1. Scopo

Un unico **linguaggio visivo** per tutte le pagine del frontend: sfondo “AI” (glow + griglia), pannelli vetro, titoli gradient, pulsanti primary con ombra brand.  
La **palette** resta quella del logo (`brand-tokens.css`); l’obiettivo è coerenza e implementazione rapida delle nuove schermate, non effetti complessi.

**Principi:**

- Preferire classi CSS `brand-*` / `surface-*` e i layout in `@/components/brand` invece di duplicare Tailwind inline.
- Mantenere accessibilità: decorazioni con `aria-hidden`, contenuto sopra lo sfondo con `page-content-layer`.
- In app (sidebar visibile) usare scene **più soft** (`BrandScene subtle` / `AppPanelFrame`).

---

## 2. Dove vive il codice

| Ruolo                            | Percorso                                                              |
| -------------------------------- | --------------------------------------------------------------------- |
| Token colore (HSL, gradient)     | `frontend/src/styles/brand-tokens.css`                                |
| Classi brand + utility gradient  | `frontend/src/styles/globals.css` (`@layer components` / `utilities`) |
| Componenti layout riutilizzabili | `frontend/src/components/brand/`                                      |
| Export pubblico                  | `import { … } from '@/components/brand'`                              |
| Asset logo                       | `frontend/src/lib/brand.ts`, `frontend/src/assets/brand/`             |

---

## 3. Componenti React

Import: `import { PublicPageFrame, AppPanelFrame, GlassPanel, AuthPageShell, BrandScene } from '@/components/brand'`

| Componente            | Quando usarlo                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **`BrandScene`**      | Sfondo decorativo (glow, griglia, fade). Prop `subtle` per pannelli in-app meno invasivi.                         |
| **`PublicPageFrame`** | Pagine **senza** shell chat: home, login, registrazione, limiti. Centra il contenuto e applica `BrandScene` full. |
| **`AppPanelFrame`**   | Colonna principale **dentro** `/app` (es. area chat a destra della sidebar). Scene soft + stack flex.             |
| **`GlassPanel`**      | Card semitrasparente. Prop `compact` per composer, risultati, blocchi più piccoli.                                |
| **`AuthPageShell`**   | Scorciatoia: `PublicPageFrame` + `GlassPanel` `max-w-md` per form auth.                                           |

### Pagine di riferimento

| Pagina                       | Pattern                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `HomePage`                   | `PublicPageFrame` + classi tipografia/badge/bottoni           |
| `LoginPage` / `RegisterPage` | `AuthPageShell`                                               |
| `LimitsPage`                 | `PublicPageFrame` + `GlassPanel`                              |
| `ChatPage`                   | `AppPanelFrame` + `GlassPanel compact` + `brand-shell-header` |

---

## 4. Classi CSS ( `@layer components` )

Aggiungere nuove classi solo in `globals.css` se servono in **più** pagine; per eccezioni puntuali usare Tailwind sul componente.

### Scene e layout

| Classe                   | Uso                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `brand-scene-grid`       | Griglia sfumata (usata dentro `BrandScene`)                                         |
| `brand-scene-subtle`     | Modificatore sul wrapper scene: glow/grid più leggeri                               |
| `brand-scene-glow-pulse` | Animazione lenta sull’alone centrale                                                |
| `page-frame-public`      | Contenitore full-bleed pagine pubbliche (margini negativi allineati al gutter 30px) |
| `page-content-layer`     | `relative z-10` — contenuto sopra lo sfondo                                         |

### Superfici

| Classe                  | Uso                                                                |
| ----------------------- | ------------------------------------------------------------------ |
| `surface-glass`         | Pannelli grandi (auth, limiti): bordo primary leggero, blur, ombra |
| `surface-glass-compact` | Composer chat, blocco risultato prompt                             |

### Tipografia

| Classe                  | Uso                                          |
| ----------------------- | -------------------------------------------- |
| `brand-heading-display` | Hero home (nome app, titoli marketing)       |
| `brand-heading-page`    | Titolo pagina (login, registrazione, limiti) |
| `brand-heading-hero`    | Titolo secondario in-app (empty state chat)  |

### Controlli e chrome

| Classe                    | Uso                                                      |
| ------------------------- | -------------------------------------------------------- |
| `brand-badge`             | Pillola sopra titolo (es. “Assistente prompt per l’AI”)  |
| `brand-btn-glow`          | Ombra primary su CTA principali (combinare con `Button`) |
| `brand-btn-outline-glass` | Outline secondario con blur (home “Registrati”)          |
| `brand-field`             | Input con sfondo leggermente translucido                 |
| `brand-divider`           | Separatore sezioni (es. blocco demo login)               |
| `brand-shell-header`      | Barra azioni sotto navbar in chat (blur + border)        |
| `brand-feature-item`      | Riga icona + testo in elenco feature landing             |

### Utility gradient ( `@layer utilities` )

| Classe                                           | Uso                          |
| ------------------------------------------------ | ---------------------------- |
| `text-brand-gradient`                            | Testo con gradient logo      |
| `bg-brand-gradient` / `bg-brand-gradient-subtle` | Sfondi gradient pieni o soft |
| `border-brand-gradient`                          | Bordo gradient (uso raro)    |

---

## 5. Ricette per nuove pagine

### Pagina pubblica con contenuto in card

```tsx
import { GlassPanel, PublicPageFrame } from '@/components/brand';

export function EsempioPage() {
  return (
    <PublicPageFrame>
      <GlassPanel className="page-content-layer w-full max-w-2xl space-y-4 p-6 sm:p-8">
        <h1 className="brand-heading-page">Titolo</h1>
        <p className="text-muted-foreground">…</p>
      </GlassPanel>
    </PublicPageFrame>
  );
}
```

### Form auth (o pagina stretta simile)

Usare `AuthPageShell` oppure replicare lo stesso schema con `PublicPageFrame` + `GlassPanel` `max-w-md`.

### Area principale con sidebar (route `/app` o future)

```tsx
import { AppPanelFrame, GlassPanel } from '@/components/brand';

export function EsempioAppPage() {
  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      {/* sidebar */}
      <AppPanelFrame>
        <div className="brand-shell-header …">…</div>
        <GlassPanel compact className="p-4">…</GlassPanel>
      </AppPanelFrame>
    </div>
  );
}
```

### Bottoni

```tsx
<Button className="brand-btn-glow">Azione principale</Button>
<Button variant="outline" className="brand-btn-outline-glass">Secondaria</Button>
```

---

## 6. Estendere il sistema

1. **Nuovo token colore:** aggiornare `brand-tokens.css` e, se serve semantic mapping, variabili in `:root` / `.dark` in `globals.css`.
2. **Nuova classe condivisa:** aggiungere in `@layer components` in `globals.css` con prefisso `brand-` o `surface-`.
3. **Nuovo layout ricorrente:** nuovo file in `components/brand/` ed export in `index.ts`.
4. **i18n:** testi UI in `frontend/src/i18n/locales/it.ts` e `en.ts` (stesso schema TypeScript da `it.ts`).

Evitare di reintrodurre cartelle parallele (es. `landing/`) o copie dello sfondo: usare sempre `BrandScene`.

---

## 7. Documenti correlati

- Journey e stati UI: [`user-journeys-and-ux.md`](user-journeys-and-ux.md)
- Roadmap frontend: [`../planning/frontend-roadmap.md`](../planning/frontend-roadmap.md)
- Indice prodotto: [`../README.md`](../README.md)
