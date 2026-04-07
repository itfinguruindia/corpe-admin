// Types for Director Documents
// These interfaces are designed to be compatible with future API integration

export type DocumentStatus = "uploaded" | "pending" | "approved" | "rejected";

export interface DirectorDocument {
  id: string;
  directorId: string;
  documentType: string;
  fileName?: string;
  fileUrl?: string;
  status: DocumentStatus;
  uploadedAt?: string;
  updatedAt?: string;
}

export interface DirectorDocumentsGroup {
  directorId: string;
  documents: DirectorDocument[];
}

// API Response types for future integration
export interface DirectorDocumentsResponse {
  data: DirectorDocument[];
  success: boolean;
  message?: string;
}

export interface UploadDocumentRequest {
  directorId: string;
  documentType: string;
  file: File;
}

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data?: DirectorDocument;
}
