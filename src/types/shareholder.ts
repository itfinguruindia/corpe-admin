export interface Shareholder {
  id: string;
  applicationNo: string;
  name: string;
  shareholderNumber: number;
  hasDIN: boolean;
  din?: string;
  shareholderName: string;
  fatherName: string;
  email: string;
  phoneNo: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  nationality: string;
  passportNo?: string;
  occupationType: string;
  placeOfBirth: string;
  educationQualification: string;
  presentAddress: string;
  permanentAddress: string;
  pan: string;
  durationOfStayAtPresentAddress: string;
  previousResidenceAddress?: string;
  shareholdingPercentage: number;
  kycVerified: boolean;
  dscApplication: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShareholdersListResponse {
  data: Shareholder[];
  success: boolean;
  message?: string;
}

export interface ShareholderDetailResponse {
  data: Shareholder;
  success: boolean;
  message?: string;
}

export interface UpdateShareholderRequest {
  shareholderId: string;
  data: Partial<Shareholder>;
}

export interface UpdateShareholderResponse {
  success: boolean;
  message: string;
  data?: Shareholder;
}
