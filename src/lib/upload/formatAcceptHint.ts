/** Human-readable hint from an HTML accept string, e.g. ".pdf,.docx" → "PDF, DOCX" */
export function formatAcceptHint(
  accept?: string,
  maxSizeBytes?: number,
): string | undefined {
  if (!accept) return undefined;

  const labels = accept
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed.startsWith(".")) {
        return trimmed.slice(1).toUpperCase();
      }
      if (trimmed.includes("/")) {
        const subtype = trimmed.split("/")[1];
        return subtype?.toUpperCase() ?? trimmed;
      }
      return trimmed.toUpperCase();
    })
    .filter(Boolean);

  if (labels.length === 0) return undefined;

  let hint = labels.join(", ");
  if (maxSizeBytes) {
    const maxMb = maxSizeBytes / (1024 * 1024);
    hint += ` — max ${maxMb} MB`;
  }

  return hint;
}
