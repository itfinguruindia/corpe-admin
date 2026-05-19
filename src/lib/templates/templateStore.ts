import type {
  DocumentTemplate,
  TemplateImportPayload,
} from "@/types/documentTemplate";
import { TEMPLATES_STORAGE_KEY } from "./constants";
import {
  deleteTemplateBlob,
  getTemplateBlob,
  saveTemplateBlob,
} from "./templateDb";
import {
  deriveTemplateName,
  validateTemplateFile,
} from "./templateValidation";

function readMetadata(): DocumentTemplate[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DocumentTemplate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMetadata(templates: DocumentTemplate[]): void {
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Sanitize and ensure unique stored file name */
export function generateUniqueFileName(originalName: string): string {
  const sanitized = originalName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 180);

  const timestamp = Date.now();
  const dotIndex = sanitized.lastIndexOf(".");
  if (dotIndex > 0) {
    const base = sanitized.slice(0, dotIndex);
    const ext = sanitized.slice(dotIndex);
    return `${base}_${timestamp}${ext}`;
  }
  return `${sanitized}_${timestamp}`;
}

export async function listTemplates(): Promise<DocumentTemplate[]> {
  return readMetadata().sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export async function addTemplate(
  payload: TemplateImportPayload,
): Promise<DocumentTemplate> {
  const validation = validateTemplateFile(payload.file);
  if (!validation.valid || !validation.fileType) {
    throw new Error(validation.error ?? "Invalid template file.");
  }

  const id = generateId();
  const storageKey = generateUniqueFileName(payload.file.name);
  const templateName =
    payload.templateName?.trim() || deriveTemplateName(payload.file.name);

  await saveTemplateBlob(storageKey, payload.file);

  const template: DocumentTemplate = {
    id,
    templateName,
    fileName: payload.file.name,
    fileType: validation.fileType,
    uploadSource: payload.uploadSource,
    uploadedAt: new Date().toISOString(),
    storageKey,
    mimeType: payload.file.type || "application/octet-stream",
    sizeBytes: payload.file.size,
    ...(payload.driveFileId ? { driveFileId: payload.driveFileId } : {}),
  };

  const templates = readMetadata();
  templates.unshift(template);
  writeMetadata(templates);

  return template;
}

export async function deleteTemplate(id: string): Promise<void> {
  const templates = readMetadata();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Template not found.");
  }

  const [removed] = templates.splice(index, 1);
  writeMetadata(templates);

  await deleteTemplateBlob(removed.storageKey);
}

export async function getTemplateFileBlob(
  template: DocumentTemplate,
): Promise<Blob | null> {
  return getTemplateBlob(template.storageKey);
}

export async function getTemplateFile(
  template: DocumentTemplate,
): Promise<File | null> {
  const blob = await getTemplateFileBlob(template);
  if (!blob) return null;
  return new File([blob], template.fileName, {
    type: template.mimeType || blob.type,
  });
}
