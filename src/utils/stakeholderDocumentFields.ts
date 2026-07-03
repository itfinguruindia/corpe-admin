import type { StakeholderLabels } from "./companyTypeLabels";

export type StakeholderDocumentField = {
  key: string;
  label: string;
};

export function resolveIsForeignResident(
  person: Record<string, unknown> | null | undefined,
): boolean {
  if (!person) return false;
  return Boolean(
    person.isForeignResident ??
      person.foreignResident ??
      person.isForeign ??
      person.isNri,
  );
}

/**
 * Director list documents shown in the admin left column.
 * Mirrors the client Document Upload step (+ present address proof from stakeholder step).
 */
export function getDirectorRegularDocumentFields(params: {
  isForeignResident: boolean;
  isLlp: boolean;
  labels: StakeholderLabels;
  rawDocumentsData?: Record<string, unknown> | null;
}): StakeholderDocumentField[] {
  const { isForeignResident, isLlp, labels, rawDocumentsData } = params;
  const fields: StakeholderDocumentField[] = [];

  if (!isForeignResident) {
    fields.push(
      { key: "adhar", label: "Aadhaar Card" },
      { key: "panCard", label: "PAN Card" },
      { key: "otherGovtDocs", label: "Other Government Documents" },
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
      { key: "passportForeign", label: "Passport (Foreign)" },
      { key: "otherIDForeign", label: "Other ID (Foreign)" },
      { key: "addressProofForeign", label: "Address Proof (Foreign)" },
    );
  }

  fields.push(
    { key: "presentAddressProof", label: "Present Address Proof" },
    { key: "photo", label: "Photo" },
    { key: "signature", label: "Signature" },
  );

  if (!isLlp && rawDocumentsData?.consentToAct) {
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
  const { isForeignResident, isLlp, labels } = params;
  const fields: StakeholderDocumentField[] = [
    { key: "dir2", label: labels.dir2 },
    { key: "inc9Director", label: labels.inc9Director },
  ];

  if (isForeignResident) {
    fields.push({ key: "noPanDeclaration", label: "No PAN Declaration" });
  }

  if (!isLlp) {
    fields.push(
      { key: "miscellaneous1", label: "Miscellaneous 1" },
      { key: "miscellaneous2", label: "Miscellaneous 2" },
      { key: "miscellaneous3", label: "Miscellaneous 3" },
    );
  }

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
      { key: "addressProofIndia", label: "Present Address Proof (India)" },
    );
    if (rawDocumentsData?.passportOrDrivingOrVoter) {
      fields.push({
        key: "passportOrDrivingOrVoter",
        label: "Passport/Driving License/Voter ID",
      });
    }
  } else {
    fields.push(
      { key: "passportForeign", label: "Passport (Foreign)" },
      { key: "otherIDForeign", label: "Other ID (Foreign)" },
      { key: "addressProofForeign", label: "Present Address Proof (Foreign)" },
    );
  }

  return fields;
}

/** INC-9 shareholder template flow exists only for standard company types on the client. */
export function shouldShowShareholderInc9(params: {
  isLlp: boolean;
  isDirectorShareholder?: boolean;
}): boolean {
  if (params.isLlp) return false;
  if (params.isDirectorShareholder) return false;
  return true;
}
