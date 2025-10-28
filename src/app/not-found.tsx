"use client";
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Página não encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            A página que você está procurando não existe.
          </p>
        </div>

          <button
            onClick={() => window.history.back()}
            className="inline-flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à página anterior
          </button>
      
      </div>
    </div>
  );
}