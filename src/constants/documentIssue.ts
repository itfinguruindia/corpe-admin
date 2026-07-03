export type DocumentIssueEntityType =
  | "director"
  | "shareholder"
  | "company"
  | "registeredOffice"
  | "partner"
  | "registration";

export type DocumentIssueClientRoute =
  | "document-upload"
  | "corporate-structure"
  | "registration-documents";

export const DOCUMENT_ISSUE_SUGGESTIONS = [
  "The uploaded document is blurry. Please re-upload a clearer copy.",
  "Wrong document uploaded. Please upload the correct document.",
  "The document appears to be expired. Please upload a valid document.",
  "Name on the document does not match the application details.",
  "Signature is missing or not visible. Please upload a signed copy.",
  "Document is incomplete or partially cropped. Please upload the full page.",
  "Please upload a colour scan instead of a black-and-white copy.",
  "The document is not in the required format. Please upload PDF or a clear image.",
] as const;

export const buildDocumentAnchorId = (params: {
  entityType: DocumentIssueEntityType;
  entityId: string;
  fieldKey: string;
}): string => {
  const { entityType, entityId, fieldKey } = params;
  return `${entityType}:${entityId}:${fieldKey}`;
};
