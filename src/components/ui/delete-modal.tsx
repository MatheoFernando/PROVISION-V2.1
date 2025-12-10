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
  const { t: tCommon } = { t: (key: string) => key }; 
  const t = useTranslations("Components.DeleteModal");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex flex-col items-center text-center space-y-5">
          <Trash2 className="w-8 h-8 text-red-500" />


          <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>

          <p className="text-gray-600 text-sm">{t('message')}</p>

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
                  {t('deleting')}
                </span>
              ) : (
                t('confirm')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
