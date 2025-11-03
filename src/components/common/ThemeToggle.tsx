"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycle = () => {
    const order = ['dark', 'light'] as const;
    const idx = Math.max(0, order.indexOf((theme as any) ?? 'dark'));
    const next = order[(idx + 1) % order.length];
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch {}
  };

  const getIcon = () => {
    return theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />;
  };
  return (
    <button onClick={cycle} className="cursor-pointer inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span 
          key={theme} 
          initial={{ opacity: 0, rotate: -90 }} 
          animate={{ opacity: 1, rotate: 0 }} 
          exit={{ opacity: 0, rotate: 90 }} 
          transition={{ duration: 0.15 }}
        >
          {getIcon()}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}


