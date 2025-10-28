"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  LoginSchema,
} from "@/infrastructure/schema/schema-logins";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLoginMutation } from "@/infrastructure/hooks/useLoginMutation";
import ResetPassword from "./resetPassword";

export function LoginForm({
  className,  
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const [isLogin , setLogin ] = useState(true)
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const { mutate, isPending } = useLoginMutation();

  const onSubmit = (data: LoginSchema) => {
    mutate(
      { phone: data.phone, password: data.password },
      {
        onSuccess: (resp) => {
          console.log("Login response:", resp);
          toast.success("Login efetuado com sucesso.");
          router.push("/dashboard");
        },
        
        onError: (err) => {
          const message = err.message || "Falha ao entrar. Tente novamente.";
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
     {isLogin ? (
      <div>
       <form onSubmit={handleSubmit(onSubmit)}>
       <FieldGroup>
         <div className="flex flex-col items-center gap-5 text-center">
           <Link
             href="#"
             className="flex flex-col items-center gap-2 font-medium"
           >
             <Image
               src="/logo.png"
               alt="logo"
               width={100}
               height={100}
               className="object-contain"
             />

             <span className="sr-only">Provision</span>
           </Link>
           <h1 className="text-2xl font-semibold">Bem-vindo ao Provision.</h1>
           <FieldDescription>
             Se esqueceste a senha?{" "}
            <span  className="font-medium underline cursor-pointer" onClick={() => setLogin(false)}>
               Recuperar senha
             </span>
           </FieldDescription>
         </div>
         <Field>
           <FieldLabel htmlFor="phone">Número de telefone</FieldLabel>
           <Input
             id="phone"
             type="number"
             placeholder="99999-9999"
             required
             {...form.register("phone")}
           />
           {errors.phone && (
             <p className="text-red-500 text-sm">{errors.phone.message}</p>
           )}
          
         </Field>
         <Field>
           <FieldLabel htmlFor="password">Password</FieldLabel>
           <Input
             id="password"
             type="password"
             placeholder="********"
             required
             {...form.register("password")}
           />
           {errors.password && (
             <p className="text-red-500 text-sm">{errors.password.message}</p>
           )}
         </Field>
         <Field>
          <Button type="submit" className="cursor-pointer bg-primary hover:bg-secondary-foreground" disabled={isPending}>
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </Button>
         </Field>
       </FieldGroup>
     </form>
     <FieldDescription className="px-6 pt-2 text-center">
       Ao clicar em continuar, você concorda com nossos{" "}
       <Link href="#">Termos de Serviço</Link> e{" "}
       <Link href="#">Política de Privacidade</Link>.
     </FieldDescription>
   
      </div>
     ):
     <ResetPassword onBack={() => setLogin(true)} />

     }
    </div>
  );
}
