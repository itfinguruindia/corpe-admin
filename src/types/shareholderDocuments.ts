// Types for Shareholder Documents
// These interfaces are designed to be compatible with future API integration

export type DocumentStatus = "uploaded" | "pending" | "approved" | "rejected";

export interface ShareholderDocument {
  id: string;
  shareholderId: string;
  documentType: string;
  fileName?: string;
  fileUrl?: string;
  status: DocumentStatus;
  uploadedAt?: string;
  updatedAt?: string;
}

export interface ShareholderDocumentsGroup {
  shareholderId: string;
  documents: ShareholderDocument[];
}

// API Response types for future integration
export interface ShareholderDocumentsResponse {
  data: ShareholderDocument[];
  success: boolean;
  message?: string;
}

export interface UploadShareholderDocumentRequest {
  shareholderId: string;
  documentType: string;
  file: File;
}

export interface UploadShareholderDocumentResponse {
  success: boolean;
  message: string;
  data?: ShareholderDocument;
}
