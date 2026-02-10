import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en','tr','pl'],
    load: 'languageOnly',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain', 'cookie'],
      // persist the user's choice to localStorage so it is used on subsequent visits
      caches: ['localStorage']
    },
    backend: {
      // Path where resources get loaded from
      loadPath: '/locales/{{lng}}/translation.json'
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;
