import { AccessDenied } from "@/components/common/base-ui/access-denied"

export default function AccessDeniedPage() {
  return (
    <AccessDenied 
      title="Acesso Negado"
      description="Você não tem permissão para acessar esta página. Esta área é restrita ao seu tipo de usuário."
      redirectTo="/dashboard"
    />
  )
}
