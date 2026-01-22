"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useChangePasswordMutation } from "@/infrastructure/hooks/useChangePasswordMutation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"

export default function ResetPasswordForm() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const { mutateAsync, isPending } = useChangePasswordMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mutateAsync({ phone, currentPassword, newPassword })
      toast.success("Senha alterada com sucesso")
      setPhone("")
      setCurrentPassword("")
      setNewPassword("")
      setTimeout(() => router.push("/login"), 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao alterar senha"
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer font-medium"
          >
            <ArrowLeft className="size-4" />
            Voltar ao login
          </Link>

          <div className="mb-4 ">
            <Image src="/logo.png" alt="Logo Provision" width={100} height={100}  />
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Redefinir senha</h1>
          <p className="text-muted-foreground">Informe seu telefone e senhas para redefinir o acesso</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Digite seu telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <InputGroup>
                <InputGroupInput
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Digite sua senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? "Ocultar senha atual" : "Mostrar senha atual"}
                  >
                    {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <InputGroup>
                <InputGroupInput
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="cursor-pointer"
                    aria-label={showNewPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <p className="text-sm text-muted-foreground">A senha deve ter ao menos 8 caracteres</p>
            </div>
            <Button type="submit" className="w-full cursor-pointer" size="lg" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Alterar senha"}
            </Button>
          </form>
        </div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="/left.jpeg"
          alt="Provision - Gestão de Empresas e Serviços"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <h2 className="text-6xl font-extrabold leading-tight">Provision</h2>
          <p className="mt-2 text-xl">Gestão de Empresas e Serviços</p>
        </div>
      </div>
    </div>
  )
}
