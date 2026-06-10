type ClientRouter = {
  push: (href: string, options?: object) => void | Promise<unknown>;
  replace: (href: string, options?: object) => void | Promise<unknown>;
  refresh: () => void | Promise<unknown>;
  back: () => void;
};

/**
 * Benign Next.js App Router abort when a newer navigation supersedes the current one,
 * or when a concurrent re-render (e.g. live toast/notification) invalidates transition state.
 */
export function isSkippedTransitionError(error: unknown): boolean {
  if (!error) return false;

  const name =
    error instanceof Error
      ? error.name
      : typeof error === "object" && error && "name" in error
        ? String((error as { name?: string }).name)
        : "";

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: string }).message)
        : String(error);

  return (
    name === "AbortError" ||
    name === "InvalidStateError" ||
    message.includes("Transition was skipped") ||
    message.includes("Transition was aborted because of invalid state") ||
    message.includes("Cancel rendering route")
  );
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

export function safeRouterRefresh(router: Pick<ClientRouter, "refresh">) {
  swallowSkippedTransition(router.refresh());
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
