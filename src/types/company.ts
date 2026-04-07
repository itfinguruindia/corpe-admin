// Status for Name Application company names
export type NameStatus = "Pending" | "Approved" | "Resubmission" | "Rejected";
// Types for Company Overview
// These interfaces are designed to be compatible with future API integration

export interface CompanyOverview {
  id: string;
  applicationNo: string;
  allDocsVerify: boolean;
  cityTown: string;
  district: string;
  pincode: string;
  state: string;
  entityType: string;
  cinLlpin: string;
  isIncorporated: boolean;
  industry: string;
  incorporationDate: string;
  registeredOffice: string;
  branchOffice?: string;
  status: CompanyStatus;
  paymentStatus: PaymentStatus;
  planChosen: string;
  contactNo: string;
  contactEmail: string;
  clientName: string;
  capitalDetails: number;
  paidUpCapital: number;
  planChoose: "Basic" | "Advance";
  packageType: "Full payment" | "Instalment";
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyStatus =
  | "Approved"
  | "Pending"
  | "Rejected"
  | "Under Review";
export type PaymentStatus = "Approved" | "Pending" | "Failed";

// API Response types for future integration
export interface CompanyOverviewResponse {
  data: CompanyOverview;
  success: boolean;
  message?: string;
}

export interface UpdateCompanyRequest {
  applicationNo: string;
  data: Partial<CompanyOverview>;
}

export interface UpdateCompanyResponse {
  success: boolean;
  message: string;
  data?: CompanyOverview;
}
