/**
 * Display helper: company / business names always render in CAPITAL LETTERS.
 * Use at every UI surface that shows a company name (tracking, overview, lists).
 * Does not mutate stored/API values — format only at render time.
 */
export function formatCompanyNameDisplay(
  name: string | null | undefined,
  fallback = "-",
): string {
  if (name == null) return fallback;
  const trimmed = String(name).trim();
  if (!trimmed) return fallback;
  return trimmed.toUpperCase();
}
