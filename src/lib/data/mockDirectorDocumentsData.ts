// Mock data for Director Documents
// TODO: Replace with actual API calls when backend is ready

import { DirectorDocument } from "@/types/directorDocuments";

// Mock director documents data
export const mockDirectorDocumentsData: Record<string, DirectorDocument[]> = {
  "dir-1": [
    {
      id: "doc-1-1",
      directorId: "dir-1",
      documentType: "Aadhaar Card",
      fileName: "aadhaar_rajesh.pdf",
      fileUrl: "https://example.com/docs/aadhaar_rajesh.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-1-2",
      directorId: "dir-1",
      documentType: "PAN Card",
      fileName: "pan_rajesh.pdf",
      fileUrl: "https://example.com/docs/pan_rajesh.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-1-3",
      directorId: "dir-1",
      documentType: "Driving Licence or Passport or Voter ID",
      fileName: "passport_rajesh.pdf",
      fileUrl: "https://example.com/docs/passport_rajesh.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-1-4",
      directorId: "dir-1",
      documentType: "Address Proof",
      status: "pending",
    },
    {
      id: "doc-1-5",
      directorId: "dir-1",
      documentType: "Photo of Director",
      fileName: "photo_rajesh.jpg",
      fileUrl: "https://example.com/docs/photo_rajesh.jpg",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-1-6",
      directorId: "dir-1",
      documentType: "Photo of Signature of Director",
      status: "pending",
    },
    {
      id: "doc-1-7",
      directorId: "dir-1",
      documentType: "DIR-2",
      status: "pending",
    },
    {
      id: "doc-1-8",
      directorId: "dir-1",
      documentType: "INC-9",
      fileName: "inc9_rajesh.pdf",
      fileUrl: "https://example.com/docs/inc9_rajesh.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-16T00:00:00Z",
      updatedAt: "2025-01-16T00:00:00Z",
    },
    {
      id: "doc-1-9",
      directorId: "dir-1",
      documentType: "Miscellaneous 1",
      status: "pending",
    },
    {
      id: "doc-1-10",
      directorId: "dir-1",
      documentType: "Miscellaneous 2",
      status: "pending",
    },
  ],
  "dir-2": [
    {
      id: "doc-2-1",
      directorId: "dir-2",
      documentType: "Aadhaar Card",
      fileName: "aadhaar_priya.pdf",
      fileUrl: "https://example.com/docs/aadhaar_priya.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-2-2",
      directorId: "dir-2",
      documentType: "PAN Card",
      status: "pending",
    },
    {
      id: "doc-2-3",
      directorId: "dir-2",
      documentType: "Driving Licence or Passport or Voter ID",
      status: "pending",
    },
    {
      id: "doc-2-4",
      directorId: "dir-2",
      documentType: "Address Proof",
      fileName: "address_priya.pdf",
      fileUrl: "https://example.com/docs/address_priya.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-2-5",
      directorId: "dir-2",
      documentType: "Photo of Director",
      status: "pending",
    },
    {
      id: "doc-2-6",
      directorId: "dir-2",
      documentType: "Photo of Signature of Director",
      status: "pending",
    },
    {
      id: "doc-2-7",
      directorId: "dir-2",
      documentType: "DIR-2",
      status: "pending",
    },
    {
      id: "doc-2-8",
      directorId: "dir-2",
      documentType: "INC-9",
      status: "pending",
    },
    {
      id: "doc-2-9",
      directorId: "dir-2",
      documentType: "Miscellaneous 1",
      status: "pending",
    },
    {
      id: "doc-2-10",
      directorId: "dir-2",
      documentType: "Miscellaneous 2",
      status: "pending",
    },
  ],
  "dir-3": [
    {
      id: "doc-3-1",
      directorId: "dir-3",
      documentType: "Aadhaar Card",
      fileName: "aadhaar_amit.pdf",
      fileUrl: "https://example.com/docs/aadhaar_amit.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-3-2",
      directorId: "dir-3",
      documentType: "PAN Card",
      fileName: "pan_amit.pdf",
      fileUrl: "https://example.com/docs/pan_amit.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-3-3",
      directorId: "dir-3",
      documentType: "Driving Licence or Passport or Voter ID",
      fileName: "passport_amit.pdf",
      fileUrl: "https://example.com/docs/passport_amit.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-3-4",
      directorId: "dir-3",
      documentType: "Address Proof",
      fileName: "address_amit.pdf",
      fileUrl: "https://example.com/docs/address_amit.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-3-5",
      directorId: "dir-3",
      documentType: "Photo of Director",
      fileName: "photo_amit.jpg",
      fileUrl: "https://example.com/docs/photo_amit.jpg",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-3-6",
      directorId: "dir-3",
      documentType: "Photo of Signature of Director",
      fileName: "signature_amit.jpg",
      fileUrl: "https://example.com/docs/signature_amit.jpg",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-3-7",
      directorId: "dir-3",
      documentType: "DIR-2",
      status: "pending",
    },
    {
      id: "doc-3-8",
      directorId: "dir-3",
      documentType: "INC-9",
      status: "pending",
    },
    {
      id: "doc-3-9",
      directorId: "dir-3",
      documentType: "Miscellaneous 1",
      status: "pending",
    },
    {
      id: "doc-3-10",
      directorId: "dir-3",
      documentType: "Miscellaneous 2",
      status: "pending",
    },
  ],
  "dir-3b": [
    {
      id: "doc-3b-1",
      directorId: "dir-3b",
      documentType: "Aadhaar Card",
      status: "pending",
    },
    {
      id: "doc-3b-2",
      directorId: "dir-3b",
      documentType: "PAN Card",
      fileName: "pan_neha.pdf",
      fileUrl: "https://example.com/docs/pan_neha.pdf",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-3b-3",
      directorId: "dir-3b",
      documentType: "Driving Licence or Passport or Voter ID",
      status: "pending",
    },
    {
      id: "doc-3b-4",
      directorId: "dir-3b",
      documentType: "Address Proof",
      status: "pending",
    },
    {
      id: "doc-3b-5",
      directorId: "dir-3b",
      documentType: "Photo of Director",
      fileName: "photo_neha.jpg",
      fileUrl: "https://example.com/docs/photo_neha.jpg",
      status: "uploaded",
      uploadedAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "doc-3b-6",
      directorId: "dir-3b",
      documentType: "Photo of Signature of Director",
      status: "pending",
    },
    {
      id: "doc-3b-7",
      directorId: "dir-3b",
      documentType: "DIR-2",
      status: "pending",
    },
    {
      id: "doc-3b-8",
      directorId: "dir-3b",
      documentType: "INC-9",
      status: "pending",
    },
    {
      id: "doc-3b-9",
      directorId: "dir-3b",
      documentType: "Miscellaneous 1",
      status: "pending",
    },
    {
      id: "doc-3b-10",
      directorId: "dir-3b",
      documentType: "Miscellaneous 2",
      status: "pending",
    },
  ],
};

// Simulated API functions for future integration

/**
 * Fetches all documents for a specific director
 * @param directorId - The director ID
 * @returns Promise<DirectorDocument[]>
 */
export async function fetchDirectorDocuments(
  directorId: string,
): Promise<DirectorDocument[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/directors/${directorId}/documents`);
  // const data = await response.json();
  // return data;

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const documents = mockDirectorDocumentsData[directorId];
  if (!documents) {
    return [];
  }

  return documents;
}

/**
 * Uploads a document for a director
 * @param directorId - The director ID
 * @param documentType - The document type
 * @param file - The file to upload
 * @returns Promise<DirectorDocument>
 */
export async function uploadDirectorDocument(
  directorId: string,
  documentType: string,
  file: File,
): Promise<DirectorDocument> {
  // TODO: Replace with actual API call
  // const formData = new FormData();
  // formData.append('file', file);
  // formData.append('documentType', documentType);
  // const response = await fetch(`/api/directors/${directorId}/documents`, {
  //   method: 'POST',
  //   body: formData,
  // });
  // const data = await response.json();
  // return data;

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newDocument: DirectorDocument = {
    id: `doc-${Date.now()}`,
    directorId,
    documentType,
    fileName: file.name,
    fileUrl: URL.createObjectURL(file),
    status: "uploaded",
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Update mock data
  if (!mockDirectorDocumentsData[directorId]) {
    mockDirectorDocumentsData[directorId] = [];
  }

  const docIndex = mockDirectorDocumentsData[directorId].findIndex(
    (doc) => doc.documentType === documentType,
  );

  if (docIndex !== -1) {
    mockDirectorDocumentsData[directorId][docIndex] = newDocument;
  } else {
    mockDirectorDocumentsData[directorId].push(newDocument);
  }

  return newDocument;
}
