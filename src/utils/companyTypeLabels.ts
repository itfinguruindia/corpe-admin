export function isLlpCompanyType(
  companyType: string | null | undefined,
): boolean {
  if (!companyType) return false;
  const normalized = companyType.toLowerCase().trim();
  return (
    normalized === "limited-liability-partnership" ||
    normalized === "limited liability partnership" ||
    normalized === "llp"
  );
}

export type StakeholderLabels = {
  director: string;
  directors: string;
  directorWithNumber: (n: number) => string;
  shareholder: string;
  shareholders: string;
  shareholderWithNumber: (n: number) => string;
  directorsTab: string;
  shareholdersTab: string;
  directorShareholdersStep: string;
  totalDirectors: (count: number) => string;
  totalShareholders: (count: number) => string;
  alsoADirector: string;
  shareholdingLabel: string;
  viewMoreDirectors: string;
  viewMoreShareholders: string;
  directorNotFound: string;
  shareholderNotFound: string;
  noDirectorsListed: string;
  noShareholdersListed: string;
  uploadedDocsDescription: string;
  din: string;
  dinStatus: string;
  doYouHaveDin: string;
  directorName: string;
  shareholderName: string;
  entityDirector: string;
  entityShareholder: string;
  consentToAct: string;
  dir2: string;
  inc9Director: string;
  subscriberSheet: string;
  formatEntityType: (raw: string) => string;
  cinLlpinLabel: string;
  capitalDetailsLabel: string;
  paidUpCapitalLabel: string;
  showPaidUpCapital: boolean;
};

const DEFAULT_LABELS: StakeholderLabels = {
  director: "Director",
  directors: "Directors",
  directorWithNumber: (n) => `Director ${n}`,
  shareholder: "Shareholder",
  shareholders: "Shareholders",
  shareholderWithNumber: (n) => `Shareholder ${n}`,
  directorsTab: "Directors",
  shareholdersTab: "Shareholders",
  directorShareholdersStep: "Director & Shareholders",
  totalDirectors: (count) => `Total Directors: ${count}`,
  totalShareholders: (count) => `Shareholders ${count}`,
  alsoADirector: "Also a director",
  shareholdingLabel: "Shareholding",
  viewMoreDirectors: "View more Directors",
  viewMoreShareholders: "View more Shareholders",
  directorNotFound: "Director not found",
  shareholderNotFound: "Shareholder not found",
  noDirectorsListed: "No directors listed for this application.",
  noShareholdersListed: "No shareholders listed for this application.",
  uploadedDocsDescription:
    "Manage and view uploaded documents for directors, shareholders, and registered office proofs.",
  din: "DIN",
  dinStatus: "DIN Status",
  doYouHaveDin: "Do you have DIN?",
  directorName: "Director Name",
  shareholderName: "Shareholder Name",
  entityDirector: "(Director)",
  entityShareholder: "(Shareholder)",
  consentToAct: "Consent to Act",
  dir2: "DIR-2",
  inc9Director: "INC-9",
  subscriberSheet: "Subscriber Sheet",
  formatEntityType: (raw) => raw,
  cinLlpinLabel: "CIN",
  capitalDetailsLabel: "Capital Details",
  paidUpCapitalLabel: "Paid up Capital",
  showPaidUpCapital: true,
};

const LLP_LABELS: StakeholderLabels = {
  director: "Designated Partner",
  directors: "Designated Partners",
  directorWithNumber: (n) => `Designated Partner ${n}`,
  shareholder: "Partner",
  shareholders: "Partners",
  shareholderWithNumber: (n) => `Partner ${n}`,
  directorsTab: "Designated Partners",
  shareholdersTab: "Partners",
  directorShareholdersStep: "Designated Partners & Partners",
  totalDirectors: (count) => `Total Designated Partners: ${count}`,
  totalShareholders: (count) => `Partners ${count}`,
  alsoADirector: "Also a Designated Partner",
  shareholdingLabel: "Contribution",
  viewMoreDirectors: "View more Designated Partners",
  viewMoreShareholders: "View more Partners",
  directorNotFound: "Designated Partner not found",
  shareholderNotFound: "Partner not found",
  noDirectorsListed: "No designated partners listed for this application.",
  noShareholdersListed: "No partners listed for this application.",
  uploadedDocsDescription:
    "Manage and view uploaded documents for designated partners, partners, and registered office proofs.",
  din: "DPIN",
  dinStatus: "DPIN Status",
  doYouHaveDin: "Do you have DPIN?",
  directorName: "Designated Partner Name",
  shareholderName: "Partner Name",
  entityDirector: "(Designated Partner)",
  entityShareholder: "(Partner)",
  consentToAct: "Consent to Act as Designated Partner (Form 9)",
  dir2: "Form 9",
  inc9Director: "Subscriber Sheet",
  subscriberSheet: "Subscriber Sheet",
  formatEntityType: (raw) =>
    isLlpCompanyType(raw) ? "Limited Liability Partnership" : raw,
  cinLlpinLabel: "LLPIN",
  capitalDetailsLabel: "Obligation of Contribution",
  paidUpCapitalLabel: "Paid up Capital",
  showPaidUpCapital: false,
};

export function getStakeholderLabels(
  companyType: string | null | undefined,
): StakeholderLabels {
  return isLlpCompanyType(companyType) ? LLP_LABELS : DEFAULT_LABELS;
}

export function getCommentAreaDisplayLabel(
  area: string,
  companyType: string | null | undefined,
): string {
  if (area === "Director & Shareholders") {
    return getStakeholderLabels(companyType).directorShareholdersStep;
  }
  return area;
}
