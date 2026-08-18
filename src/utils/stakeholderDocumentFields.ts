import type { StakeholderLabels } from "./companyTypeLabels";

export type StakeholderDocumentField = {
  key: string;
  label: string;
};

const FOREIGN_DOCUMENT_KEYS = [
  "passportForeign",
  "otherIDForeign",
  "addressProofForeign",
  "noPanDeclaration",
] as const;

const hasUploadedFile = (value: unknown): boolean => {
  if (!value) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value !== "object") return false;
  const file = value as Record<string, unknown>;
  return Boolean(file.path || file.url || file.name);
};

export function resolveIsForeignResident(
  person: Record<string, unknown> | null | undefined,
  rawDocumentsData?: Record<string, unknown> | null,
): boolean {
  if (person) {
    const flagged = Boolean(
      person.isForeignResident ??
        person.foreignResident ??
        person.isForeign ??
        person.isNri ??
        person.isForeignEntity,
    );
    if (flagged) return true;
  }

  if (!rawDocumentsData) return false;
  if (rawDocumentsData.isForeignResident === true) return true;
  if (rawDocumentsData.isForeignEntity === true) return true;
  return FOREIGN_DOCUMENT_KEYS.some((key) =>
    hasUploadedFile(rawDocumentsData[key]),
  );
}

/**
 * Director list documents shown in the admin left column.
 * Mirrors the client Document Upload step (+ present address proof from stakeholder step).
 */
export function getDirectorRegularDocumentFields(params: {
  isForeignResident: boolean;
  isLlp: boolean;
  isOpc?: boolean;
  labels: StakeholderLabels;
  rawDocumentsData?: Record<string, unknown> | null;
}): StakeholderDocumentField[] {
  const { isForeignResident, isLlp, isOpc, labels, rawDocumentsData } = params;
  const fields: StakeholderDocumentField[] = [];

  if (!isForeignResident) {
    fields.push(
      { key: "adhar", label: "Aadhaar Card" },
      { key: "panCard", label: "PAN Card" },
      {
        key: "otherGovtDocs",
        label: "Driving Licence or Passport or Voter ID",
      },
      { key: "addressProofIndia", label: "Address Proof (India)" },
    );
    if (rawDocumentsData?.passportOrDrivingOrVoter) {
      fields.push({
        key: "passportOrDrivingOrVoter",
        label: "Passport/Driving License/Voter ID",
      });
    }
    if (rawDocumentsData?.addressProof) {
      fields.push({ key: "addressProof", label: "Address Proof" });
    }
  } else {
    fields.push(
      { key: "passportForeign", label: "Passport" },
      { key: "otherIDForeign", label: "Other Government ID" },
      { key: "addressProofForeign", label: "Address Proof (Foreign)" },
    );
  }

  fields.push(
    { key: "presentAddressProof", label: "Present Address Proof" },
    { key: "photo", label: "Photo" },
    { key: "signature", label: "Signature" },
  );

  if (isLlp && isForeignResident) {
    fields.push({
      key: "inc9Shareholder",
      label: "COI and Any other related documents to Incorporation",
    });
  }

  if (isOpc || (!isLlp && rawDocumentsData?.consentToAct)) {
    fields.push({ key: "consentToAct", label: labels.consentToAct });
  }

  return fields;
}

/** Admin/client dual-source director documents (right column + misc row). */
export function getDirectorDualSourceDocumentFields(params: {
  isForeignResident: boolean;
  isLlp: boolean;
  labels: StakeholderLabels;
}): StakeholderDocumentField[] {
  const { isForeignResident, labels } = params;
  const fields: StakeholderDocumentField[] = [
    { key: "dir2", label: labels.dir2 },
    { key: "inc9Director", label: labels.inc9Director },
  ];

  if (isForeignResident) {
    fields.push({ key: "noPanDeclaration", label: "No PAN Declaration" });
  }

  fields.push(
    { key: "miscellaneous1", label: "Miscellaneous Document 1" },
    { key: "miscellaneous2", label: "Miscellaneous Document 2" },
    { key: "miscellaneous3", label: "Miscellaneous Document 3" },
  );

  return fields;
}

/** Shareholder list documents — mirrors client shareholder document upload section. */
export function getShareholderRegularDocumentFields(params: {
  isForeignResident: boolean;
  isDirectorShareholder?: boolean;
  rawDocumentsData?: Record<string, unknown> | null;
}): StakeholderDocumentField[] {
  const { isForeignResident, isDirectorShareholder, rawDocumentsData } = params;

  if (isDirectorShareholder) {
    return [];
  }

  const fields: StakeholderDocumentField[] = [];

  if (!isForeignResident) {
    fields.push(
      { key: "adhar", label: "Aadhaar Card" },
      { key: "panCard", label: "PAN Card" },
      { key: "addressProofIndia", label: "Address Proof (India)" },
    );
    if (rawDocumentsData?.passportOrDrivingOrVoter) {
      fields.push({
        key: "passportOrDrivingOrVoter",
        label: "Passport/Driving License/Voter ID",
      });
    }
  } else {
    fields.push(
      { key: "passportForeign", label: "Passport" },
      { key: "otherIDForeign", label: "Other Government ID" },
      { key: "addressProofForeign", label: "Address Proof (Foreign)" },
    );
  }

  return fields;
}

/** INC-9 shareholder template flow exists for non-LLP types, including director-shareholders. */
export function shouldShowShareholderInc9(params: {
  isLlp: boolean;
  isDirectorShareholder?: boolean;
}): boolean {
  if (params.isLlp) return false;
  return true;
}
