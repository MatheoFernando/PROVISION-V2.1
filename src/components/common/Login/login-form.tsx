"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useLoginMutation } from "@/infrastructure/hooks/useLoginMutation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { PhoneField } from "@/components/common/base-ui/phone-field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function LoginForm() {
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { mutateAsync, isPending } = useLoginMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null) // Clear previous errors
    try {
      const payload = loginMethod === "phone" ? { phone, password } : { email, password }
      const result = await mutateAsync(payload)

      if (result?.statusCode === 401 && result?.data === "Empresa inativa ou não encontrada. Contate o administrador.") {
        setErrorMessage("Empresa inativa ou não encontrada. Contate o administrador.")
        return
      }

      if (result?.statusCode === 401) {
        toast.error("Credenciais inválidas")
        return
      }

      if (result?.success) {
        toast.success("Bem-vindo ao Provision")
        if (typeof window !== "undefined") window.location.href = "/dashboard"
      } else {
        const apiMessage = (result as any)?.message || (result as any)?.data?.message
        toast.error(apiMessage || "Credenciais inválidas")
      }
    } catch (error: unknown) {
      const errorMsg = (error as any)?.response?.data?.message || (error as any)?.message || "Falha no login"
      const statusCode = (error as any)?.response?.status || (error as any)?.statusCode
      
      if (statusCode === 401 && errorMsg === "Empresa inativa ou não encontrada. Contate o administrador.") {
        setErrorMessage("Empresa inativa ou não encontrada. Contate o administrador.")
        return
      }
      
      toast.error(errorMsg)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-4">
            <Image src="/logo.png" alt="Logo Provision" width={100} height={100} />
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Bem-vindo de volta!</h1>
          
          <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "phone" | "email")} className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">Telefone</TabsTrigger>
              <TabsTrigger value="email">E-mail</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <PhoneField
                    id="phone"
                    name="phone"
                    placeholder="Digite seu telefone"
                    value={phone}
                    onChange={(value) => setPhone(value)}
                    required={loginMethod === "phone"}
                    size="lg"
                  />
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={loginMethod === "email"}
                    className="h-9" 
                  />
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer" 
                      type="button" 
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/reset-password"
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline cursor-pointer font-medium"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button type="submit" className="w-full cursor-pointer" size="lg" disabled={isPending}>
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Aguarde...</span>
                  </div>
                ) : (
                  "Entrar"
                )}
              </Button>

              {errorMessage && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-2">{errorMessage}</p>
                  <a 
                    href="mailto:suporte@provision.ao" 
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    suporte@provision.ao
                  </a>
                </div>
              )}
            </form>
          </Tabs>
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