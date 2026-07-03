import type { Admin } from "@/types/admin";
import {
  hasPermission as rbacHasPermission,
  hasAnyPermission,
  type RbacUser,
} from "@/lib/rbac/rbac";
import {
  PERMISSIONS,
  ACTIVITY_LOG_VIEW_IDS,
  ACTIVITY_LOG_EXPORT_IDS,
} from "@/lib/rbac/permissions";
import { getRequiredPermissionsForRoute } from "@/lib/rbac/routePermissions";

export { PERMISSIONS } from "@/lib/rbac/permissions";

export function toRbacUser(admin: Admin | null | undefined): RbacUser | null {
  if (!admin) return null;
  return {
    isSuperAdmin: admin.isSuperAdmin,
    permissions: admin.permissions,
  };
}

export function hasPermission(
  admin: Admin | null | undefined,
  permissionIds: string | string[],
  mode: "any" | "all" = "any",
): boolean {
  return rbacHasPermission(toRbacUser(admin), permissionIds, mode);
}

export function canViewActivityLogs(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, [...ACTIVITY_LOG_VIEW_IDS]);
}

export function canExportActivityLogs(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, [...ACTIVITY_LOG_EXPORT_IDS]);
}

export function canAccessRoute(
  admin: Admin | null | undefined,
  pathname: string,
): boolean {
  const rule = getRequiredPermissionsForRoute(pathname);
  if (!rule) return true;
  return hasPermission(admin, rule.permissions, rule.mode);
}

export function canViewUsers(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.USER_VIEW);
}

export function canCreateUsers(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.USER_CREATE);
}

export function canEditUsers(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.USER_EDIT);
}

export function canAssignClients(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.CLIENT_ASSIGN);
}

export function canViewRoles(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.ROLE_VIEW);
}

export function canCreateRoles(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.ROLE_CREATE);
}

export function canEditRoles(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.ROLE_EDIT);
}

export function canDeleteRoles(admin: Admin | null | undefined): boolean {
  return hasPermission(admin, PERMISSIONS.ROLE_DELETE);
}

export { hasAnyPermission };
