// Mock data for Company Overview
// TODO: Replace with actual API calls when backend is ready

import { CompanyOverview } from "@/types/company";

// Mock company data
export const mockCompanyData: Record<string, CompanyOverview> = {
  GUJC000001: {
    id: "1",
    applicationNo: "GUJC000001",
    cityTown: "Ahmedabad",
    district: "Ahmedabad",
    pincode: "363001",
    state: "Gujarat",
    entityType: "Private Limited",
    cinLlpin: "U12345D_2025FIC000001",
    isIncorporated: true,
    industry: "Technology",
    incorporationDate: "2025-10-25",
    registeredOffice: "State",
    branchOffice: "State",
    status: "Approved",
    paymentStatus: "Approved",
    planChosen: "Premium",
    contactNo: "+91 9876543210",
    contactEmail: "contact@company.com",
    clientName: "Chhaya",
    capitalDetails: 1000000,
    paidUpCapital: 1000000,
    planChoose: "Advance",
    packageType: "Full payment",
    allDocsVerify: true,
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-02-07T00:00:00Z",
  },
  GUJC00001: {
    id: "2",
    applicationNo: "GUJC00001",
    allDocsVerify: true,
    cityTown: "Ahmedabad",
    district: "Ahmedabad",
    pincode: "363001",
    state: "Gujarat",
    entityType: "Private Limited",
    cinLlpin: "U12345D_2025FIC000001",
    isIncorporated: true,
    industry: "Technology",
    incorporationDate: "2025-10-25",
    registeredOffice: "Gujarat",
    branchOffice: "Gujarat",
    status: "Approved",
    paymentStatus: "Approved",
    planChosen: "Premium",
    contactNo: "+91 9876543210",
    contactEmail: "chhaya@company.com",
    clientName: "Chhaya",
    capitalDetails: 1000000,
    paidUpCapital: 1000000,
    planChoose: "Advance",
    packageType: "Full payment",
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-02-07T00:00:00Z",
  },
  RAJC00002: {
    id: "3",
    applicationNo: "RAJC00002",
    allDocsVerify: true,
    cityTown: "Jaipur",
    district: "Jaipur",
    pincode: "302001",
    state: "Rajasthan",
    entityType: "LIMITED",
    cinLlpin: "U67890D_2025RAJ000002",
    isIncorporated: true,
    industry: "Manufacturing",
    incorporationDate: "2025-09-15",
    registeredOffice: "Rajasthan",
    branchOffice: "Delhi",
    status: "Approved",
    paymentStatus: "Approved",
    planChosen: "Standard",
    contactNo: "+91 9876543211",
    contactEmail: "vanshika@company.com",
    clientName: "Vanshika",
    capitalDetails: 5000000,
    paidUpCapital: 5000000,
    planChoose: "Basic",
    packageType: "Full payment",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-02-05T00:00:00Z",
  },
  BHIC00001: {
    id: "4",
    applicationNo: "BHIC00001",
    allDocsVerify: false,
    cityTown: "Mumbai",
    district: "Mumbai",
    pincode: "400001",
    state: "Maharashtra",
    entityType: "(OPC) PRIVATE LIMITED",
    cinLlpin: "U11111D_2025MH000001",
    isIncorporated: false,
    industry: "Retail",
    incorporationDate: "2025-11-01",
    registeredOffice: "Maharashtra",
    branchOffice: undefined,
    status: "Under Review",
    paymentStatus: "Pending",
    planChosen: "Basic",
    contactNo: "+91 9876543212",
    contactEmail: "div@company.com",
    clientName: "Div",
    capitalDetails: 500000,
    paidUpCapital: 500000,
    planChoose: "Advance",
    packageType: "Full payment",
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-02-07T00:00:00Z",
  },
  DLEC00001: {
    id: "5",
    applicationNo: "DLEC00001",
    allDocsVerify: true,
    cityTown: "Delhi",
    district: "New Delhi",
    pincode: "110001",
    state: "Delhi",
    entityType: "LLP",
    cinLlpin: "AAL-1234",
    isIncorporated: true,
    industry: "Consulting",
    incorporationDate: "2025-08-20",
    registeredOffice: "Delhi",
    branchOffice: "Noida",
    status: "Approved",
    paymentStatus: "Approved",
    planChosen: "Premium",
    contactNo: "+91 9876543213",
    contactEmail: "saloni@company.com",
    clientName: "Saloni",
    capitalDetails: 2000000,
    paidUpCapital: 2000000,
    planChoose: "Advance",
    packageType: "Full payment",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-02-06T00:00:00Z",
  },
};

// Simulated API functions for future integration
// These can be easily replaced with actual API calls

/**
 * Fetches company overview data by application number
 * @param applicationNo - The application number to fetch data for
 * @returns Promise<CompanyOverview>
 */
export async function fetchCompanyOverview(
  applicationNo: string,
): Promise<CompanyOverview> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/companies/${applicationNo}`);
  // const data = await response.json();
  // return data;

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const company = mockCompanyData[applicationNo];
  if (!company) {
    throw new Error(
      `Company with application number ${applicationNo} not found`,
    );
  }

  return company;
}

/**
 * Updates company overview data
 * @param applicationNo - The application number
 * @param updates - Partial company data to update
 * @returns Promise<CompanyOverview>
 */
export async function updateCompanyOverview(
  applicationNo: string,
  updates: Partial<CompanyOverview>,
): Promise<CompanyOverview> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/companies/${applicationNo}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updates),
  // });
  // const data = await response.json();
  // return data;

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const company = mockCompanyData[applicationNo];
  if (!company) {
    throw new Error(
      `Company with application number ${applicationNo} not found`,
    );
  }

  // Update mock data
  const updatedCompany = {
    ...company,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  mockCompanyData[applicationNo] = updatedCompany;

  return updatedCompany;
}
