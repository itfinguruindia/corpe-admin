/**
 * Helpers for inline document preview (images + PDFs) in admin modals.
 */

const IMAGE_EXT = /\.(jpeg|jpg|png|gif|webp|svg|bmp)$/i;
const PDF_EXT = /\.pdf$/i;

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
};

function stripQuery(value: string): string {
  return (value || "").split("?")[0] || "";
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getExtension(fileNameOrUrl: string): string {
  const clean = safeDecode(stripQuery(fileNameOrUrl));
  const base = clean.split("/").pop() || clean;
  const parts = base.split(".");
  if (parts.length < 2) return "";
  return (parts.pop() || "").toLowerCase();
}

export function mimeTypeFromFileName(fileNameOrUrl: string): string | null {
  const ext = getExtension(fileNameOrUrl);
  return MIME_BY_EXT[ext] || null;
}

/** Prefer MIME, then filename/url extension. */
export function resolvePreviewKind(
  fileNameOrUrl?: string | null,
  mimeType?: string | null,
): "image" | "pdf" | "other" {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";

  const value = safeDecode(stripQuery(fileNameOrUrl || ""));
  if (IMAGE_EXT.test(value)) return "image";
  if (PDF_EXT.test(value)) return "pdf";
  return "other";
}

/** Ensure blob has a usable MIME type for iframe/img preview. */
export function ensureBlobMimeType(blob: Blob, fileNameOrUrl?: string): Blob {
  const inferred = fileNameOrUrl ? mimeTypeFromFileName(fileNameOrUrl) : null;
  if (
    inferred &&
    (!blob.type ||
      blob.type === "application/octet-stream" ||
      blob.type === "binary/octet-stream")
  ) {
    return new Blob([blob], { type: inferred });
  }
  return blob;
}

/**
 * Load a remote file into a blob object URL for inline preview.
 * Cross-origin URLs (e.g. S3 signed links) are returned as-is — browser
 * fetch is blocked by CORS and would throw "Failed to fetch".
 */
export async function createPreviewObjectUrl(
  sourceUrl: string,
  fileNameHint?: string,
): Promise<{ url: string; kind: "image" | "pdf" | "other"; fileName: string }> {
  const fileName = fileNameHint || sourceUrl;
  const kind = resolvePreviewKind(fileName);

  // Same-origin only — S3 / CDN signed URLs cannot be fetched from the browser.
  if (isCrossOriginUrl(sourceUrl)) {
    return { url: sourceUrl, kind, fileName };
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to load file (${response.status})`);
  }
  const raw = await response.blob();
  const typed = ensureBlobMimeType(raw, fileName);
  return {
    url: URL.createObjectURL(typed),
    kind: resolvePreviewKind(fileName, typed.type),
    fileName,
  };
}

function isCrossOriginUrl(url: string): boolean {
  try {
    if (typeof window === "undefined") return true;
    const parsed = new URL(url, window.location.href);
    return parsed.origin !== window.location.origin;
  } catch {
    return true;
  }
}

export function createPreviewObjectUrlFromBlob(
  blob: Blob,
  fileNameHint?: string,
): { url: string; kind: "image" | "pdf" | "other"; fileName: string } {
  const fileName = fileNameHint || "document";
  const typed = ensureBlobMimeType(blob, fileName);
  return {
    url: URL.createObjectURL(typed),
    kind: resolvePreviewKind(fileName, typed.type),
    fileName,
  };
}
