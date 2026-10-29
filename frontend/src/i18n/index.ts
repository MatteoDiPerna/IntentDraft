import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { migrateLegacyStorage, STORAGE } from '@/lib/storageKeys';
import it from './locales/it';
import en from './locales/en';

migrateLegacyStorage();
const saved = localStorage.getItem(STORAGE.locale);
const lng = saved === 'en' || saved === 'it' ? saved : 'it';

void i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
  },
  lng,
  fallbackLng: 'it',
  interpolation: { escapeValue: false },
});

export default i18n;
