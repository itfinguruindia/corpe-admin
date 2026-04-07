import { RegistrationData } from "@/types/registrationDocuments";

export const mockRegistrationData: Record<string, RegistrationData> = {
  "GUJC000001": {
    appNo: "GUJC000001",
    cin: "",
    companyStatus: "Active",
    documents: [
      { id: "1", name: "PAN", status: "pending" },
      { id: "2", name: "TAN", status: "pending" },
      { id: "3", name: "COI", status: "pending" },
    ],
  },
  "GUJC00001": {
    appNo: "GUJC00001",
    cin: "",
    companyStatus: "Active",
    documents: [
      { id: "1", name: "PAN", status: "pending" },
      { id: "2", name: "TAN", status: "pending" },
      { id: "3", name: "COI", status: "pending" },
    ],
  },
  "RAJC00002": {
    appNo: "RAJC00002",
    cin: "",
    companyStatus: "Active",
    documents: [
      { id: "1", name: "PAN", status: "pending" },
      { id: "2", name: "TAN", status: "pending" },
      { id: "3", name: "COI", status: "pending" },
    ],
  },
  "BHIC00001": {
    appNo: "BHIC00001",
    cin: "",
    companyStatus: "Active",
    documents: [
      { id: "1", name: "PAN", status: "pending" },
      { id: "2", name: "TAN", status: "pending" },
      { id: "3", name: "COI", status: "pending" },
    ],
  },
  "DLEC00001": {
    appNo: "DLEC00001",
    cin: "",
    companyStatus: "Active",
    documents: [
      { id: "1", name: "PAN", status: "pending" },
      { id: "2", name: "TAN", status: "pending" },
      { id: "3", name: "COI", status: "pending" },
    ],
  },
};

export async function fetchRegistrationData(appNo: string): Promise<RegistrationData | null> {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
  return mockRegistrationData[appNo] || null;
}
