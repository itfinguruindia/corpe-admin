export interface RegistrationDocument {
  id: string;
  name: "PAN" | "TAN" | "COI";
  status: "pending" | "approved" | "rejected" | "uploaded";
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
}

export interface RegistrationData {
  appNo: string;
  cin: string;
  companyStatus: string;
  companyType?: string;
  officeEmail?: string;
  documents: RegistrationDocument[];
}

export interface LlpAgreementStatus {
  status: "pending" | "uploaded";
  adminFile?: {
    name: string;
    path: string;
    uploadedBy: string;
  } | null;
  clientFile?: {
    name: string;
    path: string;
    uploadedAt?: string;
    uploadedBy: string;
  } | null;
  downloadAvailable?: boolean;
  downloadedByClient?: boolean;
}
