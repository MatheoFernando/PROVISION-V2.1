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
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useChangePasswordMutation } from "@/infrastructure/hooks/useChangePasswordMutation";
import { changePasswordSchema, ChangePasswordSchema } from "@/infrastructure/schema/schema-logins";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordProps {
  onBack: () => void;
}

function ResetPassword({ onBack }: ResetPasswordProps) {
  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { mutate, isPending } = useChangePasswordMutation();

  const { handleSubmit, formState: { errors }, register } = form;

  const onSubmit = (data: ChangePasswordSchema) => {
    mutate(
      {
        phone: data.phone,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Senha alterada com sucesso.");
        },
        onError: (err) => {
          toast.error(err.message || "Falha ao alterar a senha. Tente novamente.");
        },
      }
    );
  };

  return (
    <div>
      <Button type="button" onClick={onBack} className="cursor-pointer">Voltar</Button>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-6 text-center">
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
              <h1 className="text-2xl font-bold">Alterar palavra-passe</h1>
              <FieldDescription>
                Preencha os campos para alterar a palavra-passe.
              </FieldDescription>
            </div>
            <Field>
              <FieldLabel htmlFor="phone">Número de telefone</FieldLabel>
              <Input
                id="phone"
                type="number"
                placeholder="99999-9999"
                required
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="currentPassword">Password atual</FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                placeholder="********"
                required
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword">Nova palavra-passe</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                placeholder="********"
                required
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
              )}
            </Field>
            <Field>
              <Button type="submit" className="cursor-pointer" disabled={isPending}>
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    A alterar...
                  </span>
                ) : (
                  "Alterar senha"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
