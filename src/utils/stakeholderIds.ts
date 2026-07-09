type StakeholderRecord = {
  directorId?: unknown;
  shareholderId?: unknown;
  _id?: unknown;
};

/** Prefer directorId/shareholderId, then Mongo _id, for route and API calls. */
export function toStakeholderId(
  record: StakeholderRecord | null | undefined,
  fallback?: string | number,
): string {
  const raw =
    record?.directorId ?? record?.shareholderId ?? record?._id ?? fallback;

  if (raw === null || raw === undefined || raw === "") {
    return fallback !== undefined ? String(fallback) : "";
  }

  return String(raw);
}

export function matchesStakeholderId(
  record: StakeholderRecord | null | undefined,
  routeId: string | undefined,
  fallbackIndex?: number,
): boolean {
  if (!routeId || !record) return false;

  const normalizedRouteId = String(routeId);
  const candidates = [
    record.directorId,
    record.shareholderId,
    record._id,
  ].filter((value) => value !== null && value !== undefined && value !== "");

  if (candidates.some((value) => String(value) === normalizedRouteId)) {
    return true;
  }

  // Allow numeric/index route ids used as last-resort fallbacks
  if (
    fallbackIndex !== undefined &&
    String(fallbackIndex) === normalizedRouteId
  ) {
    return true;
  }

  return false;
}
