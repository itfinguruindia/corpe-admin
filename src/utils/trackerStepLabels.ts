export const RUN_FILING_STEP_CANONICAL_TITLE = "SPICe+ Part A filed on MCA";
export const RUN_FILING_STEP_CANONICAL_DESCRIPTION = "RUN / SPICe+ Part A filing";
export const RUN_LLP_NAME_RESERVATION_TITLE =
  "Run LLP - Name Reservation filed on MCA";
export const RUN_LLP_NAME_RESERVATION_DESCRIPTION = "Run LLP - Name Reservation";

export const isLlpCompanyType = (
  companyType: string | null | undefined,
): boolean => {
  if (!companyType) return false;
  const normalized = companyType.toLowerCase().trim();
  return (
    normalized === "limited-liability-partnership" ||
    normalized === "limited liability partnership" ||
    normalized === "llp"
  );
};

export const isRunFilingStepTitle = (title: string): boolean => {
  const normalized = title.trim();
  return (
    normalized === RUN_FILING_STEP_CANONICAL_TITLE ||
    normalized === RUN_LLP_NAME_RESERVATION_TITLE ||
    normalized === RUN_LLP_NAME_RESERVATION_DESCRIPTION
  );
};

export const getTrackerStepDisplayTitle = (
  title: string,
  companyType?: string | null,
): string => {
  if (isLlpCompanyType(companyType) && isRunFilingStepTitle(title)) {
    return RUN_LLP_NAME_RESERVATION_TITLE;
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
