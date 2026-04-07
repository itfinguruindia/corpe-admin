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
