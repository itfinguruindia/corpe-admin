import { safeToast } from "@/utils/safeToast";
import {
  RBAC_ROUTE_DENIED_STORAGE_KEY,
  ROUTE_ACCESS_DENIED_MESSAGE,
} from "@/lib/rbac/routePermissions";

/** Toast for in-page actions (no navigation). */
export function showRouteAccessDeniedToast(message = ROUTE_ACCESS_DENIED_MESSAGE): void {
  safeToast.danger(message);
}

/** Persist denial so the toast can show after redirect completes. */
export function markRouteAccessDeniedForToast(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RBAC_ROUTE_DENIED_STORAGE_KEY, "1");
}

/** Call after navigation when a route was denied. */
export function consumeRouteAccessDeniedToast(): void {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(RBAC_ROUTE_DENIED_STORAGE_KEY) !== "1") return;
  sessionStorage.removeItem(RBAC_ROUTE_DENIED_STORAGE_KEY);
  showRouteAccessDeniedToast();
}
