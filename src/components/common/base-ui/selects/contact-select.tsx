import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Plus,  Loader2, Trash } from "lucide-react";
import {
  useContacts,
  useCreateContact,
} from "@/infrastructure/hooks/useContacts";
import type { Contact } from "@/infrastructure/types/domain";
import { contactSchema } from "@/infrastructure/schema/schema-contact";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContactForm = z.infer<typeof contactSchema>;

interface ContactSelectProps {
  value?: string;
  onChange: (value: string) => void;
  companyId?: string;
  onPhoneChange?: (phone: string) => void;
}

export function ContactSelect({ value, onChange, companyId, onPhoneChange }: ContactSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const { data: contacts = [], isLoading } = useContacts(companyId);
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

  function handleSubmit(data: ContactForm) {
    createContact.mutate(data, {
      onSuccess: (created: Contact) => {
        setOpen(false);
        onChange(created.id!);
        form.reset();
      },
    });
  }

  const list = Array.isArray(contacts) ? contacts : [];
  const selectedContact = list.find((c) => c.id === value);
  const phoneOptions = Array.isArray(selectedContact?.phoneNumbers)
    ? selectedContact!.phoneNumbers.map((p: { phone: string }) => p.phone).filter((p) => (p ?? "").trim() !== "")
    : [];
  const filtered = list.filter((c: Contact) => {
    const phones = (Array.isArray(c.phoneNumbers) ? c.phoneNumbers : [])
      .map((p: { phone: string }) => p.phone)
      .join(", ");
    return (
      String(c.email ?? "").toLowerCase().includes(query.toLowerCase()) ||
      phones.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 mb-2">
        <div className="flex-1 relative min-w-0">
          <Select
            value={value}
            onValueChange={(val) => {
              const selected = (Array.isArray(contacts) ? contacts : []).find((c: Contact) => c.id === val);
              console.log("Contato selecionado:", {
                id: val,
                email: selected?.email ?? null,
                phoneNumbers: Array.isArray(selected?.phoneNumbers)
                  ? selected!.phoneNumbers.map((p: { phone: string }) => p.phone)
                  : [],
              });
              const firstPhone = Array.isArray(selected?.phoneNumbers)
                ? (selected!.phoneNumbers.find((p: { phone: string }) => (p?.phone ?? "").trim() !== "")?.phone ?? "")
                : "";
              setSelectedPhone(firstPhone);
              if (firstPhone) {
                console.log("Telefone pré-selecionado:", firstPhone);
                onPhoneChange?.(firstPhone);
              } else {
                onPhoneChange?.("");
              }
              onChange(val);
            }}
            disabled={isLoading}
          >
            <SelectTrigger id="contact_id" className="w-full ">
              <SelectValue placeholder="Selecione um contato" />
            </SelectTrigger>
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
            <SelectContent className="w-[var(--radix-select-trigger-width)]">
              <div className="p-2 sticky top-0 bg-popover">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar contatos..."
                  className="w-full"
                />
              </div>
              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 text-center">Não há dados disponíveis.</div>
              ) : (
                <div className={filtered.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                  {filtered.map((c: Contact) => (
                    <SelectItem key={c.id} value={c.id!}>
                      {(Array.isArray(c.phoneNumbers) ? c.phoneNumbers : []).map((p: { phone: string }) => p.phone).join(", ")}
                      {c.email ? ` - ${c.email}` : ""}
                    </SelectItem>
                  ))}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        {selectedContact && phoneOptions.length > 0 && (
          <div className="flex-1 relative min-w-0">
            <Select
              value={selectedPhone}
              onValueChange={(phone) => {
                setSelectedPhone(phone);
                console.log("Telefone selecionado:", phone);
                onPhoneChange?.(phone);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full ">
                <SelectValue placeholder="Selecione um telefone" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                <div className={phoneOptions.length > 7 ? "max-h-60 overflow-y-auto" : "max-h-full"}>
                  {phoneOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2 px-3 py-2 rounded-md shrink-0 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" />
      
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>Criar Contato</DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-3 mt-2">
            <div>
              <div className="flex items-end justify-between mb-2">
                <Label className="block">Telefones</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2 cursor-pointer"
                  onClick={() => append({ phone: "" })}
                  aria-label="Adicionar telefone"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      {...form.register(`phoneNumbers.${idx}.phone` as const)}
                      placeholder={`Telefone ${idx + 1}`}
                      className="w-full mb-0"
                      type="number"
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
              {form.formState.errors.phoneNumbers && (
                <span className="text-red-500 text-xs">
                  {(form.formState.errors.phoneNumbers as any)?.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="contact_email" className="mb-2 block">Email</Label>
              <Input
                id="contact_email"
                {...form.register("email")}
                placeholder="Email"
                className="mb-2"
              />
              {form.formState.errors.email && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.email.message}
                </span>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={createContact.status === "pending"}
                className="px-6 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
              >
                {createContact.status === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
