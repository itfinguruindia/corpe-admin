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
  documents: RegistrationDocument[];
}
