// Mock data for MOA & AOA Documents
// TODO: Replace with actual API calls when backend is ready

import { MoaAoaDocument } from "@/types/moaAoa";

// Mock MOA & AOA documents data
export const mockMoaAoaDocumentsData: Record<string, MoaAoaDocument[]> = {
  GUJC000001: [
    {
      id: "moa-1",
      applicationNo: "GUJC000001",
      documentType: "MOA",
      fileName: "MOA_GUJC000001.pdf",
      fileUrl: "https://example.com/docs/MOA_GUJC000001.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "aoa-1",
      applicationNo: "GUJC000001",
      documentType: "AOA",
      fileName: "AOA_GUJC000001.pdf",
      fileUrl: "https://example.com/docs/AOA_GUJC000001.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "misc-1",
      applicationNo: "GUJC000001",
      documentType: "Miscellaneous 1",
      status: "pending",
    },
  ],
  GUJC00001: [
    {
      id: "moa-2",
      applicationNo: "GUJC00001",
      documentType: "MOA",
      fileName: "MOA_GUJC00001.pdf",
      fileUrl: "https://example.com/docs/MOA_GUJC00001.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "aoa-2",
      applicationNo: "GUJC00001",
      documentType: "AOA",
      status: "pending",
    },
    {
      id: "misc-2",
      applicationNo: "GUJC00001",
      documentType: "Miscellaneous 1",
      status: "pending",
    },
  ],
  RAJC00002: [
    {
      id: "moa-3",
      applicationNo: "RAJC00002",
      documentType: "MOA",
      fileName: "MOA_RAJC00002.pdf",
      fileUrl: "https://example.com/docs/MOA_RAJC00002.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-10T00:00:00Z",
      updatedAt: "2025-01-10T00:00:00Z",
    },
    {
      id: "aoa-3",
      applicationNo: "RAJC00002",
      documentType: "AOA",
      fileName: "AOA_RAJC00002.pdf",
      fileUrl: "https://example.com/docs/AOA_RAJC00002.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-10T00:00:00Z",
      updatedAt: "2025-01-10T00:00:00Z",
    },
    {
      id: "misc-3",
      applicationNo: "RAJC00002",
      documentType: "Miscellaneous 1",
      fileName: "Misc_RAJC00002.pdf",
      fileUrl: "https://example.com/docs/Misc_RAJC00002.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-10T00:00:00Z",
      updatedAt: "2025-01-10T00:00:00Z",
    },
  ],
  BHIC00001: [
    {
      id: "moa-4",
      applicationNo: "BHIC00001",
      documentType: "MOA",
      status: "pending",
    },
    {
      id: "aoa-4",
      applicationNo: "BHIC00001",
      documentType: "AOA",
      status: "pending",
    },
    {
      id: "misc-4",
      applicationNo: "BHIC00001",
      documentType: "Miscellaneous 1",
      status: "pending",
    },
  ],
  DLEC00001: [
    {
      id: "moa-5",
      applicationNo: "DLEC00001",
      documentType: "MOA",
      fileName: "MOA_DLEC00001.pdf",
      fileUrl: "https://example.com/docs/MOA_DLEC00001.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-05T00:00:00Z",
      updatedAt: "2025-01-05T00:00:00Z",
    },
    {
      id: "aoa-5",
      applicationNo: "DLEC00001",
      documentType: "AOA",
      fileName: "AOA_DLEC00001.pdf",
      fileUrl: "https://example.com/docs/AOA_DLEC00001.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-05T00:00:00Z",
      updatedAt: "2025-01-05T00:00:00Z",
    },
    {
      id: "misc-5",
      applicationNo: "DLEC00001",
      documentType: "Miscellaneous 1",
      status: "pending",
    },
  ],
};

// Simulated API functions for future integration

/**
 * Fetches all MOA & AOA documents for a specific application
 * @param applicationNo - The application number
 * @returns Promise<MoaAoaDocument[]>
 */
export async function fetchMoaAoaDocuments(
  applicationNo: string,
): Promise<MoaAoaDocument[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/applications/${applicationNo}/moa-aoa`);
  // const data = await response.json();
  // return data;

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const documents = mockMoaAoaDocumentsData[applicationNo];
  if (!documents) {
    return [];
  }

  return documents;
}

/**
 * Uploads a MOA/AOA document
 * @param applicationNo - The application number
 * @param documentType - The document type
 * @param file - The file to upload
 * @returns Promise<MoaAoaDocument>
 */
export async function uploadMoaAoaDocument(
  applicationNo: string,
  documentType: string,
  file: File,
): Promise<MoaAoaDocument> {
  // TODO: Replace with actual API call
  // const formData = new FormData();
  // formData.append('file', file);
  // formData.append('documentType', documentType);
  // const response = await fetch(`/api/applications/${applicationNo}/moa-aoa`, {
  //   method: 'POST',
  //   body: formData,
  // });
  // const data = await response.json();
  // return data;

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newDocument: MoaAoaDocument = {
    id: `doc-${Date.now()}`,
    applicationNo,
    documentType: documentType as "MOA" | "AOA" | "Miscellaneous 1",
    fileName: file.name,
    fileUrl: URL.createObjectURL(file),
    status: "uploaded",
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Update mock data
  if (!mockMoaAoaDocumentsData[applicationNo]) {
    mockMoaAoaDocumentsData[applicationNo] = [];
  }

  const docIndex = mockMoaAoaDocumentsData[applicationNo].findIndex(
    (doc) => doc.documentType === documentType,
  );

  if (docIndex !== -1) {
    mockMoaAoaDocumentsData[applicationNo][docIndex] = newDocument;
  } else {
    mockMoaAoaDocumentsData[applicationNo].push(newDocument);
  }

  return newDocument;
}
