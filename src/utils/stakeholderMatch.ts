/** Match director/shareholder rows that represent the same person. */
export function isSameStakeholderPerson(
  personA: {
    panNumber?: string | null;
    pan?: string | null;
    email?: string | null;
    name?: string | null;
    directorName?: string | null;
    shareholderName?: string | null;
  } | null
  | undefined,
  personB: {
    panNumber?: string | null;
    pan?: string | null;
    email?: string | null;
    name?: string | null;
    directorName?: string | null;
    shareholderName?: string | null;
  } | null
  | undefined,
): boolean {
  if (!personA || !personB) return false;

  const normalize = (value?: string | null) =>
    String(value || "")
      .toLowerCase()
      .trim();

  const panA = normalize(personA.panNumber || personA.pan);
  const panB = normalize(personB.panNumber || personB.pan);
  if (panA && panB && panA !== "-" && panB !== "-") return panA === panB;

  const emailA = normalize(personA.email);
  const emailB = normalize(personB.email);
  if (emailA && emailB && emailA !== "-" && emailB !== "-")
    return emailA === emailB;

  const nameA = normalize(
    personA.name || personA.directorName || personA.shareholderName,
  );
  const nameB = normalize(
    personB.name || personB.directorName || personB.shareholderName,
  );
  if (nameA && nameB && nameA !== "-" && nameB !== "-") return nameA === nameB;

  return false;
}

/** Detect shareholder KYC / DSC tracker steps by 1-based index. */
export function isShareholderKycOrDscStepTitle(
  title: string,
  shareholderNumber: number,
): boolean {
  const n = shareholderNumber;
  const t = String(title || "");
  return (
    t === `Shareholder ${n} - KYC` ||
    t === `Partner ${n} - KYC` ||
    t === `Shareholder ${n} - KYC uploaded` ||
    t === `Partner ${n} - KYC uploaded` ||
    t === `DSC - Shareholder ${n}` ||
    t === `DSC - Partner ${n}` ||
    t.startsWith(`Shareholder ${n} - KYC`) ||
    t.startsWith(`Partner ${n} - KYC`) ||
    t.startsWith(`DSC - Shareholder ${n}`) ||
    t.startsWith(`DSC - Partner ${n}`)
  );
}

/** Detect director KYC / DSC tracker steps by 1-based index. */
export function isDirectorKycOrDscStepTitle(
  title: string,
  directorNumber: number,
): boolean {
  const n = directorNumber;
  const t = String(title || "");
  return (
    t === `Director ${n} - KYC` ||
    t === `Designated Partner ${n} - KYC` ||
    t === `Director ${n} - KYC uploaded` ||
    t === `Designated Partner ${n} - KYC uploaded` ||
    t === `DSC - Director ${n}` ||
    t === `DSC - Designated Partner ${n}` ||
    t.startsWith(`Director ${n} - KYC`) ||
    t.startsWith(`Designated Partner ${n} - KYC`) ||
    t.startsWith(`DSC - Director ${n}`) ||
    t.startsWith(`DSC - Designated Partner ${n}`)
  );
}
