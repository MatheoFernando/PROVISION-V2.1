"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (addressId: string) => void;
  companyId?: string;
}

export function AddressCreateModal({ isOpen, onClose, onSuccess }: AddressCreateModalProps) {
  const [houseHold, setHouseHold] = useState("");
  const [municipality, setMunicipality] = useState("");

  const handleCreate = () => {
    const fakeId = crypto.randomUUID();
    onSuccess(fakeId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Endereço</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="address-houseHold">Casa</Label>
            <Input id="address-houseHold" value={houseHold} onChange={(e) => setHouseHold(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="address-municipality">Município</Label>
            <Input id="address-municipality" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
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



