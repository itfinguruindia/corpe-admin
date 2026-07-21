/**
 * Normalize admin notification deep-links to real corpe-admin routes.
 * Older notifications stored broken paths like /documents or /payment.
 */
export function resolveNotificationLink(
  link?: string | null,
  fallback = "/notifications",
): string {
  if (!link || typeof link !== "string") return fallback;

  const path = link.trim();
  if (!path.startsWith("/")) return fallback;

  const rewritten = path
    .replace(
      /^(\/clients\/[^/]+)\/documents(?:\/.*)?$/i,
      "$1/uploaded-documents",
    )
    .replace(
      /^(\/clients\/[^/]+)\/name-application(?:\/.*)?$/i,
      "$1/application",
    )
    .replace(
      /^(\/clients\/[^/]+)\/payment(?:\/.*)?$/i,
      "$1/pricing-and-payment",
    );

  return rewritten || fallback;
}
