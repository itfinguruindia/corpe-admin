// Types for Directors
// These interfaces are designed to be compatible with future API integration

import { ReactNode } from "react";

export interface Director {
  directorName: ReactNode;
  id: string;
  directorId: string;
  applicationNo: string;
  directorNumber: number;
  hasDIN: boolean;
  din?: string;
  name: string;
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

// API Response types for future integration
export interface DirectorsListResponse {
  data: Director[];
  success: boolean;
  message?: string;
}

export interface DirectorDetailResponse {
  data: Director;
  success: boolean;
  message?: string;
}

export interface UpdateDirectorRequest {
  directorId: string;
  data: Partial<Director>;
}

export interface UpdateDirectorResponse {
  success: boolean;
  message: string;
  data?: Director;
}
