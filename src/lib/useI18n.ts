"use client";
import { useEffect, useSyncExternalStore } from 'react';
import i18next from 'i18next';

function subscribe(callback: () => void) {
  i18next.on('languageChanged', callback);
  return () => {
    i18next.off('languageChanged', callback);
  };
}

export function useI18n() {
  const lng = useSyncExternalStore(subscribe, () => i18next.language, () => i18next.language);
  useEffect(() => {}, [lng]);
  return { t: (key: string) => i18next.t(key), lng } as const;
}


