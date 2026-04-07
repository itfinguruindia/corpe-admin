// Mock data for Shareholder Documents
// TODO: Replace with actual API calls when backend is ready

import { ShareholderDocument } from "@/types/shareholderDocuments";

const generateDocuments = (shareholderId: string, name: string): ShareholderDocument[] => [
  {
    id: `doc-${shareholderId}-1`,
    shareholderId,
    documentType: "Aadhaar Card",
    fileName: `aadhaar_${name}.pdf`,
    fileUrl: `https://example.com/docs/aadhaar_${name}.pdf`,
    status: "uploaded",
    uploadedAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: `doc-${shareholderId}-2`,
    shareholderId,
    documentType: "PAN Card",
    fileName: `pan_${name}.pdf`,
    fileUrl: `https://example.com/docs/pan_${name}.pdf`,
    status: "uploaded",
    uploadedAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: `doc-${shareholderId}-3`,
    shareholderId,
    documentType: "Passport",
    fileName: `passport_${name}.pdf`,
    fileUrl: `https://example.com/docs/passport_${name}.pdf`,
    status: "uploaded",
    uploadedAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: `doc-${shareholderId}-4`,
    shareholderId,
    documentType: "Bank Statement",
    fileName: `bank_statement_${name}.pdf`,
    fileUrl: `https://example.com/docs/bank_statement_${name}.pdf`,
    status: "uploaded",
    uploadedAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: `doc-${shareholderId}-5`,
    shareholderId,
    documentType: "INC-9",
    fileName: `inc9_${name}.pdf`,
    fileUrl: `https://example.com/docs/inc9_${name}.pdf`,
    status: "uploaded",
    uploadedAt: "2025-01-16T00:00:00Z",
    updatedAt: "2025-01-16T00:00:00Z",
  },
];

// Mock shareholder documents data
export const mockShareholderDocumentsData: Record<string, ShareholderDocument[]> = {
  "sh-1": generateDocuments("sh-1", "rajesh"),
  "sh-2": generateDocuments("sh-2", "priya"),
  "sh-3": generateDocuments("sh-3", "amit"),
  "sh-3b": generateDocuments("sh-3b", "neha"),
  "sh-4": generateDocuments("sh-4", "vikram"),
  "sh-5": generateDocuments("sh-5", "anita"),
  "sh-6": generateDocuments("sh-6", "sanjay"),
  "sh-7": generateDocuments("sh-7", "rahul"),
  "sh-8": generateDocuments("sh-8", "kavita"),
};

/**
 * Fetches all documents for a specific shareholder
 * @param shareholderId - The shareholder ID
 * @returns Promise<ShareholderDocument[]>
 */
export async function fetchShareholderDocuments(
  shareholderId: string,
): Promise<ShareholderDocument[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const documents = mockShareholderDocumentsData[shareholderId];
  if (!documents) return [];
  return documents;
}

/**
 * Uploads a document for a shareholder
 * @param shareholderId - The shareholder ID
 * @param documentType - The document type
 * @param file - The file to upload
 * @returns Promise<ShareholderDocument>
 */
export async function uploadShareholderDocument(
  shareholderId: string,
  documentType: string,
  file: File,
): Promise<ShareholderDocument> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newDocument: ShareholderDocument = {
    id: `doc-${Date.now()}`,
    shareholderId,
    documentType,
    fileName: file.name,
    fileUrl: URL.createObjectURL(file),
    status: "uploaded",
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!mockShareholderDocumentsData[shareholderId]) {
    mockShareholderDocumentsData[shareholderId] = [];
  }

  const docIndex = mockShareholderDocumentsData[shareholderId].findIndex(
    (doc) => doc.documentType === documentType,
  );

  if (docIndex !== -1) {
    mockShareholderDocumentsData[shareholderId][docIndex] = newDocument;
  } else {
    mockShareholderDocumentsData[shareholderId].push(newDocument);
  }

  return newDocument;
}
