import type { Admin } from "@/types/admin";
import { PERMISSIONS } from "@/utils/permissions";
import { hasPermission } from "@/utils/permissions";
import { toast } from "@heroui/react";
import { PERMISSION_DENIED_MESSAGE } from "@/utils/apiErrors";

/** Client mutations (upload, edit status, delete) require client-edit on the API. */
export function canEditClient(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.CLIENT_EDIT);
}

export function canDeleteClient(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.CLIENT_DELETE);
}

/**
 * Call before opening a file picker or running a mutation.
 * Shows a clear message when the user lacks permission.
 */
export function requireClientEdit(
  admin: Admin | null | undefined,
  actionLabel: string,
): boolean {
  if (canEditClient(admin)) return true;
  toast.danger(
    `You don't have permission to ${actionLabel}. Please contact your administrator.`,
  );
  return false;
}

export { PERMISSION_DENIED_MESSAGE };
