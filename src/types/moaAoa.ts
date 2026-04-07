// Types for MOA & AOA Documents
// These interfaces are designed to be compatible with future API integration

export type MoaAoaDocumentStatus =
  | "uploaded"
  | "pending"
  | "approved"
  | "rejected";

export interface MoaAoaDocument {
  id: string;
  applicationNo: string;
  documentType: "MOA" | "AOA" | "Miscellaneous 1";
  fileName?: string;
  fileUrl?: string;
  status: MoaAoaDocumentStatus;
  uploadedAt?: string;
  updatedAt?: string;
}

// API Response types for future integration
export interface MoaAoaDocumentsResponse {
  data: MoaAoaDocument[];
  success: boolean;
  message?: string;
}

export interface UploadMoaAoaDocumentRequest {
  applicationNo: string;
  documentType: string;
  file: File;
}

export interface UploadMoaAoaDocumentResponse {
  success: boolean;
  message: string;
  data?: MoaAoaDocument;
}
