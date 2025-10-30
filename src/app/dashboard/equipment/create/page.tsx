"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEquipmentSchema } from "@/infrastructure/schema/schema-equipment";
import { z } from "zod";
import { useCreateEquipment } from "@/infrastructure/hooks/useEquipment";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;

export default function Page() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [companies, setCompanies] = useState([
    { id: "1", name: "Empresa ABC" },
    { id: "2", name: "Empresa XYZ" },
  ]);
  const [sites, setSites] = useState([
    { id: "1", name: "Site Luanda Centro" },
    { id: "2", name: "Site Viana Industrial" },
  ]);
  const [typeEquipments, setTypeEquipments] = useState([
    { id: "1", name: "Computador" },
    { id: "2", name: "Impressora" },
    { id: "3", name: "Scanner" },
  ]);

  const [companySearch, setCompanySearch] = useState("");
  const [siteSearch, setSiteSearch] = useState("");
  const [sitesSearch, setSitesSearch] = useState("");
  const [typeEquipmentSearch, setTypeEquipmentSearch] = useState("");

  const createEquipment = useCreateEquipment();

  const form = useForm<CreateEquipmentInput>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: {
      serialNumber: "",
      status: false,
      mark: "",
      model: "",
      siteId: "",
      typeEquipmentId: "",
      companyId: "",
      sitesId: "",
    },
  });

  const onSubmit = async (data: CreateEquipmentInput) => {
    try {
      setIsSubmitting(true);
      await (
        createEquipment.mutateAsync as (
          vars: CreateEquipmentInput
        ) => Promise<unknown>
      )(data);
      toast.success("Equipamento criado com sucesso!");
      router.push("/dashboard/equipment");
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar equipamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );
  const filteredSites = sites.filter((s) =>
    s.name.toLowerCase().includes(siteSearch.toLowerCase())
  );
  const filteredSitesSecondary = sites.filter((s) =>
    s.name.toLowerCase().includes(sitesSearch.toLowerCase())
  );
  const filteredTypeEquipments = typeEquipments.filter((t) =>
    t.name.toLowerCase().includes(typeEquipmentSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Novo Equipamento
          </h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 space-y-6">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber" className="text-slate-700">
                      Número de Série *
                    </Label>
                    <Input
                      id="serialNumber"
                      {...form.register("serialNumber")}
                      placeholder="Digite o número de série"
                      className="rounded-lg"
                    />
                    {form.formState.errors.serialNumber && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.serialNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mark" className="text-slate-700">
                      Marca *
                    </Label>
                    <Input
                      id="mark"
                      {...form.register("mark")}
                      placeholder="Digite a marca"
                      className="rounded-lg"
                    />
                    {form.formState.errors.mark && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.mark.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-slate-700">
                      Modelo *
                    </Label>
                    <Input
                      id="model"
                      {...form.register("model")}
                      placeholder="Digite o modelo"
                      className="rounded-lg"
                    />
                    {form.formState.errors.model && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.model.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 ">
                    <Label htmlFor="typeEquipmentId" className="text-slate-700">
                      Tipo de Equipamento *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("typeEquipmentId")}
                        onValueChange={(value) =>
                          form.setValue("typeEquipmentId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione o tipo de equipamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar tipo..."
                                value={typeEquipmentSearch}
                                onChange={(e) =>
                                  setTypeEquipmentSearch(e.target.value)
                                }
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredTypeEquipments.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar tipo */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.typeEquipmentId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.typeEquipmentId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyId" className="text-slate-700">
                      Empresa *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("companyId")}
                        onValueChange={(value) =>
                          form.setValue("companyId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar empresa..."
                                value={companySearch}
                                onChange={(e) =>
                                  setCompanySearch(e.target.value)
                                }
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredCompanies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar empresa */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.companyId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.companyId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteId" className="text-slate-700">
                      Site Principal *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("siteId")}
                        onValueChange={(value) =>
                          form.setValue("siteId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione o site principal" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar site..."
                                value={siteSearch}
                                onChange={(e) => setSiteSearch(e.target.value)}
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredSites.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar site */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.siteId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.siteId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sitesId" className="text-slate-700">
                      Sites Secundários *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("sitesId")}
                        onValueChange={(value) =>
                          form.setValue("sitesId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione sites secundários" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar sites..."
                                value={sitesSearch}
                                onChange={(e) => setSitesSearch(e.target.value)}
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredSitesSecondary.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar site */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.sitesId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.sitesId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-slate-700">
                      Ativo *
                    </Label>
                    <div className="flex items-center gap-3 py-2">
                      <Switch
                        id="status"
                        checked={!!form.watch("status")}
                        onCheckedChange={(v) => form.setValue("status", v)}
                        className="cursor-pointer"
                      />
                      <span className="text-slate-600 text-sm">
                        {form.watch("status") ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    {form.formState.errors.status && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.status.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-lg px-6 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6"
              >
                {isSubmitting ? "Salvando..." : "Criar Equipamento"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
