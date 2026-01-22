import type { AxiosResponse } from "axios";

export interface ApiEnvelope<T> {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEnvelope<T>(value: unknown): value is ApiEnvelope<T> & Record<string, unknown> {
  if (!isRecord(value)) return false;
  return "statusCode" in value || "success" in value || "message" in value || "data" in value;
}

export function resolveApiResponse<T>(response: AxiosResponse<unknown>) {
  const raw = response?.data;
  const envelope = isEnvelope<T>(raw) ? (raw as ApiEnvelope<T>) : undefined;
  const statusCode = envelope?.statusCode ?? response.status ?? 0;
  const payload = (envelope?.data ?? raw) as T | undefined;
  const message =
    typeof envelope?.message === "string" && envelope.message.trim().length > 0
      ? envelope.message
      : undefined;

  return {
    statusCode,
    payload,
    message,
    envelope,
  };
}

export function resolveApiErrorPayload<T>(error: unknown) {
  const response = (error as { response?: AxiosResponse<unknown> })?.response;
  if (!response) {
    const fallbackMessage =
      error instanceof Error && error.message.trim().length > 0 ? error.message : undefined;
    return {
      statusCode: undefined,
      message: fallbackMessage,
      payload: undefined as T | undefined,
      envelope: undefined as ApiEnvelope<T> | undefined,
    };
  }

  const result = resolveApiResponse<T>(response);
  const fallbackMessage =
    result.message ||
    (typeof result.payload === "string" && result.payload.trim().length > 0
      ? (result.payload as unknown as string)
      : undefined);

  return {
    statusCode: result.statusCode,
    message: fallbackMessage,
    payload: result.payload,
    envelope: result.envelope,
  };
}

