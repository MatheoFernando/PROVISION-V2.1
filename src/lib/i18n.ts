import i18next from 'i18next';

import en from '@/locales/en.json';
import pt from '@/locales/pt.json';

if (!i18next.isInitialized) {
  i18next.init({
    lng: 'pt',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },
    interpolation: { escapeValue: false },
  });
}

export const t = (key: string) => i18next.t(key);
export const changeLanguage = (lng: 'pt' | 'en') => i18next.changeLanguage(lng);



