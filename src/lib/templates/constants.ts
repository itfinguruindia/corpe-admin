import type { TemplateFileType } from "@/types/documentTemplate";

export const TEMPLATES_STORAGE_KEY = "corpe_document_templates";

export const TEMPLATE_DB_NAME = "corpe_document_templates_db";
export const TEMPLATE_DB_VERSION = 1;
export const TEMPLATE_FILES_STORE = "template_files";

/** 25 MB max per template file */
export const MAX_TEMPLATE_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export const ACCEPTED_TEMPLATE_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".pptx",
] as const;

export const ACCEPTED_TEMPLATE_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

export const EXTENSION_TO_FILE_TYPE: Record<string, TemplateFileType> = {
  pdf: "pdf",
  docx: "docx",
  xlsx: "xlsx",
  pptx: "pptx",
};

export const FILE_TYPE_LABELS: Record<TemplateFileType, string> = {
  pdf: "PDF",
  docx: "DOCX",
  xlsx: "XLSX",
  pptx: "PPTX",
};

export const FILE_TYPE_ACCEPT =
  ".pdf,.docx,.xlsx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation";
