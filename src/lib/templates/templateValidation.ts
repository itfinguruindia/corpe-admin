import {
  ACCEPTED_TEMPLATE_EXTENSIONS,
  ACCEPTED_TEMPLATE_MIME_TYPES,
  EXTENSION_TO_FILE_TYPE,
  MAX_TEMPLATE_FILE_SIZE_BYTES,
} from "./constants";
import type { TemplateFileType } from "@/types/documentTemplate";

export interface TemplateValidationResult {
  valid: boolean;
  error?: string;
  fileType?: TemplateFileType;
}

function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function resolveTemplateFileType(
  fileName: string,
  mimeType?: string,
): TemplateFileType | null {
  const ext = getExtension(fileName);
  if (ext && ext in EXTENSION_TO_FILE_TYPE) {
    return EXTENSION_TO_FILE_TYPE[ext];
  }

  const mimeMap: Record<string, TemplateFileType> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
  };

  if (mimeType && mimeMap[mimeType]) {
    return mimeMap[mimeType];
  }

  return null;
}

export function validateTemplateFile(file: File): TemplateValidationResult {
  if (!file || file.size === 0) {
    return { valid: false, error: "Please select a valid file." };
  }

  if (file.size > MAX_TEMPLATE_FILE_SIZE_BYTES) {
    const maxMb = MAX_TEMPLATE_FILE_SIZE_BYTES / (1024 * 1024);
    return {
      valid: false,
      error: `File size must not exceed ${maxMb} MB.`,
    };
  }

  const ext = getExtension(file.name);
  const hasValidExtension = ACCEPTED_TEMPLATE_EXTENSIONS.some(
    (accepted) => accepted === `.${ext}`,
  );
  const hasValidMime = ACCEPTED_TEMPLATE_MIME_TYPES.includes(
    file.type as (typeof ACCEPTED_TEMPLATE_MIME_TYPES)[number],
  );

  const fileType = resolveTemplateFileType(file.name, file.type);

  if (!fileType || (!hasValidExtension && !hasValidMime)) {
    return {
      valid: false,
      error: "Only PDF, DOCX, XLSX, and PPTX files are supported.",
    };
  }

  return { valid: true, fileType };
}

export function deriveTemplateName(fileName: string): string {
  const base = fileName.replace(/\.[^/.]+$/, "").trim();
  return base || fileName;
}
