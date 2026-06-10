type ClientRouter = {
  push: (href: string, options?: object) => void | Promise<unknown>;
  replace: (href: string, options?: object) => void | Promise<unknown>;
};

/**
 * Benign Next.js App Router abort when a newer navigation supersedes the current one.
 */
export function isSkippedTransitionError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof Error) {
    return (
      error.name === "AbortError" ||
      error.message.includes("Transition was skipped") ||
      error.message.includes("Cancel rendering route")
    );
  }
  return String(error).includes("Transition was skipped");
}

function swallowSkippedTransition(promise: void | Promise<unknown>) {
  if (promise && typeof (promise as Promise<unknown>).then === "function") {
    void (promise as Promise<unknown>).catch((error) => {
      if (!isSkippedTransitionError(error)) {
        console.error(error);
      }
    });
  }
}

/**
 * Client router navigation that ignores superseded transition aborts.
 */
export function safeRouterPush(
  router: Pick<ClientRouter, "push">,
  href: string,
  options?: object,
) {
  swallowSkippedTransition(router.push(href, options));
}

export function safeRouterReplace(
  router: Pick<ClientRouter, "replace">,
  href: string,
  options?: object,
) {
  swallowSkippedTransition(router.replace(href, options));
}

/**
 * Full-page redirect after auth state changes (cookies set).
 * Avoids "AbortError: Transition was skipped" from racing client
 * router transitions with proxy redirects in proxy.ts.
 */
export function redirectAfterAuth(href: string) {
  if (typeof window !== "undefined") {
    window.location.replace(href);
  }
}
