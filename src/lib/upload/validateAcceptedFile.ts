import type { FileValidationResult } from "./types";

export function parseAcceptAttribute(accept?: string): {
  extensions: string[];
  mimeTypes: string[];
} {
  if (!accept) return { extensions: [], mimeTypes: [] };

  const extensions: string[] = [];
  const mimeTypes: string[] = [];

  for (const part of accept.split(",").map((s) => s.trim().toLowerCase())) {
    if (!part) continue;
    if (part.startsWith(".")) {
      extensions.push(part);
    } else if (part.includes("/")) {
      mimeTypes.push(part);
    }
  }

  return { extensions, mimeTypes };
}

function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
}

export function fileNameMatchesAccept(
  fileName: string,
  mimeType: string,
  accept?: string,
): boolean {
  if (!accept) return true;

  const { extensions, mimeTypes } = parseAcceptAttribute(accept);
  if (extensions.length === 0 && mimeTypes.length === 0) return true;

  const ext = getFileExtension(fileName);
  const matchesExtension =
    extensions.length === 0 || extensions.includes(ext);
  const matchesMime =
    mimeTypes.length === 0 ||
    Boolean(mimeType && mimeTypes.includes(mimeType.toLowerCase()));

  return matchesExtension || matchesMime;
}

export function validateAcceptedFile(
  file: File,
  accept?: string,
  maxSizeBytes?: number,
): FileValidationResult {
  if (!file || file.size === 0) {
    return { valid: false, error: "Please select a valid file." };
  }

  if (maxSizeBytes && file.size > maxSizeBytes) {
    const maxMb = maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File size must not exceed ${maxMb} MB.`,
    };
  }

  if (!accept) return { valid: true };

  if (fileNameMatchesAccept(file.name, file.type, accept)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `File type not allowed. Accepted formats: ${accept}`,
  };
}
