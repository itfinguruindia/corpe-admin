import { validateTemplateFile } from "@/lib/templates/templateValidation";
import type { FileValidationResult } from "@/lib/upload/types";
import { blobToFile } from "@/utils/fileFromSource";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const GSI_SCRIPT = "https://accounts.google.com/gsi/client";
const GAPI_SCRIPT = "https://apis.google.com/js/api.js";

const DEFAULT_PICKER_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

const OAUTH_TIMEOUT_MS = 120_000;

export interface GoogleDrivePickOptions {
  mimeTypes?: string;
  pickerTitle?: string;
  validateFile?: (file: File) => FileValidationResult;
  /** Abort to cancel in-flight OAuth / picker (e.g. modal closed) */
  signal?: AbortSignal;
}

export function isGoogleDriveAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("cancelled") ||
    msg.includes("canceled") ||
    msg.includes("abort")
  );
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Google Drive selection was cancelled.", "AbortError");
  }
}

export interface DrivePickResult {
  file: File;
  driveFileId: string;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

/** Maps Google OAuth errors to actionable messages for admins/developers. */
export function getGoogleOAuthErrorMessage(error?: string): string {
  switch (error) {
    case "access_denied":
      return (
        "Google blocked sign-in (access_denied). Your OAuth app is in Testing mode — " +
        "add your Google account under Google Cloud Console → APIs & Services → " +
        "OAuth consent screen → Test users. Use the same email you sign in with."
      );
    case "popup_closed_by_user":
      return "Google sign-in was cancelled.";
    case "org_internal":
      return (
        "This Google account is not allowed for this app. Check OAuth consent screen " +
        "user type (Internal vs External) and test users."
      );
    default:
      return error
        ? `Google sign-in failed (${error}). Verify OAuth consent screen, test users, and that Drive API + Picker API are enabled.`
        : "Failed to obtain Google access token.";
  }
}

interface PickerDocument {
  id: string;
  name: string;
  mimeType: string;
}

function getGoogleClientId(): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "Google Drive is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment.",
    );
  }
  return clientId;
}

function getGoogleApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Google Drive is not configured. Set NEXT_PUBLIC_GOOGLE_API_KEY in your environment.",
    );
  }
  return apiKey;
}

function loadScript(src: string, id?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    if (id) script.id = id;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadGoogleScripts(): Promise<void> {
  await loadScript(GSI_SCRIPT, "google-gsi-client");
  await loadScript(GAPI_SCRIPT, "google-api-script");
}

function requestAccessToken(
  clientId: string,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      settle(() =>
        reject(
          new DOMException("Google sign-in was cancelled.", "AbortError"),
        ),
      );
    };

    if (signal?.aborted) {
      reject(
        new DOMException("Google sign-in was cancelled.", "AbortError"),
      );
      return;
    }

    signal?.addEventListener("abort", onAbort);

    const timeoutId = setTimeout(() => {
      settle(() =>
        reject(new Error("Google sign-in timed out. Please try again.")),
      );
    }, OAUTH_TIMEOUT_MS);

    const googleAccounts = (
      // Cast via `unknown` first to avoid incompatible-window structural checks
      window as unknown as Window & {
        google?: {
          accounts: {
            oauth2: {
              initTokenClient: (config: {
                client_id: string;
                scope: string;
                callback: (response: GoogleTokenResponse) => void;
              }) => { requestAccessToken: (options?: { prompt?: string }) => void };
            };
          };
        };
      }
    ).google?.accounts?.oauth2;

    if (!googleAccounts) {
      reject(new Error("Google Identity Services failed to load."));
      return;
    }

    const tokenClient = googleAccounts.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          const message = getGoogleOAuthErrorMessage(response.error);
          settle(() => reject(new Error(message)));
          return;
        }
        settle(() => resolve(response.access_token!));
      },
    });

    tokenClient.requestAccessToken({ prompt: "" });
  });
}

function loadPickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const gapi = (window as Window & { gapi?: { load: Function } }).gapi;
    if (!gapi) {
      reject(new Error("Google API client failed to load."));
      return;
    }

    gapi.load("picker", {
      callback: () => resolve(),
      onerror: () => reject(new Error("Failed to load Google Picker API.")),
    });
  });
}

function openPickerDialog(
  accessToken: string,
  apiKey: string,
  clientId: string,
  options: Pick<
    GoogleDrivePickOptions,
    "mimeTypes" | "pickerTitle" | "signal"
  > = {},
): Promise<PickerDocument> {
  return new Promise((resolve, reject) => {
    const { signal } = options;
    let settled = false;

    const cleanup = () => {
      signal?.removeEventListener("abort", onAbort);
    };

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    const onAbort = () => {
      settle(() =>
        reject(
          new DOMException("Google Drive selection was cancelled.", "AbortError"),
        ),
      );
    };

    if (signal?.aborted) {
      reject(
        new DOMException("Google Drive selection was cancelled.", "AbortError"),
      );
      return;
    }

    signal?.addEventListener("abort", onAbort);

    const googlePicker = window.google?.picker;

    if (!googlePicker) {
      cleanup();
      reject(new Error("Google Picker is not available."));
      return;
    }

    const view = new googlePicker.DocsView(googlePicker.ViewId.DOCS)
      .setIncludeFolders(false)
      .setMimeTypes(options.mimeTypes ?? DEFAULT_PICKER_MIME_TYPES)
      .setSelectFolderEnabled(false);

    const builder = new googlePicker.PickerBuilder()
      .setDeveloperKey(apiKey)
      .setOAuthToken(accessToken)
      .addView(view)
      .setTitle(options.pickerTitle ?? "Select a file from Google Drive");

    const appId = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;
    if (appId) {
      builder.setAppId(appId);
    }

    const picker = builder
      .setCallback((data: { action: string; docs?: PickerDocument[] }) => {
        if (data.action === googlePicker.Action.PICKED && data.docs?.[0]) {
          const doc0 = data.docs[0]!;
          settle(() => resolve(doc0));
          return;
        }
        if (data.action === googlePicker.Action.CANCEL) {
          settle(() =>
            reject(new Error("Google Drive selection was cancelled.")),
          );
        }
      })
      .build();

    picker.setVisible(true);
  });
}

async function downloadDriveFile(
  fileId: string,
  fileName: string,
  mimeType: string,
  accessToken: string,
): Promise<Blob> {
  const exportMimeMap: Record<string, string> = {
    "application/vnd.google-apps.document":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.google-apps.spreadsheet":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.google-apps.presentation":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };

  const isGoogleNative = mimeType.startsWith("application/vnd.google-apps.");
  const url = isGoogleNative
    ? `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeMap[mimeType] ?? "application/pdf")}`
    : `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to download the selected file from Google Drive.");
  }

  return response.blob();
}

function normalizeDriveFileName(name: string, mimeType: string): string {
  const lower = name.toLowerCase();
  if (/\.(pdf|docx|xlsx|pptx)$/.test(lower)) return name;

  const extensionMap: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      ".pptx",
    "application/vnd.google-apps.document": ".docx",
    "application/vnd.google-apps.spreadsheet": ".xlsx",
    "application/vnd.google-apps.presentation": ".pptx",
  };

  const ext = extensionMap[mimeType];
  return ext ? `${name}${ext}` : name;
}

export function isGoogleDriveConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  );
}

export async function pickFileFromGoogleDrive(
  options: GoogleDrivePickOptions = {},
): Promise<DrivePickResult> {
  const { signal, ...pickerOptions } = options;
  const clientId = getGoogleClientId();
  const apiKey = getGoogleApiKey();

  throwIfAborted(signal);
  await loadGoogleScripts();
  throwIfAborted(signal);
  const accessToken = await requestAccessToken(clientId, signal);
  throwIfAborted(signal);
  await loadPickerApi();
  throwIfAborted(signal);

  const doc = await openPickerDialog(accessToken, apiKey, clientId, {
    ...pickerOptions,
    signal,
  });
  throwIfAborted(signal);
  const fileName = normalizeDriveFileName(doc.name, doc.mimeType);
  const blob = await downloadDriveFile(
    doc.id,
    fileName,
    doc.mimeType,
    accessToken,
  );

  const file = await blobToFile(blob, fileName, blob.type || doc.mimeType);
  const validate =
    options.validateFile ??
    ((f: File) => validateTemplateFile(f) as FileValidationResult);
  const validation = validate(file);

  if (!validation.valid) {
    throw new Error(
      validation.error ?? "Selected Drive file is not a supported format.",
    );
  }

  return { file, driveFileId: doc.id };
}
