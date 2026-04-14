import { Filters } from "./types";

// Helper functions for FilterDropdown

// No toggle/countActive for user objects

export const parseList = (value: string | null) =>
  value ? value.split(",") : [];

export const toQueryValue = (obj: Record<string, boolean>) =>
  Object.keys(obj)
    .filter((key) => obj[key])
    .join(",");

export const fromQueryValue = <T extends Record<string, boolean>>(
  base: T,
  value: string | null,
): T => {
  const active = parseList(value);
  return Object.fromEntries(
    Object.keys(base).map((key) => [key, active.includes(key)]),
  ) as T;
};

export const toggle = <T extends Record<string, boolean>, K extends keyof T>(
  setter: React.Dispatch<React.SetStateAction<T>>,
  key: K,
) => {
  setter((prev) => ({ ...prev, [key]: !prev[key] }));
};

export const countActive = (obj: Record<string, boolean>) =>
  Object.values(obj).filter(Boolean).length;

export const filtersToSearchParams = (filters: Filters): URLSearchParams => {
  const params = new URLSearchParams();
  const s = toQueryValue(filters.status);
  const e = toQueryValue(filters.entityType);
  const d = toQueryValue(filters.dateRange);

  if (filters.assignee?.selected?.length > 0)
    params.set("assignee", filters.assignee.selected.map((u) => u.id).join(","));
  if (filters.assigner?.selected?.length > 0)
    params.set("assigner", filters.assigner.selected.map((u) => u.id).join(","));
  if (s) params.set("status", s);
  if (e) params.set("entity", e);
  if (d) params.set("date", d);
  if (filters.search) params.set("search", filters.search);

  return params;
};
