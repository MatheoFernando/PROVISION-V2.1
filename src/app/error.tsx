"use client"

import { useEffect, useState } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showStack, setShowStack] = useState(false)

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border rounded-md p-6 bg-background text-foreground shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Algo correu mal</h2>
        <p className="text-sm text-muted-foreground mb-4">Ocorreu um erro ao carregar esta página.</p>

        <div className="space-y-1 mb-4">
          <div className="text-sm"><span className="font-medium">Mensagem:</span> {error?.message ?? 'Erro desconhecido'}</div>
          {error?.digest && (
            <div className="text-xs text-muted-foreground"><span className="font-medium">Digest:</span> {error.digest}</div>
          )}
        </div>

        {error?.stack && (
          <div className="mb-4">
            <button
              className="text-xs underline hover:no-underline"
              onClick={() => setShowStack((v) => !v)}
            >
              {showStack ? 'Esconder detalhes' : 'Mostrar detalhes'}
            </button>
            {showStack && (
              <pre className="mt-2 max-h-64 overflow-auto text-xs whitespace-pre-wrap bg-black/5 dark:bg-white/5 p-3 rounded">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            className="inline-flex items-center gap-2 border rounded px-3 py-2 bg-background text-foreground"
            onClick={() => reset()}
          >
            Tentar novamente
          </button>
          <button
            className="inline-flex items-center gap-2 border rounded px-3 py-2"
            onClick={() => (window.location.href = '/')}
          >
            Ir para o início
          </button>
        </div>
      </div>
    </div>
  )
}