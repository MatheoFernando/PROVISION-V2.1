import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash } from "lucide-react";
import {
  useContactById,
  useCreateContact,
} from "@/infrastructure/hooks/useContacts";
import type { Contact } from "@/infrastructure/types/domain";
import { contactSchema } from "@/infrastructure/schema/schema-contact";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneField } from "@/components/common/base-ui/phone-field";

type ContactForm = z.infer<typeof contactSchema>;

interface ContactSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
  onPhoneChange?: (phone: string) => void;
}

export function ContactSelect({
  value,
  onChange,
  companyId,
  onPhoneChange,
}: ContactSelectProps) {
  const maxPhoneNumbers = 3;
  const [open, setOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string>("");

  const { data: selectedContact, isLoading } = useContactById(value);
  const createContact = useCreateContact();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phoneNumbers: [{ phone: "" }],
      email: "",
      companyId: companyId || undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phoneNumbers",
  });


  useEffect(() => {
    if (selectedContact) {
      const phones = Array.isArray(selectedContact.phoneNumbers)
        ? selectedContact.phoneNumbers
          .map((p: any) => p.phone)
          .filter((p: string) => (p ?? "").trim() !== "")
        : [];

      const firstPhone = phones[0] ?? "";
      setSelectedPhone(firstPhone);
      if (firstPhone) onPhoneChange?.(firstPhone);
    } else {
      setSelectedPhone("");
    }
  }, [selectedContact, onPhoneChange]);

  function handleSubmit(data: ContactForm) {
    createContact.mutate(data, {
      onSuccess: (created: Contact) => {
        onChange(created.id!);

        form.reset();
        setOpen(false);
      },
    });
  }

  const displayPhones = selectedContact
    ? (Array.isArray(selectedContact.phoneNumbers) ? selectedContact.phoneNumbers : [])
      .map((p: { phone: string }) => p.phone)
      .join(", ")
    : "";

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 mb-2">
        <div className="flex-1 relative min-w-0">
          <Input
            readOnly
            value={displayPhones}
            placeholder="Crie um contato"
            disabled={isLoading || !selectedContact}
            className="w-full"
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
        <Popover
          open={open}
          onOpenChange={(next) => {
            const isSaving = createContact.status === "pending";
            if (isSaving) return;
            setOpen(next);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 px-3 py-2 rounded-md shrink-0 cursor-pointer"
              disabled={createContact.status === "pending"}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[25rem] p-4"
            onInteractOutside={(e) => {
              if (createContact.status === "pending") e.preventDefault();
            }}
            onEscapeKeyDown={(e) => {
              if (createContact.status === "pending") e.preventDefault();
            }}
          >
            <div className="font-medium mb-2">Criar Contato</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(handleSubmit)();
              }}
              className="grid gap-3 mt-2"
            >
              <div>
                <div className="flex items-end justify-between mb-2">
                  <Label className="block">Telefones</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="ml-2 cursor-pointer"
                    onClick={() => {
                      if (fields.length >= maxPhoneNumbers) return;
                      append({ phone: "" });
                    }}
                    disabled={fields.length >= maxPhoneNumbers}
                    aria-label="Adicionar telefone"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {fields.map((fieldItem, idx) => (
                    <div key={fieldItem.id} className="flex items-center gap-2">
                      <Controller
                        control={form.control}
                        name={`phoneNumbers.${idx}.phone`}
                        render={({ field }) => (
                          <PhoneField
                            value={field.value ?? ""}
                            onChange={(value) => field.onChange(value ?? "")}
                            onBlur={field.onBlur}
                            placeholder={`Telefone ${idx + 1}`}
                            size="md"
                            disabled={createContact.status === "pending"}
                            onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                              if (event.key === "Enter") event.preventDefault();
                            }}
                          />
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => remove(idx)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 cursor-pointer"
                          aria-label="Remover telefone"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {fields.length >= maxPhoneNumbers && (
                  <span className="text-muted-foreground text-xs">
                    Limite de {maxPhoneNumbers} telefones atingido.
                  </span>
                )}
                {form.formState.errors.phoneNumbers && (
                  <span className="text-red-500 text-xs">
                    {(form.formState.errors.phoneNumbers as any)?.message}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="contact_email" className="mb-2 block">
                  Email
                </Label>
                <Input
                  id="contact_email"
                  {...form.register("email")}
                  placeholder="Email"
                  className="mb-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />
                {form.formState.errors.email && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.email.message}
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={createContact.status === "pending"}
                  onClick={() => {
                    if (createContact.status !== "pending") {
                      form.reset();
                      setOpen(false);
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={createContact.status === "pending"}
                  className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => form.handleSubmit(handleSubmit)()}
                >
                  {createContact.status === "pending" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> A guardar...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

