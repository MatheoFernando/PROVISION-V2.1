"use client";

import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmployeeSchema } from "@/infrastructure/schema/schema-employees";
import { z } from "zod";
import { useCreateEmployee } from "@/infrastructure/hooks/useEmployees";
import { toast } from "sonner";
import { Upload, Plus, Search, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export default function EmployeesCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  const [companies, setCompanies] = useState([
    { id: "1", name: "Empresa ABC" },
    { id: "2", name: "Empresa XYZ" },
  ]);
  const [contacts, setContacts] = useState([
    { id: "1", name: "João Silva - 923456789" },
    { id: "2", name: "Maria Santos - 924567890" },
  ]);
  const [sites, setSites] = useState([
    { id: "1", name: "Site Luanda Centro" },
    { id: "2", name: "Site Viana Industrial" },
  ]);
  const [departments, setDepartments] = useState([
    { id: "1", name: "Recursos Humanos" },
    { id: "2", name: "Tecnologia" },
  ]);
  const [users, setUsers] = useState([
    { id: "1", name: "user123 - João Silva" },
    { id: "2", name: "user456 - Maria Santos" },
  ]);
  const [functions, setFunctions] = useState([
    { id: "1", name: "Analista" },
    { id: "2", name: "Gerente" },
  ]);
  const [roles, setRoles] = useState([
    { id: "1", name: "Administrador" },
    { id: "2", name: "Operador" },
  ]);

  const [companySearch, setCompanySearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [siteSearch, setSiteSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [functionSearch, setFunctionSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  const createEmployee = useCreateEmployee();

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      companyId: "",
      fullName: "",
      photo: "",
      contactId: "",
      siteId: "",
      sitesId: "",
      departmentId: "",
      userId: "",
      functionEntityId: "",
      rolesEntityId: "",
      cod: "",
      status: false,
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        form.setValue("photo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateEmployeeInput) => {
    try {
      setIsSubmitting(true);
      await (
        createEmployee.mutateAsync as (
          vars: CreateEmployeeInput
        ) => Promise<unknown>
      )(data);
      toast.success("Funcionário criado com sucesso!");
      router.push("/dashboard/employees");
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar funcionário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );
  const filteredSites = sites.filter((s) =>
    s.name.toLowerCase().includes(siteSearch.toLowerCase())
  );
  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(departmentSearch.toLowerCase())
  );
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredFunctions = functions.filter((f) =>
    f.name.toLowerCase().includes(functionSearch.toLowerCase())
  );
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen ">
      <div >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Novo Funcionário
          </h1>

        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-blue-400 p-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-white text-sm mt-3">
                  Clique para fazer upload da foto
                </p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700">
                      Nome Completo *
                    </Label>
                    <Input
                      id="fullName"
                      {...form.register("fullName")}
                      placeholder="Digite o nome completo"
                      className="rounded-lg"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.fullName.message}
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
                    <Label htmlFor="contactId" className="text-slate-700">
                      Contato *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("contactId")}
                        onValueChange={(value) =>
                          form.setValue("contactId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione o contato" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar contato..."
                                value={contactSearch}
                                onChange={(e) =>
                                  setContactSearch(e.target.value)
                                }
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar contato */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.contactId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.contactId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userId" className="text-slate-700">
                      Usuário *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("userId")}
                        onValueChange={(value) =>
                          form.setValue("userId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione o usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar usuário..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar usuário */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.userId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.userId.message}
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
                    {form.formState.errors.sitesId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.sitesId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departmentId" className="text-slate-700">
                      Departamento *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("departmentId")}
                        onValueChange={(value) =>
                          form.setValue("departmentId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar departamento..."
                                value={departmentSearch}
                                onChange={(e) =>
                                  setDepartmentSearch(e.target.value)
                                }
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredDepartments.map((department) => (
                            <SelectItem
                              key={department.id}
                              value={department.id}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar departamento */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.departmentId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.departmentId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="functionEntityId"
                      className="text-slate-700"
                    >
                      Função *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("functionEntityId")}
                        onValueChange={(value) =>
                          form.setValue("functionEntityId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar função..."
                                value={functionSearch}
                                onChange={(e) =>
                                  setFunctionSearch(e.target.value)
                                }
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredFunctions.map((func) => (
                            <SelectItem key={func.id} value={func.id}>
                              {func.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar função */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.functionEntityId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.functionEntityId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rolesEntityId" className="text-slate-700">
                      Papel/Permissão *
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.watch("rolesEntityId")}
                        onValueChange={(value) =>
                          form.setValue("rolesEntityId", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg w-full">
                          <SelectValue placeholder="Selecione o papel" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Pesquisar papel..."
                                value={roleSearch}
                                onChange={(e) => setRoleSearch(e.target.value)}
                                className="pl-8 rounded-lg"
                              />
                            </div>
                          </div>
                          {filteredRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          /* Abrir modal para adicionar papel */
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.formState.errors.rolesEntityId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.rolesEntityId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
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
                {isSubmitting ? "Salvando..." : "Criar Funcionário"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
