export const RUN_FILING_STEP_CANONICAL_TITLE = "SPICe+ Part A filed on MCA";
export const RUN_FILING_STEP_CANONICAL_DESCRIPTION = "RUN / SPICe+ Part A filing";
export const RUN_LLP_NAME_RESERVATION_TITLE =
  "Run LLP - Name Reservation filed on MCA";
export const RUN_LLP_NAME_RESERVATION_DESCRIPTION = "Run LLP - Name Reservation";

export const SPICE_PART_B_STEP_CANONICAL_TITLE = "SPICe+ Part B form";
export const SPICE_PART_B_STEP_CANONICAL_DESCRIPTION = "Form preparation & check";
export const FILLIP_FORM_TITLE = "FiLLiP Form";
export const FILLIP_FORM_DESCRIPTION = "Form preparation & check";

export const AGILE_PRO_S_STEP_TITLE = "AGILE-PRO-S form";
export const AGILE_PRO_S_STEP_DESCRIPTION =
  "GSTIN, EPFO, ESIC, Bank account details";
export const INC_FORMS_STEP_TITLE = "INC-9, INC-33, INC-34";
export const INC_FORMS_STEP_DESCRIPTION = "eMoA and eAoA checking";

export const CONSENT_FORM_9_DIGITAL_TITLE = "Consent Form 9 (digital copy)";
export const CONSENT_FORM_9_DIGITAL_DESCRIPTION =
  "Digital consent form signed and verified";
export const CONSENT_FORM_9_PHYSICAL_TITLE = "Consent Form 9 (physical copy)";
export const CONSENT_FORM_9_PHYSICAL_DESCRIPTION =
  "Signed physical consent form received";
export const SUBSCRIBER_SHEET_TITLE = "Subscriber sheet";
export const SUBSCRIBER_SHEET_DESCRIPTION =
  "Subscriber sheet preparation & verification";

export const ALL_DOCUMENTS_DELIVERED_TITLE = "All documents delivered to you";
export const ALL_DOCUMENTS_DELIVERED_DESCRIPTION =
  "COI, MoA/AoA delivered to dashboard";
export const ALL_DOCUMENTS_DELIVERED_OPC_DESCRIPTION =
  "COI delivered to dashboard";

export const isLlpCompanyType = (
  companyType: string | null | undefined,
): boolean => {
  if (!companyType) return false;
  const normalized = companyType.toLowerCase().trim();
  return (
    normalized === "limited-liability-partnership" ||
    normalized === "limited liability partnership" ||
    normalized === "limited liability partnership incorporation" ||
    normalized === "llp" ||
    normalized.includes("limited liability partnership")
  );
};

export const isOpcCompanyType = (
  companyType: string | null | undefined,
): boolean => {
  if (!companyType) return false;
  const normalized = companyType.toLowerCase().trim();
  return (
    normalized === "one-person-company" ||
    normalized === "one person company" ||
    normalized === "opc"
  );
};

export const isPvtIndividualCompanyType = (
  companyType: string | null | undefined,
): boolean => {
  if (!companyType) return false;
  const normalized = companyType.toLowerCase().trim();
  return (
    normalized === "pvt-individual" ||
    normalized === "private company with individual shareholders" ||
    normalized === "private limited company – individual shareholding"
  );
};

export const isMoaAoaExcludedCompanyType = (
  companyType: string | null | undefined,
): boolean =>
  isOpcCompanyType(companyType) || isPvtIndividualCompanyType(companyType);

export const isAllDocumentsDeliveredStepTitle = (title: string): boolean =>
  title.trim() === ALL_DOCUMENTS_DELIVERED_TITLE;

export const isRunFilingStepTitle = (title: string): boolean => {
  const normalized = title.trim();
  return (
    normalized === RUN_FILING_STEP_CANONICAL_TITLE ||
    normalized === RUN_LLP_NAME_RESERVATION_TITLE ||
    normalized === RUN_LLP_NAME_RESERVATION_DESCRIPTION
  );
};

export const isSpicePartBStepTitle = (title: string): boolean => {
  const normalized = title.trim();
  return (
    normalized === SPICE_PART_B_STEP_CANONICAL_TITLE ||
    normalized === FILLIP_FORM_TITLE
  );
};

export const isAgileProSStepTitle = (title: string): boolean => {
  const normalized = title.trim();
  return (
    normalized === AGILE_PRO_S_STEP_TITLE ||
    normalized === CONSENT_FORM_9_PHYSICAL_TITLE
  );
};

export const isIncFormsStepTitle = (title: string): boolean => {
  const normalized = title.trim();
  return (
    normalized === INC_FORMS_STEP_TITLE || normalized === SUBSCRIBER_SHEET_TITLE
  );
};

export const isConsentForm9DigitalStepTitle = (title: string): boolean =>
  title.trim() === CONSENT_FORM_9_DIGITAL_TITLE;

export const isConsentForm9PhysicalStepTitle = (title: string): boolean =>
  isAgileProSStepTitle(title);

export const isManualIndependentTrackerStep = (
  title: string,
  companyType?: string | null,
): boolean =>
  isLlpCompanyType(companyType) && isConsentForm9PhysicalStepTitle(title);

export const getFormFilingProseLabel = (
  companyType?: string | null,
): string =>
  isLlpCompanyType(companyType) ? "FiLLiP Form" : "SPICe+ Part B";

export const getTrackerStepDisplayTitle = (
  title: string,
  companyType?: string | null,
): string => {
  if (isLlpCompanyType(companyType) && isRunFilingStepTitle(title)) {
    return RUN_LLP_NAME_RESERVATION_TITLE;
  }
  if (isLlpCompanyType(companyType) && isSpicePartBStepTitle(title)) {
    return FILLIP_FORM_TITLE;
  }
  if (isLlpCompanyType(companyType) && isAgileProSStepTitle(title)) {
    return CONSENT_FORM_9_PHYSICAL_TITLE;
  }
  if (isLlpCompanyType(companyType) && isIncFormsStepTitle(title)) {
    return SUBSCRIBER_SHEET_TITLE;
  }
  return title;
};

export const getTrackerStepDisplayDescription = (
  description: string,
  stepTitle: string,
  companyType?: string | null,
): string => {
  if (
    isLlpCompanyType(companyType) &&
    (isRunFilingStepTitle(stepTitle) ||
      description.trim() === RUN_FILING_STEP_CANONICAL_DESCRIPTION)
  ) {
    return RUN_LLP_NAME_RESERVATION_DESCRIPTION;
  }
  if (
    isLlpCompanyType(companyType) &&
    (isSpicePartBStepTitle(stepTitle) ||
      description.trim() === SPICE_PART_B_STEP_CANONICAL_DESCRIPTION)
  ) {
    return FILLIP_FORM_DESCRIPTION;
  }
  if (isLlpCompanyType(companyType) && isConsentForm9DigitalStepTitle(stepTitle)) {
    return CONSENT_FORM_9_DIGITAL_DESCRIPTION;
  }
  if (isLlpCompanyType(companyType) && isAgileProSStepTitle(stepTitle)) {
    return CONSENT_FORM_9_PHYSICAL_DESCRIPTION;
  }
  if (
    isLlpCompanyType(companyType) &&
    (isIncFormsStepTitle(stepTitle) ||
      description.trim() === INC_FORMS_STEP_DESCRIPTION)
  ) {
    return SUBSCRIBER_SHEET_DESCRIPTION;
  }
  if (
    isMoaAoaExcludedCompanyType(companyType) &&
    isAllDocumentsDeliveredStepTitle(stepTitle)
  ) {
    return ALL_DOCUMENTS_DELIVERED_OPC_DESCRIPTION;
  }
  return description;
};

export const resolveTrackerStepLabels = (
  title: string,
  description: string,
  companyType?: string | null,
): { title: string; description: string } => ({
  title: getTrackerStepDisplayTitle(title, companyType),
  description: getTrackerStepDisplayDescription(description, title, companyType),
});
