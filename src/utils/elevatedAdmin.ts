import type { Admin } from "@/types/admin";
import type { Role } from "@/types/roles";
import { PERMISSIONS, ALL_PERMISSION_IDS } from "@/lib/rbac/permissions";

/** Seeded system role named "Admin". */
export function isSystemAdminRole(
  role: Pick<Role, "name" | "isSystemRole"> | null | undefined,
): boolean {
  if (!role || role.isSystemRole !== true) return false;
  return String(role.name || "")
    .trim()
    .toLowerCase() === "admin";
}

function heldPermissions(admin: Admin | null | undefined): string[] {
  return Array.isArray(admin?.permissions) ? admin!.permissions : [];
}

/** Role has every defined permission (or the * wildcard). */
export function hasAllDefinedPermissions(
  admin: Admin | null | undefined,
): boolean {
  const held = heldPermissions(admin);
  if (held.includes(PERMISSIONS.ALL)) return true;
  if (held.length === 0) return false;
  const set = new Set(held);
  return ALL_PERMISSION_IDS.every((id) => set.has(id));
}

/**
 * Super Admin, system Admin, or a role with full/admin-grade access.
 * These users can edit any client without being assignee/assigner.
 *
 * Admin-grade heuristic: client-edit + user-edit (Manager has client-edit only).
 */
export function hasFullAdminAccess(admin: Admin | null | undefined): boolean {
  if (!admin) return false;
  if (admin.isSuperAdmin) return true;
  if (isSystemAdminRole(admin.role)) return true;
  if (hasAllDefinedPermissions(admin)) return true;

  const held = new Set(heldPermissions(admin));
  if (
    held.has(PERMISSIONS.CLIENT_EDIT) &&
    held.has(PERMISSIONS.USER_EDIT)
  ) {
    return true;
  }

  return false;
}
