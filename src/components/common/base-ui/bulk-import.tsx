"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { z } from "zod";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface BulkImportColumn {
  key: string;
  label: string;
  required?: boolean;
}

type RowStatus = "pending" | "valid" | "invalid" | "success" | "error";

interface ParsedRow<TInput> {
  id: number;
  raw: Record<string, string>;
  parsed?: TInput;
  status: RowStatus;
  issues?: string[];
  errorMessage?: string;
  errorDetails?: Record<string, string[]>;
  errorStatus?: number;
}

interface BulkImportDialogProps<TInput> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  columns: BulkImportColumn[];
  schema?: z.ZodType<TInput>;
  onCreate: (data: TInput) => Promise<unknown>;
  mapRawToInput?: (raw: Record<string, string>) => Partial<TInput>;
  templateFilename?: string;
  shouldValidate?: boolean;
}

const POSSIBLE_DELIMITERS = [",", ";", "\t", "|"] as const;
const PAGE_SIZE = 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function resolveStatusCode(payload: unknown): number | undefined {
  if (!isRecord(payload)) return undefined;
  const rawData = isRecord(payload["data"]) ? payload["data"] : undefined;
  const candidates = [payload["statusCode"], rawData?.["statusCode"]];
  return candidates.find(
    (candidate): candidate is number => typeof candidate === "number"
  );
}

function resolveMessage(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  const rawData = isRecord(payload["data"]) ? payload["data"] : undefined;
  const candidates = [payload["message"], rawData?.["message"]];
  return candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0
  );
}

function resolveErrorDetails(
  payload: unknown
): Record<string, string[]> | undefined {
  if (!isRecord(payload)) return undefined;
  const rawData = isRecord(payload["data"]) ? payload["data"] : undefined;
  const candidates = [
    payload["errors"],
    payload["error"],
    rawData?.["errors"],
    rawData?.["error"],
  ];
  for (const candidate of candidates) {
    if (isRecord(candidate)) return candidate as Record<string, string[]>;
  }
  return undefined;
}

function extractPayload(candidate: unknown) {
  if (!isRecord(candidate)) return candidate;
  if ("data" in candidate) {
    const data = (candidate as Record<string, unknown>).data;
    if (isRecord(data)) return data;
  }
  return candidate;
}

function resolveDataText(payload: unknown): string | undefined {
  if (typeof payload === "string") return payload;
  if (!isRecord(payload)) return undefined;
  const data = payload["data"];
  if (typeof data === "string" && data.trim().length > 0) return data;
  return undefined;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function detectDelimiter(line: string) {
  let bestDelimiter: string = ",";
  let bestCount = 0;
  POSSIBLE_DELIMITERS.forEach((delimiter) => {
    const count = (line.match(new RegExp(`\\${delimiter}`, "g")) ?? []).length;
    if (count > bestCount) {
      bestDelimiter = delimiter;
      bestCount = count;
    }
  });
  return bestDelimiter;
}

function splitLine(line: string, delimiter: string) {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (!insideQuotes && char === delimiter) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseCsv(
  content: string,
  columns: BulkImportColumn[]
): Record<string, string>[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitLine(lines[0], delimiter);
  const headerIndex = headers.reduce<Record<string, number>>(
    (acc, header, index) => {
      acc[normalize(header)] = index;
      return acc;
    },
    {}
  );

  return lines.slice(1).map((line) => {
    const values = splitLine(line, delimiter);
    const mappedRow: Record<string, string> = {};

    columns.forEach((column, columnIndex) => {
      const aliases = [normalize(column.key), normalize(column.label)].filter(
        Boolean
      );

      let resolved = "";
      for (const alias of aliases) {
        const index = headerIndex[alias];
        if (index !== undefined) {
          resolved = values[index] ?? "";
          break;
        }
      }

      if (!resolved) {
        resolved = values[columnIndex] ?? "";
      }

      mappedRow[column.key] = resolved;
    });

    return mappedRow;
  });
}

function parseXlsx(
  content: ArrayBuffer,
  columns: BulkImportColumn[]
): Record<string, string>[] {
  const workbook = XLSX.read(content, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  return rows.map((row) => {
    const mapped: Record<string, string> = {};
    columns.forEach((column, index) => {
      const aliases = [
        normalize(column.key),
        normalize(column.label),
        normalize(String.fromCharCode(65 + index)),
      ];
      let resolved = "";
      for (const alias of aliases) {
        const entry = Object.entries(row).find(
          ([header]) => normalize(header) === alias
        );
        if (entry) {
          resolved = String(entry[1] ?? "");
          break;
        }
      }
      if (!resolved) {
        const fallback = row[column.key];
        resolved = fallback ? String(fallback) : "";
      }
      mapped[column.key] = resolved;
    });
    return mapped;
  });
}

function buildTemplateWorkbook(columns: BulkImportColumn[]) {
  const headers = columns.map(
    (column, index) => column.label || column.key || `coluna_${index + 1}`
  );
  const placeholderRow = columns.map(() => "");
  const worksheet = XLSX.utils.aoa_to_sheet([headers, placeholderRow]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo");
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}

function useTemplateDownloader(
  columns: BulkImportColumn[],
  title: string,
  templateFilename?: string
) {
  return React.useCallback(() => {
    const workbookBuffer = buildTemplateWorkbook(columns);
    const blob = new Blob([workbookBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const normalizedTitle =
      normalize(title || "modelo-importacao") || "template";
    link.download = templateFilename?.endsWith(".xlsx")
      ? templateFilename
      : `${normalizedTitle}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [columns, templateFilename, title]);
}

export function BulkImportDialog<TInput>({
  isOpen,
  onOpenChange,
  title,
  columns,
  schema,
  onCreate,
  mapRawToInput,
  templateFilename,
  shouldValidate = true,
}: BulkImportDialogProps<TInput>) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = React.useState<ParsedRow<TInput>[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [selectedFileName, setSelectedFileName] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [retryingRowId, setRetryingRowId] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const downloadTemplate = useTemplateDownloader(
    columns,
    title,
    templateFilename
  );
  const triggerFileSelection = React.useCallback(() => {
    if (isParsing || isSubmitting) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  }, [isParsing, isSubmitting]);

  const hasData = rows.length > 0;

  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(rows.length / PAGE_SIZE)),
    [rows.length]
  );

  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [currentPage, rows]);

  const error400Rows = React.useMemo(() => {
    return rows.filter(
      (row) => row.status === "error" && row.errorStatus === 400
    );
  }, [rows]);

  const error404Rows = React.useMemo(() => {
    return rows.filter(
      (row) => row.status === "error" && row.errorStatus === 404
    );
  }, [rows]);

  const error409Rows = React.useMemo(() => {
    return rows.filter(
      (row) => row.status === "error" && row.errorStatus === 409
    );
  }, [rows]);

  const error404Messages = React.useMemo(() => {
    const messages = error404Rows
      .map((row) => row.errorMessage)
      .filter((message): message is string => Boolean(message?.trim()));
    return Array.from(new Set(messages));
  }, [error404Rows]);

  const error409Messages = React.useMemo(() => {
    const messages = error409Rows
      .map((row) => row.errorMessage)
      .filter((message): message is string => Boolean(message?.trim()));
    return Array.from(new Set(messages));
  }, [error409Rows]);

  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [currentPage, rows.length]);

  const stats = React.useMemo(() => {
    const total = rows.length;
    let valid = 0;
    let invalid = 0;
    let success = 0;
    let error = 0;

    rows.forEach((row) => {
      if (row.status === "valid") valid += 1;
      if (row.status === "invalid") invalid += 1;
      if (row.status === "success") success += 1;
      if (row.status === "error") error += 1;
    });

    return { total, valid, invalid, success, error };
  }, [rows]);

  function resetState() {
    setRows([]);
    setIsParsing(false);
    setIsSubmitting(false);
    setProgress(0);
    setSelectedFileName("");
    setCurrentPage(1);
    setRetryingRowId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function closeDialog() {
    resetState();
    onOpenChange(false);
  }

  function handleDialogChange(open: boolean) {
    if (!open) {
      closeDialog();
      return;
    }
    onOpenChange(true);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);

    setIsParsing(true);
    setRows([]);
    setProgress(0);
    setCurrentPage(1);
    setRetryingRowId(null);

    try {
      let rawRows: Record<string, string>[] = [];
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "xlsx" || extension === "xls") {
        const buffer = await file.arrayBuffer();
        rawRows = parseXlsx(buffer, columns);
      } else {
        const text = await file.text();
        rawRows = parseCsv(text, columns);
      }

      const enableValidation = Boolean(schema) && shouldValidate;

      const nextRows: ParsedRow<TInput>[] = rawRows.map((raw, index) => {
        const baseInput = (
          mapRawToInput
            ? mapRawToInput(raw)
            : (raw as unknown as Partial<TInput>)
        ) as TInput;

        if (!enableValidation || !schema) {
          return {
            id: index + 1,
            raw,
            parsed: baseInput,
            status: "valid",
            issues: [],
          };
        }

        const result = schema.safeParse(baseInput);

        if (!result.success) {
          const issues = result.error.issues?.map((issue) => issue.message);
          return {
            id: index + 1,
            raw,
            parsed: undefined,
            status: "invalid",
            issues,
          };
        }

        return {
          id: index + 1,
          raw,
          parsed: result.data,
          status: "valid",
          issues: [],
        };
      });

      setRows(nextRows);
    } finally {
      setIsParsing(false);
    }
  }

  async function handleSubmit() {
    const candidates = rows.filter(
      (row) => row.status === "valid" || row.status === "error"
    );
    if (!candidates.length) return;

    setIsSubmitting(true);
    setProgress(0);

    let processed = 0;

    for (const row of candidates) {
      if (!row.parsed) {
        processed += 1;
        setProgress((processed / candidates.length) * 100);
        continue;
      }

      try {
        const response = await onCreate(row.parsed);
        const payload = extractPayload(response) ?? response;
        const responseStatus = resolveStatusCode(response);

        if (responseStatus === 404 || responseStatus === 409) {
          const fallbackMessage =
            responseStatus === 404
              ? "Registros relacionados não encontrados"
              : "Conflito de dados detectado";
          const resolvedMessage =
            resolveMessage(payload) ||
            resolveMessage(response) ||
            resolveDataText(payload) ||
            resolveDataText(response) ||
            fallbackMessage;
          const details =
            resolveErrorDetails(payload) || resolveErrorDetails(response);
          processed += 1;
          setProgress((processed / candidates.length) * 100);

          setRows((prev) =>
            prev.map((item) =>
              item.id === row.id
                ? {
                    ...item,
                    status: "error",
                    errorMessage: resolvedMessage,
                    errorDetails: details,
                    errorStatus: responseStatus,
                  }
                : item
            )
          );
          continue;
        }

        processed += 1;
        setProgress((processed / candidates.length) * 100);

        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id
              ? { ...item, status: "success", errorMessage: undefined }
              : item
          )
        );
      } catch (error: unknown) {
        const errorResponse = (error as any)?.response;
        const errorPayload = extractPayload(errorResponse) ?? errorResponse;
        const errorStatus =
          resolveStatusCode(errorResponse) ??
          resolveStatusCode(errorPayload) ??
          errorResponse?.status;

        const message =
          resolveMessage(errorPayload) ||
          resolveMessage(errorResponse) ||
          resolveDataText(errorPayload) ||
          resolveDataText(errorResponse) ||
          (error as any)?.message ||
          "Erro ao criar registro";

        const errorDetails =
          ((isRecord(errorPayload) &&
            (errorPayload.errors as Record<string, string[]> | undefined)) ||
            (isRecord(errorPayload) &&
              (errorPayload.error as Record<string, string[]> | undefined)) ||
            resolveErrorDetails(errorPayload) ||
            resolveErrorDetails(errorResponse)) ??
          undefined;

        processed += 1;
        setProgress((processed / candidates.length) * 100);

        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id
              ? {
                  ...item,
                  status: "error",
                  errorMessage: message,
                  errorDetails: errorDetails,
                  errorStatus: errorStatus,
                }
              : item
          )
        );
      }
    }

    setIsSubmitting(false);
  }

  function renderCell(row: ParsedRow<TInput>, column: BulkImportColumn) {
    const value = row.raw[column.key] ?? "";
    const isMissingRequired = column.required && !value;
    const hasRowIssues = row.status === "invalid" || row.status === "error";

    const baseClass =
      "px-3 py-2 text-xs border-b border-border whitespace-nowrap";

    if (isMissingRequired || hasRowIssues) {
      return (
        <TableCell
          key={column.key}
          className={cn(
            baseClass,
            "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
          )}
        >
          <div className="truncate" title={value || "✕"}>
            {value || "✕"}
          </div>
        </TableCell>
      );
    }

    return (
      <TableCell key={column.key} className={baseClass}>
        <div className="truncate" title={value || "-"}>
          {value || "-"}
        </div>
      </TableCell>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="w-full max-w-5xl sm:max-w-4xl">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx, .xls"
          disabled={isParsing || isSubmitting}
          onChange={handleFileChange}
          className="sr-only"
        />
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 overflow-x-auto">
          {!selectedFileName && (
            <div
              role="button"
              tabIndex={0}
              ref={containerRef}
              onClick={triggerFileSelection}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  triggerFileSelection();
                }
              }}
              className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center shadow-sm transition hover:border-blue-300 hover:bg-muted/50 focus:outline-none  cursor-pointer"
            >
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="size-7" />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  clique para selecionar seu arquivo  XLSX ou XLS
                </p>
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={(event) => {
                      event.stopPropagation();
                      downloadTemplate();
                    }}
                  >
                    <Download className="mr-2 size-4" />
                    Baixar modelo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selectedFileName && (
            <div className="rounded-md border border-border bg-muted/30 p-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FileSpreadsheet className="size-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {selectedFileName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={downloadTemplate}
                  >
                    <Download className="mr-2 size-3" />
                    Baixar modelo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                    disabled={isParsing || isSubmitting}
                    onClick={triggerFileSelection}
                  >
                    Trocar arquivo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {hasData && (
            <div className="space-y-3 rounded-lg border border-border bg-card p-3">
              {error400Rows.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                          Erros de validação (400)
                        </h3>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Existem registros com campos obrigatórios ausentes ou
                          inválidos. Corrija e reenvie.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error404Rows.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/10">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Referências não encontradas (404)
                        </h3>

                        {error404Messages.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-amber-800 dark:text-amber-200">
                            {error404Messages.map((message, index) => (
                              <li
                                key={`404-message-${index}`}
                                className="flex gap-2"
                              >
                                <span className="text-amber-500">•</span>
                                <span className="break-words">{message}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error409Rows.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/10">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Conflitos ou dependências inválidas (409)
                        </h3>

                        {error409Messages.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-amber-800 dark:text-amber-200">
                            {error409Messages.map((message, index) => (
                              <li
                                key={`409-message-${index}`}
                                className="flex gap-2"
                              >
                                <span className="text-amber-500">•</span>
                                <span className="break-words">{message}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                  <span className="font-medium whitespace-nowrap">
                    {stats.total} linha(s)
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    Válidas: {stats.valid}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    Inválidas: {stats.invalid}
                  </span>
                  {stats.success > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      Sucesso: {stats.success}
                    </span>
                  )}
                  {stats.error > 0 && (
                    <span className="text-red-600 dark:text-red-400 whitespace-nowrap">
                      Erros: {stats.error}
                    </span>
                  )}
                </div>

                {(isParsing || isSubmitting) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap">
                      {isParsing
                        ? "Lendo arquivo..."
                        : `Enviando ${Math.round(progress)}%`}
                    </span>
                  </div>
                )}
              </div>

              <div className="relative rounded-md border border-border bg-background overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader className="sticky top-0 z-10 bg-muted">
                    <TableRow>
                      <TableHead className="px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                        #
                      </TableHead>
                      {columns.map((column) => (
                        <TableHead
                          key={column.key}
                          className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                        >
                          <div title={column.label}>
                            {column.label}
                            {column.required && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="odd:bg-muted/30 hover:bg-muted/50"
                      >
                        <TableCell className="px-3 py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                          {row.id}
                        </TableCell>
                        {columns.map((column) => renderCell(row, column))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={currentPage === totalPages || rows.length === 0}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        prev === totalPages ? totalPages : prev + 1
                      )
                    }
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            className="w-full sm:w-auto cursor-pointer"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto cursor-pointer"
            disabled={!stats.valid || isSubmitting || !hasData}
          >
            {isSubmitting ? "Enviando..." : `Criar ${stats.valid} registro(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
