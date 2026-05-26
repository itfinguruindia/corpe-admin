import axios from "axios";
import { toast } from "@heroui/react";

export const PERMISSION_DENIED_CODE = "PERMISSION_DENIED";

export const PERMISSION_DENIED_MESSAGE =
  "You don't have permission to perform this action. Please contact your administrator.";

type ErrorBody = {
  message?: string;
  error?: { code?: string } | string | null;
};

export type MarkedApiError = Error & { __errorToastShown?: boolean };

export function isAxiosApiError(
  error: unknown,
): error is import("axios").AxiosError<ErrorBody> {
  return axios.isAxiosError(error);
}

export function getHttpStatus(error: unknown): number | undefined {
  if (!isAxiosApiError(error)) return undefined;
  return error.response?.status;
}

export function isPermissionDenied(error: unknown): boolean {
  if (!isAxiosApiError(error)) return false;
  if (error.response?.status === 403) return true;
  const code = error.response?.data?.error;
  if (typeof code === "object" && code?.code === PERMISSION_DENIED_CODE) {
    return true;
  }
  const message = (error.response?.data?.message || "").toLowerCase();
  return message.includes("permission") || message.includes("not permitted");
}

export interface ApiErrorMessageOptions {
  /** Shown when the error is not a known HTTP type */
  fallback?: string;
  /** e.g. "upload files" → "You don't have permission to upload files." */
  actionLabel?: string;
}

/**
 * User-facing message for failed API calls (403, 401, network, etc.).
 */
export function getApiErrorMessage(
  error: unknown,
  options: ApiErrorMessageOptions = {},
): string {
  const { fallback = "Something went wrong. Please try again.", actionLabel } =
    options;

  if (isPermissionDenied(error)) {
    if (actionLabel) {
      return `You don't have permission to ${actionLabel}. Please contact your administrator.`;
    }
    const serverMessage = isAxiosApiError(error)
      ? error.response?.data?.message?.trim()
      : "";
    if (serverMessage && /permission|not permitted|forbidden/i.test(serverMessage)) {
      return serverMessage.endsWith(".") ? serverMessage : `${serverMessage}.`;
    }
    return PERMISSION_DENIED_MESSAGE;
  }

  if (isAxiosApiError(error)) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message?.trim();

    if (status === 401) {
      return serverMessage || "Your session has expired. Please sign in again.";
    }
    if (status === 404) {
      return serverMessage || "The requested resource was not found.";
    }
    if (status === 400 || status === 422) {
      return serverMessage || fallback;
    }
    if (serverMessage) return serverMessage;
  }

  if (error instanceof Error && error.message && !error.message.startsWith("Request failed")) {
    return error.message;
  }

  return fallback;
}

let lastToastKey = "";
let lastToastAt = 0;

function shouldShowToast(message: string): boolean {
  const key = message.slice(0, 120);
  const now = Date.now();
  if (key === lastToastKey && now - lastToastAt < 2500) {
    return false;
  }
  lastToastKey = key;
  lastToastAt = now;
  return true;
}

/**
 * Shows a toast for an API failure (deduped). Returns false if skipped.
 */
export function notifyApiError(
  error: unknown,
  options: ApiErrorMessageOptions = {},
): boolean {
  const marked = error as MarkedApiError;
  if (marked?.__errorToastShown) {
    return false;
  }

  const message = getApiErrorMessage(error, options);
  if (!shouldShowToast(message)) {
    return false;
  }

  toast.danger(message);
  marked.__errorToastShown = true;
  return true;
}

export function markErrorToastShown(error: unknown): void {
  (error as MarkedApiError).__errorToastShown = true;
}
