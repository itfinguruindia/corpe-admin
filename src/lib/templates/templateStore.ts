import type {
  DocumentTemplate,
  TemplateImportPayload,
} from "@/types/documentTemplate";
import { templatesApi } from "@/lib/api/templates";
import {
  deriveTemplateName,
  validateTemplateFile,
} from "./templateValidation";
import { isPermissionDenied } from "@/utils/apiErrors";

export async function listTemplates(): Promise<DocumentTemplate[]> {
  return templatesApi.list();
}

export async function addTemplate(
  payload: TemplateImportPayload,
): Promise<DocumentTemplate> {
  const validation = validateTemplateFile(payload.file);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Invalid template file.");
  }

  return templatesApi.upload(payload.file, {
    templateName:
      payload.templateName?.trim() || deriveTemplateName(payload.file.name),
    uploadSource: payload.uploadSource,
    driveFileId: payload.driveFileId,
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  await templatesApi.delete(id);
}

export async function getTemplateFileBlob(
  template: DocumentTemplate,
): Promise<Blob | null> {
  try {
    return await templatesApi.download(template.id);
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw error;
    }
    return null;
  }
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
