export type TemplateFileType = "pdf" | "docx" | "xlsx" | "pptx";

export type TemplateUploadSource = "local" | "drive";

export interface DocumentTemplate {
  id: string;
  templateName: string;
  fileName: string;
  fileType: TemplateFileType;
  uploadSource: TemplateUploadSource;
  uploadedAt: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  driveFileId?: string;
}

export interface TemplateImportPayload {
  file: File;
  templateName?: string;
  uploadSource: TemplateUploadSource;
  driveFileId?: string;
}
