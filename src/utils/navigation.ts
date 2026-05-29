/**
 * Full-page redirect after auth state changes (cookies set).
 * Avoids "AbortError: Transition was skipped" from racing client
 * router transitions with middleware redirects in proxy.ts.
 */
export function redirectAfterAuth(href: string) {
  if (typeof window !== "undefined") {
    window.location.replace(href);
  }
}
