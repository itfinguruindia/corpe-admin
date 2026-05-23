import type { Admin } from "@/types/admin";

const VIEW_ACTIVITY_LOGS = ["activity-logs.view", "audit-view"];
const EXPORT_ACTIVITY_LOGS = ["activity-logs.export", "audit-export"];

export function hasPermission(
  admin: Admin | null | undefined,
  permissionIds: string[],
): boolean {
  if (!admin) return false;
  if (admin.isSuperAdmin) return true;
  const perms = admin.permissions ?? [];
  if (perms.includes("*")) return true;
  return permissionIds.some((id) => perms.includes(id));
}

export function canViewActivityLogs(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, VIEW_ACTIVITY_LOGS);
}

export function canExportActivityLogs(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, EXPORT_ACTIVITY_LOGS);
}
