import {
  getTemplateFile,
  listTemplates,
} from "@/lib/templates/templateStore";
import { fileNameMatchesAccept } from "@/lib/upload/validateAcceptedFile";
import type { DocumentTemplate } from "@/types/documentTemplate";

export async function fetchExistingDocuments(
  accept?: string,
): Promise<DocumentTemplate[]> {
  const templates = await listTemplates();

  if (!accept) return templates;

  return templates.filter((template) =>
    fileNameMatchesAccept(template.fileName, template.mimeType, accept),
  );
}

export async function resolveExistingDocumentAsFile(
  template: DocumentTemplate,
): Promise<File | null> {
  return getTemplateFile(template);
}
