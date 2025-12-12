import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SignatureCanvas from "react-signature-canvas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";
import { SiteSelect } from "@/components/common/base-ui/selects/site-select";
import { rsuSchema } from "@/infrastructure/schema/schema-rsu";
import type { Rsu } from "@/infrastructure/types/domain";
import {
  useCreateRsuMutation,
  useUpdateRsuMutation,
} from "@/infrastructure/hooks/useRsu";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { CarSelect } from "@/components/common/base-ui/selects/car-select";
import { ContainerSelect } from "@/components/common/base-ui/selects/container-select";
import { toast } from "sonner";

type RsuFormValues = z.infer<typeof rsuSchema>;

const STATUS_OPTIONS = [
  { value: "Pendente", label: "Pendente" },
  { value: "Em andamento", label: "Em andamento" },
  { value: "Finalizado", label: "Finalizado" },
] as const;

interface RsuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rsuToEdit?: Rsu;
  onSuccess?: (rsu?: Rsu) => void;
}

export function RsuDialog({ open, onOpenChange, rsuToEdit, onSuccess }: RsuDialogProps) {
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
      dataStart: "",
      clientTime: "",
    }),
    [companyId]
  );

  const form = useForm<RsuFormValues>({
    resolver: zodResolver(rsuSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      if (rsuToEdit) {
        form.reset({
          cod: rsuToEdit.cod ?? "",
          containerId: rsuToEdit.containerId ?? "",
          companyId: rsuToEdit.companyId ?? companyId,
          quantity: rsuToEdit.quantity ?? 0,
          comment: rsuToEdit.comment ?? "",
          employeeId: rsuToEdit.employeeId ?? "",
          siteId: rsuToEdit.siteId ?? "",
          status: rsuToEdit.status ?? STATUS_OPTIONS[0].value,
          carId: rsuToEdit.carId ? String(rsuToEdit.carId) : "",
          customerSignature: rsuToEdit.customerSignature ?? "",
          dataStart: rsuToEdit.dataStart ? new Date(rsuToEdit.dataStart).toISOString().slice(0, 16) : "",
          clientTime: rsuToEdit.clientTime ? new Date(rsuToEdit.clientTime).toISOString().slice(0, 16) : "",
        });
      } else {
        form.reset(defaultValues);
        signatureCanvasRef.current?.clear();
      }
    }
  }, [companyId, form, rsuToEdit, open, defaultValues]);

  const createMutation = useCreateRsuMutation();
  const updateMutation = useUpdateRsuMutation();

  const [isSignatureDraw, setIsSignatureDraw] = React.useState(false);

  React.useEffect(() => {
    if (open && rsuToEdit?.customerSignature && signatureCanvasRef.current) {
      const timer = setTimeout(() => {
        if (signatureCanvasRef.current) {
          try {
            signatureCanvasRef.current.fromDataURL(rsuToEdit.customerSignature);
            setIsSignatureDraw(true);
          } catch (e) {
            console.error("Failed to load signature", e);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, rsuToEdit]);

  const handleClearSignature = () => {
    signatureCanvasRef.current?.clear();
    setIsSignatureDraw(false);
    form.setValue("customerSignature", "", { shouldValidate: true });
  };

  const handleSignatureChange = () => {
    const isEmpty = signatureCanvasRef.current?.isEmpty();
    setIsSignatureDraw(!isEmpty);
    if (!isEmpty && signatureCanvasRef.current) {
      form.setValue("customerSignature", signatureCanvasRef.current.toDataURL(), { shouldValidate: true });
    } else {
      form.setValue("customerSignature", "", { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<RsuFormValues> = (values) => {

    let signatureImage = "";
    if (!signatureCanvasRef.current?.isEmpty()) {
      signatureImage = signatureCanvasRef.current?.toDataURL() || "";
    } else if (rsuToEdit?.customerSignature && isSignatureDraw) {

      signatureImage = "";
    }

    const payload: Rsu = {
      ...values,
      companyId: values.companyId || companyId,
      quantity: Number(values.quantity),
      customerSignature: signatureImage,
      id: rsuToEdit?.id,
      dataStart: values.dataStart ? new Date(values.dataStart).toISOString() : undefined,
      clientTime: values.clientTime ? new Date(values.clientTime).toISOString() : undefined,
    };

    if (rsuToEdit?.id) {
      updateMutation.mutate(payload, {
        onSuccess: (data) => {
          toast.success("RSU atualizado com sucesso!");
          onOpenChange(false);
          onSuccess?.(data);
        },
        onError: () => toast.error("Erro ao atualizar RSU"),
      });
      return;
    }

    const createPayload = { ...payload };
    delete createPayload.id;
    // @ts-ignore
    createMutation.mutate(createPayload, {
      onSuccess: (data) => {
        toast.success("RSU criado com sucesso!");
        onOpenChange(false);
        onSuccess?.(data);
      },
      onError: () => toast.error("Erro ao criar RSU"),
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden  dark:bg-slate-950">
        <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {rsuToEdit ? "Editar RSU" : "Novo RSU"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 col-span-2">
                <Label className="text-slate-700 font-medium">Funcionário</Label>
                <EmployeeSelect
                  value={form.watch("employeeId")}
                  onChange={(value) => form.setValue("employeeId", value, { shouldValidate: true })}
                  companyId={companyId}
                />
                {form.formState.errors.employeeId && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.employeeId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cod" className="text-slate-700 font-medium">Código</Label>
                <Input id="cod" placeholder="RSU-001" {...form.register("cod")} className="rounded-xl border-gray-200 focus:ring-blue-500 transition-all bg-white" />
                {form.formState.errors.cod && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.cod.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Estado</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value, { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full rounded-xl border-gray-200 bg-white">
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
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Site</Label>
                <SiteSelect
                  value={form.watch("siteId")}
                  onChange={(value) => form.setValue("siteId", value, { shouldValidate: true })}
                />
                {form.formState.errors.siteId && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.siteId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Viatura</Label>
                <CarSelect
                  value={form.watch("carId")}
                  onChange={(value) => form.setValue("carId", value, { shouldValidate: true })}
                />
                {form.formState.errors.carId && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.carId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Contentor</Label>
                <ContainerSelect
                  value={form.watch("containerId")}
                  onChange={(value) => form.setValue("containerId", value, { shouldValidate: true })}
                />
                {form.formState.errors.containerId && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.containerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-700 font-medium">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  {...form.register("quantity", { valueAsNumber: true })}
                  className="rounded-xl border-gray-200 focus:ring-blue-500 transition-all bg-white"
                />
                {form.formState.errors.quantity && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataStart" className="text-slate-700 font-medium">Data de Início</Label>
                <Input
                  id="dataStart"
                  type="datetime-local"
                  {...form.register("dataStart")}
                  className="rounded-xl border-gray-200 focus:ring-blue-500 transition-all bg-white"
                />
                {form.formState.errors.dataStart && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.dataStart.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientTime" className="text-slate-700 font-medium">Hora do Cliente</Label>
                <Input
                  id="clientTime"
                  type="datetime-local"
                  {...form.register("clientTime")}
                  className="rounded-xl border-gray-200 focus:ring-blue-500 transition-all bg-white"
                />
                {form.formState.errors.clientTime && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.clientTime.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-slate-700 font-medium">Assinatura do Cliente</Label>
              <div className="relative border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                {!isSignatureDraw && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <span className="text-gray-400 text-sm font-medium">Clique aqui para assinar</span>
                  </div>
                )}
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
                  className="mt-2 cursor-pointer flex items-center gap-2 rounded-lg text-xs h-8"
                >
                  <Trash2 className="size-3" />
                  Apagar Assinatura
                </Button>
              )}
              {form.formState.errors.customerSignature && (
                <p className="text-sm text-red-500 font-medium">{form.formState.errors.customerSignature.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment" className="text-slate-700 font-medium">Observação</Label>
              <Textarea
                id="comment"
                rows={4}
                placeholder="Detalhes adicionais..."
                {...form.register("comment")}
                className="resize-none rounded-xl border-gray-200 bg-white focus:ring-blue-500"
              />
              {form.formState.errors.comment && (
                <p className="text-sm text-red-500 font-medium">{form.formState.errors.comment.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="shadow-lg rounded-xl px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                rsuToEdit ? "Atualizar RSU" : "Criar RSU"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}