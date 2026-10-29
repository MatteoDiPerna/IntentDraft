/** Chiavi localStorage / persist — prefisso prodotto IntentDraft */
export const STORAGE = {
  locale: 'intentdraft_locale',
  theme: 'intentdraft-theme',
  auth: 'intentdraft_auth_v1',
  conversations: 'intentdraft_conversations_v1',
  ui: 'intentdraft_ui_v1',
} as const;

const LEGACY = {
  locale: 'promptpilot_locale',
  theme: 'promptpilot-theme',
  auth: 'promptpilot_auth_v1',
  conversations: 'promptpilot_conversations_v1',
  ui: 'promptpilot_ui_v1',
} as const;

/** Migrazione one-shot da chiavi legacy promptpilot_* (solo browser). */
export function migrateLegacyStorage(): void {
  if (!localStorage.getItem(STORAGE.locale)) {
    const legacyLocale = localStorage.getItem(LEGACY.locale);
    if (legacyLocale) localStorage.setItem(STORAGE.locale, legacyLocale);
  }
  if (!localStorage.getItem(STORAGE.theme)) {
    const legacyTheme = localStorage.getItem(LEGACY.theme);
    if (legacyTheme) localStorage.setItem(STORAGE.theme, legacyTheme);
  }
  for (const key of ['auth', 'conversations', 'ui'] as const) {
    if (!localStorage.getItem(STORAGE[key])) {
      const legacy = localStorage.getItem(LEGACY[key]);
      if (legacy) localStorage.setItem(STORAGE[key], legacy);
    }
  }
}
