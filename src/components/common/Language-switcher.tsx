"use client";
import React from 'react';
import { changeLanguage } from '@/lib/i18n';
import { useI18n } from '@/lib/useI18n';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageSwitcher() {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<string>('pt');

  React.useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
    if (saved === 'pt' || saved === 'en') {
      setCurrent(saved);
      changeLanguage(saved);
    }
  }, []);

  const select = (lng: 'pt' | 'en') => {
    changeLanguage(lng);
    setCurrent(lng);
    try { localStorage.setItem('lang', lng); } catch {}
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 border rounded px-3 py-2 bg-background text-foreground"
      >
        <Globe size={16} />
        <span>{t('common.language')}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 mt-2 w-44 rounded border bg-background shadow">
            <button className="w-full flex items-center justify-between text-left px-3 py-2 hover:bg-muted" onClick={() => select('pt')}>
              <span>{t('common.portuguese')}</span>
              {current === 'pt' && <Check size={14} />}
            </button>
            <button className="w-full flex items-center justify-between text-left px-3 py-2 hover:bg-muted" onClick={() => select('en')}>
              <span>{t('common.english')}</span>
              {current === 'en' && <Check size={14} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


