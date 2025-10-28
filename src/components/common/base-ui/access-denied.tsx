"use client"

import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AccessDeniedProps {
  title?: string
  description?: string
  redirectTo?: string
}

export function AccessDenied({ 
  title = "Acesso Negado",
  description = "Você não tem permissão para acessar esta página.",
  redirectTo = "/dashboard"
}: AccessDeniedProps) {
  const router = useRouter()

  const handleRedirect = () => {
    router.push(redirectTo)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="w-full max-w-md text-center">
        <div>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-2xl">{title}</h1>
          <p className="text-base">
            {description}
          </p>
        </div>
        <div className="p-4">
          <Button onClick={handleRedirect} className="w-full bg-blue-500 hover:bg-blue-600 cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
