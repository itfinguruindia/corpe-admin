export type FileUploadContext = "clients" | "templates" | "general";

export type FileUploadSource = "local" | "drive" | "existing";

/** Reserved for future cloud providers (Dropbox, OneDrive, etc.) */
export type FutureCloudUploadSource = "dropbox" | "onedrive";

export interface FileUploadSelectMeta {
  source: FileUploadSource;
  driveFileId?: string;
  templateId?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export type FileValidator = (file: File) => FileValidationResult;
