"use client";

import * as React from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete",
  message = "Are you sure you want to delete?",
  isLoading = false,
}: DeleteModalProps) {
  const t = useTranslations("Components.DeleteModal");
  // const [wasLoading, setWasLoading] = React.useState(false);

  React.useEffect(() => {
    // We only track loading state if needed, but auto-close is dangerous if parent handles it differently.
    // The parent (PermissionsModal) explicitly calls onClose on success.
    // So we just need to ensure onConfirm is called and loading state is reflected.
  }, [isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 z-[10000]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex flex-col items-center text-center space-y-5">
          <Trash2 className="w-8 h-8 text-red-500" />


          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title || t('title')}</h2>

          <p className="text-gray-600 dark:text-gray-400 text-sm">{message || t('message')}</p>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2 text-sm font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.has('deleting') ? t('deleting') : "Eliminando..."}
                </span>
              ) : (
                t.has('confirm') ? t('confirm') : "Eliminar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
