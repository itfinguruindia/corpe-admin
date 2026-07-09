import type { Admin } from "@/types/admin";
import { showRouteAccessDeniedToast } from "@/lib/rbac/routeAccessDenied";
import { PERMISSIONS, hasPermission } from "@/utils/permissions";

export const PRICING_VIEW_DENIED_MESSAGE =
  "You do not have permission to view pricing plans.";

export const PRICING_EDIT_DENIED_MESSAGE =
  "You don't have permission to edit pricing plans. Please contact your administrator.";

export const PRICING_EXPORT_DENIED_MESSAGE =
  "You don't have permission to export pricing plans. Please contact your administrator.";

export function canViewPricingPlans(admin: Admin | null | undefined): boolean {
  if (!admin) return false;
  if (admin.isSuperAdmin) return true;
  return hasPermission(
    admin,
    [
      PERMISSIONS.PRICING_VIEW,
      PERMISSIONS.PRICING_EDIT,
      PERMISSIONS.PRICING_EXPORT,
    ],
    "any",
  );
}

export function canEditPricingPlans(admin: Admin | null | undefined): boolean {
  if (!admin) return false;
  if (admin.isSuperAdmin) return true;
  return hasPermission(admin, PERMISSIONS.PRICING_EDIT);
}

export function canExportPricingPlans(admin: Admin | null | undefined): boolean {
  if (!admin) return false;
  if (admin.isSuperAdmin) return true;
  return hasPermission(admin, PERMISSIONS.PRICING_EXPORT);
}

export function requirePricingEdit(
  admin: Admin | null | undefined,
): boolean {
  if (canEditPricingPlans(admin)) return true;
  showRouteAccessDeniedToast(PRICING_EDIT_DENIED_MESSAGE);
  return false;
}

export function requirePricingExport(
  admin: Admin | null | undefined,
): boolean {
  if (canExportPricingPlans(admin)) return true;
  showRouteAccessDeniedToast(PRICING_EXPORT_DENIED_MESSAGE);
  return false;
}
