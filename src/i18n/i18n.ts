import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationPtBr from './locales/pt-BR/translation.json';
import translationEnUs from './locales/en-US/translation.json';
import translationEsEs from './locales/es-ES/translation.json';

// the translations
const resources = {
  'pt-BR': {
    translation: translationPtBr
  },
  'en-US': {
    translation: translationEnUs
  },
  'es-ES': {
    translation: translationEsEs
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
