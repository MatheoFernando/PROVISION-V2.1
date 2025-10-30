"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContainerSchema } from "@/infrastructure/schema/schema-containers";
import { z } from "zod";
import { useCreateContainer } from "@/infrastructure/hooks/useContainers";
import { toast } from "sonner";
import { Container as ContainerIcon, Plus, Search, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

type CreateContainerInput = z.infer<typeof createContainerSchema>;

export default function Page() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [companies, setCompanies] = useState([
    { id: "1", name: "Empresa ABC" },
    { id: "2", name: "Empresa XYZ" },
  ]);
  const [containers, setContainers] = useState([
    { id: "1", name: "Container Principal - CNT001" },
    { id: "2", name: "Container Secundário - CNT002" },
  ]);
  const [geoLocations, setGeoLocations] = useState([
    { id: "1", name: "Luanda - Centro (-8.8383, 13.2344)" },
    { id: "2", name: "Viana - Industrial (-8.9167, 13.3667)" },
  ]);

  const [companySearch, setCompanySearch] = useState("");
  const [containerSearch, setContainerSearch] = useState("");
  const [geoLocationSearch, setGeoLocationSearch] = useState("");

  const createContainer = useCreateContainer();

  const form = useForm<CreateContainerInput>({
    resolver: zodResolver(createContainerSchema),
    defaultValues: {
      cod: "",
      mark: "",
      model: "",
      capacity: 0,
      containerId: undefined,
      status: false,
      companyId: "",
      geoLocationEntityId: "",
    },
  });

  const onSubmit = async (data: CreateContainerInput) => {
    try {
      setIsSubmitting(true);
      await (
        createContainer.mutateAsync as (
          vars: CreateContainerInput
        ) => Promise<unknown>
      )(data);
      toast.success("Container criado com sucesso!");
      router.push("/dashboard/containers");
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar container");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );
  const filteredContainers = containers.filter((c) =>
    c.name.toLowerCase().includes(containerSearch.toLowerCase())
  );
  const filteredGeoLocations = geoLocations.filter((g) =>
    g.name.toLowerCase().includes(geoLocationSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Novo Container</h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 space-y-6">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cod" className="text-slate-700">
                      Código *
                    </Label>
                    <Input
                      id="cod"
                      {...form.register("cod")}
                      placeholder="Digite o código"
                      className="rounded-lg"
                    />
                    {form.formState.errors.cod && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.cod.message}
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

                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-slate-700">
                      Capacidade (L) *
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      {...form.register("capacity", { valueAsNumber: true })}
                      placeholder="Digite a capacidade em litros"
                      className="rounded-lg"
                    />
                    {form.formState.errors.capacity && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.capacity.message}
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
                    <Label htmlFor="containerId" className="text-slate-700">
                      Container Pai (Opcional)
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("containerId")}
                        onValueChange={(value) =>
                          form.setValue("containerId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione um container pai" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar container..."
                                value={containerSearch}
                                onChange={(e) =>
                                  setContainerSearch(e.target.value)
                                }
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredContainers.map((cont) => (
                            <SelectItem key={cont.id} value={cont.id}>
                              {cont.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar container */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.containerId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.containerId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="geoLocationEntityId"
                      className="text-slate-700"
                    >
                      Geolocalização *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("geoLocationEntityId")}
                        onValueChange={(value) =>
                          form.setValue("geoLocationEntityId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Selecione a geolocalização" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar localização..."
                                value={geoLocationSearch}
                                onChange={(e) =>
                                  setGeoLocationSearch(e.target.value)
                                }
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredGeoLocations.map((geo) => (
                            <SelectItem key={geo.id} value={geo.id}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{geo.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar geolocalização */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.geoLocationEntityId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.geoLocationEntityId.message}
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
                {isSubmitting ? "Salvando..." : "Criar Container"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
