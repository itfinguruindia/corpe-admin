import type { Admin } from "@/types/admin";
import { PERMISSIONS } from "@/utils/permissions";
import { hasPermission } from "@/utils/permissions";
import {
  canMutateClientData,
  type ClientAssignmentInfo,
} from "@/utils/clientAssignment";
import { showRouteAccessDeniedToast } from "@/lib/rbac/routeAccessDenied";

export type ClientPermissionTab =
  | "company"
  | "director"
  | "shareholder"
  | "moa"
  | "app"
  | "track"
  | "upload"
  | "regDoc"
  | "pricing"
  | "comments"
  | "client";

/** Edit/create permissions per client tab (client-edit also grants all tab edits). */
const TAB_MUTATION_PERMISSIONS: Record<ClientPermissionTab, string[]> = {
  company: [PERMISSIONS.COMPANY_EDIT],
  director: [PERMISSIONS.DIRECTOR_EDIT, PERMISSIONS.DIRECTOR_CREATE],
  shareholder: [
    PERMISSIONS.SHAREHOLDER_EDIT,
    PERMISSIONS.SHAREHOLDER_CREATE,
  ],
  moa: [PERMISSIONS.MOA_EDIT, PERMISSIONS.MOA_CREATE],
  app: [PERMISSIONS.APP_EDIT, PERMISSIONS.APP_CREATE],
  track: [PERMISSIONS.TRACK_EDIT],
  upload: [PERMISSIONS.UPLOAD_CREATE],
  regDoc: [PERMISSIONS.REG_DOC_EDIT, PERMISSIONS.REG_DOC_CREATE],
  pricing: [PERMISSIONS.PRICING_EDIT],
  comments: [PERMISSIONS.MSG_CREATE, PERMISSIONS.MSG_DELETE],
  client: [PERMISSIONS.CLIENT_EDIT],
};

export function canPerformClientTabEdit(
  admin: Admin | null | undefined,
  tab: ClientPermissionTab,
  assignment?: ClientAssignmentInfo | null,
): boolean {
  if (!admin) return false;
  if (admin.isSuperAdmin) return true;

  const tabPerms = TAB_MUTATION_PERMISSIONS[tab];
  const hasRbac = hasPermission(
    admin,
    [...tabPerms, PERMISSIONS.CLIENT_EDIT],
    "any",
  );
  if (!hasRbac) return false;

  if (assignment === undefined) return true;
  return canMutateClientData(admin, assignment);
}

/**
 * Call before edit/upload actions on a client tab.
 * Shows a toast when the user lacks permission or is not assigned.
 */
export function requireClientTabEdit(
  admin: Admin | null | undefined,
  tab: ClientPermissionTab,
  assignment?: ClientAssignmentInfo | null,
): boolean {
  if (!admin) {
    showRouteAccessDeniedToast();
    return false;
  }

  if (admin.isSuperAdmin) return true;

  const tabPerms = TAB_MUTATION_PERMISSIONS[tab];
  if (!hasPermission(admin, [...tabPerms, PERMISSIONS.CLIENT_EDIT], "any")) {
    showRouteAccessDeniedToast();
    return false;
  }

  if (assignment !== undefined && !canMutateClientData(admin, assignment)) {
    showRouteAccessDeniedToast(
      "Only assigned team members can modify this client. You have view-only access.",
    );
    return false;
  }

  return true;
}

/** @deprecated Use requireClientTabEdit(admin, tab, assignment) */
export function canEditClient(admin: Admin | null | undefined): boolean {
  return canPerformClientTabEdit(admin, "client");
}

/** @deprecated Use requireClientTabEdit(admin, tab, assignment) */
export function requireClientEdit(
  admin: Admin | null | undefined,
  _actionLabel?: string,
  tab: ClientPermissionTab = "client",
): boolean {
  return requireClientTabEdit(admin, tab);
}

export function canDeleteClient(
  admin: Admin | null | undefined,
  assignment?: ClientAssignmentInfo | null,
): boolean {
  if (!admin) return false;
  if (!hasPermission(admin, PERMISSIONS.CLIENT_DELETE)) return false;
  if (assignment === undefined) return true;
  return canMutateClientData(admin, assignment);
}

export function requireClientDelete(
  admin: Admin | null | undefined,
  assignment?: ClientAssignmentInfo | null,
): boolean {
  if (!admin) {
    showRouteAccessDeniedToast();
    return false;
  }
  if (admin.isSuperAdmin) return true;
  if (!hasPermission(admin, PERMISSIONS.CLIENT_DELETE)) {
    showRouteAccessDeniedToast();
    return false;
  }
  if (assignment !== undefined && !canMutateClientData(admin, assignment)) {
    showRouteAccessDeniedToast(
      "Only assigned team members can delete this client.",
    );
    return false;
  }
  return true;
}
