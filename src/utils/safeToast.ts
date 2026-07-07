import { toast } from "@heroui/react";
import { isSkippedTransitionError } from "@/utils/navigation";

const NAV_QUIET_MS = 450;
let navigationQuietUntil = 0;

/** Mark that a route change is in flight; defer toasts until it settles. */
export function markNavigationActivity() {
  navigationQuietUntil = Date.now() + NAV_QUIET_MS;
}

function runWhenSafe(run: () => void) {
  const delay = Math.max(50, navigationQuietUntil - Date.now());
  window.setTimeout(() => {
    try {
      run();
    } catch (error) {
      if (!isSkippedTransitionError(error)) {
        console.error(error);
      }
    }
  }, delay);
}

/** Show a HeroUI toast after navigation/view-transition activity settles. */
export function deferSafeToast(run: () => void) {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => runWhenSafe(run));
}

type ToastOptions = Parameters<typeof toast>[1];

export const safeToast = {
  success: (message: string, options?: ToastOptions) =>
    deferSafeToast(() => toast.success(message, options)),
  danger: (message: string, options?: ToastOptions) =>
    deferSafeToast(() => toast.danger(message, options)),
  warning: (message: string, options?: ToastOptions) =>
    deferSafeToast(() => toast.warning(message, options)),
  info: (message: string, options?: ToastOptions) =>
    deferSafeToast(() => toast.info(message, options)),
  default: (message: string, options?: ToastOptions) =>
    deferSafeToast(() => toast(message, options)),
};
