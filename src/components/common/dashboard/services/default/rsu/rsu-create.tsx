"use client";

import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import SignatureCanvas from "react-signature-canvas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { rsuSchema } from "@/infrastructure/schema/schema-rsu";
import type { Rsu } from "@/infrastructure/types/domain";
import {
  useCreateRsuMutation,
  useRsuDetailQuery,
  useUpdateRsuMutation,
} from "@/infrastructure/hooks/useRsu";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { CarSelect } from "@/components/common/base-ui/selects/car-select";
import { ContainerSelect } from "@/components/common/base-ui/selects/container-select";

type RsuFormValues = z.infer<typeof rsuSchema>;

const STATUS_OPTIONS = [
  { value: "Pendente", label: "Pendente" },
  { value: "Em andamento", label: "Em andamento" },
  { value: "Finalizado", label: "Finalizado" },
] as const;

interface RsuCreateProps {
  id?: string;
  initialData?: Rsu;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RsuCreate({ id: propId, initialData, onSuccess, onCancel }: RsuCreateProps) {
  const params = useSearchParams();
  const routeId = params.get("id") || undefined;
  const id = propId ?? routeId;
  const companyId = useAuthStore((state) => state.companyId || "");
  const signatureCanvasRef = React.useRef<SignatureCanvas>(null);

  const defaultValues = React.useMemo<RsuFormValues>(
    () => ({
      cod: "",
      containerId: "",
      companyId,
      quantity: 0,
      comment: "",
      employeeId: "",
      siteId: "",
      status: STATUS_OPTIONS[0].value,
      carId: "",
      customerSignature: "",
    }),
    [companyId]
  );

  const form = useForm<RsuFormValues>({
    resolver: zodResolver(rsuSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues,
  });

  const shouldQuery = !initialData && !!id;
  const { data: rsuData } = useRsuDetailQuery(shouldQuery ? id : undefined);

  React.useEffect(() => {
    const dataToUse = initialData ?? rsuData;
    if (!dataToUse) return;
    form.reset({
      cod: dataToUse.cod ?? "",
      containerId: dataToUse.containerId ?? "",
      companyId: dataToUse.companyId ?? companyId,
      quantity: dataToUse.quantity ?? 0,
      comment: dataToUse.comment ?? "",
      employeeId: dataToUse.employeeId ?? "",
      siteId: dataToUse.siteId ?? "",
      status: dataToUse.status ?? STATUS_OPTIONS[0].value,
      carId: dataToUse.carId ?? "",
      customerSignature: dataToUse.customerSignature ?? "",
    });
  }, [companyId, form, initialData, rsuData]);

  const createMutation = useCreateRsuMutation();
  const updateMutation = useUpdateRsuMutation();

  const [isSignatureDraw, setIsSignatureDraw] = React.useState(false);

  const handleClearSignature = () => {
    signatureCanvasRef.current?.clear();
    setIsSignatureDraw(false);
  };

  const handleSignatureChange = () => {
    const isEmpty = signatureCanvasRef.current?.isEmpty();
    setIsSignatureDraw(!isEmpty);
  };

  const onSubmit: SubmitHandler<RsuFormValues> = (values) => {
    const signatureImage = signatureCanvasRef.current?.toDataURL() || "";
    
    const payload: Rsu = {
      ...values,
      companyId: values.companyId || companyId,
      quantity: Number(values.quantity),
      customerSignature: signatureImage,
      id,
    };

    if (id) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
      return;
    }

    const createPayload = { ...payload };
    delete createPayload.id;
    createMutation.mutate(createPayload as Omit<Rsu, "id">, {
      onSuccess: () => {
        form.reset(defaultValues);
        signatureCanvasRef.current?.clear();
        onSuccess?.();
      },
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 col-span-2">
          <Label>Funcionário</Label>
          <EmployeeSelect
            value={form.watch("employeeId")}
            onChange={(value) => form.setValue("employeeId", value, { shouldValidate: true })}
            companyId={companyId}
          />
          {form.formState.errors.employeeId && (
            <p className="text-sm text-red-500">{form.formState.errors.employeeId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cod">Código</Label>
          <Input id="cod" placeholder="RSU-001" {...form.register("cod")} />
          {form.formState.errors.cod && (
            <p className="text-sm text-red-500">{form.formState.errors.cod.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value) => form.setValue("status", value, { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Site</Label>
          <SiteSelect
            value={form.watch("siteId")}
            onChange={(value) => form.setValue("siteId", value, { shouldValidate: true })}
          />
          {form.formState.errors.siteId && (
            <p className="text-sm text-red-500">{form.formState.errors.siteId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Viatura</Label>
          <CarSelect
            value={form.watch("carId")}
            onChange={(value) => form.setValue("carId", value, { shouldValidate: true })}
          />
          {form.formState.errors.carId && (
            <p className="text-sm text-red-500">{form.formState.errors.carId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Contentor</Label>
          <ContainerSelect
            value={form.watch("containerId")}
            onChange={(value) => form.setValue("containerId", value, { shouldValidate: true })}
          />
          {form.formState.errors.containerId && (
            <p className="text-sm text-red-500">{form.formState.errors.containerId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            {...form.register("quantity", { valueAsNumber: true })}
          />
          {form.formState.errors.quantity && (
            <p className="text-sm text-red-500">{form.formState.errors.quantity.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 col-span-2">
        <Label>Assinatura do Cliente</Label>
        <div className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <span className="text-gray-400 text-lg font-medium">Clique aqui para assinar</span>
          </div>
          <SignatureCanvas
            ref={signatureCanvasRef}
            penColor="black"
            onEnd={handleSignatureChange}
            canvasProps={{
              width: 500,
              height: 200,
              className: "sigCanvas w-full block relative z-10 cursor-crosshair",
            }}
          />
        </div>
        {isSignatureDraw && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearSignature}
            className="mt-2 cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="size-4" />
            Apagar Assinatura
          </Button>
        )}
        {form.formState.errors.customerSignature && (
          <p className="text-sm text-red-500">{form.formState.errors.customerSignature.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Observação</Label>
        <Textarea
          id="comment"
          rows={4}
          placeholder="Detalhes adicionais..."
          {...form.register("comment")}
          className="resize-none"
        />
        {form.formState.errors.comment && (
          <p className="text-sm text-red-500">{form.formState.errors.comment.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel?.()}
          className="cursor-pointer"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg px-6">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Salvando...
            </span>
          ) : id ? (
            "Atualizar RSU"
          ) : (
            "Criar RSU"
          )}
        </Button>
      </div>
    </form>
  );
}