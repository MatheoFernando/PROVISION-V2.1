"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contactId: string) => void;
  companyId?: string;
}

export function ContactCreateModal({ isOpen, onClose, onSuccess }: ContactCreateModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleCreate = () => {
    // Aqui, normalmente chamaria a API. Para restauração, apenas retorna um id fake.
    const fakeId = crypto.randomUUID();
    onSuccess(fakeId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Contato</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="contact-email">Email</Label>
            <Input id="contact-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="contact-phone">Telefone</Label>
            <Input id="contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="button" onClick={handleCreate}>Criar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



