import type { Admin } from "@/types/admin";
import { hasPermission, PERMISSIONS } from "@/utils/permissions";
import { toast } from "@heroui/react";

export function canViewDocuments(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.DOC_VIEW);
}

export function canCreateDocuments(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.DOC_CREATE);
}

export function canDeleteDocuments(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.DOC_DELETE);
}

function showDenied(actionLabel: string): void {
  toast.danger(
    `You don't have permission to ${actionLabel}. Please contact your administrator.`,
  );
}

export function requireDocView(
  admin: Admin | null | undefined,
  actionLabel = "view document templates",
): boolean {
  if (canViewDocuments(admin)) return true;
  showDenied(actionLabel);
  return false;
}

export function requireDocCreate(
  admin: Admin | null | undefined,
  actionLabel = "import document templates",
): boolean {
  if (canCreateDocuments(admin)) return true;
  showDenied(actionLabel);
  return false;
}

export function requireDocDelete(
  admin: Admin | null | undefined,
  actionLabel = "delete document templates",
): boolean {
  if (canDeleteDocuments(admin)) return true;
  showDenied(actionLabel);
  return false;
}
