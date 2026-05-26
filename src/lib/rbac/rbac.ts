import { PERMISSIONS, type PermissionId } from "./permissions";

export interface RbacUser {
  isSuperAdmin?: boolean;
  permissions?: string[];
}

export type PermissionCheckMode = "any" | "all";

/**
 * Returns true if the user holds the wildcard, is super admin, or has at least one allowed permission.
 */
export function hasPermission(
  user: RbacUser | null | undefined,
  permissionIds: string | string[],
  mode: PermissionCheckMode = "any",
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;

  const required = Array.isArray(permissionIds) ? permissionIds : [permissionIds];
  const held = user.permissions ?? [];

  if (held.includes(PERMISSIONS.ALL)) return true;

  if (mode === "all") {
    return required.every((id) => held.includes(id));
  }
  return required.some((id) => held.includes(id));
}

export function hasAnyPermission(
  user: RbacUser | null | undefined,
  permissionIds: string[],
): boolean {
  return hasPermission(user, permissionIds, "any");
}

export function hasAllPermissions(
  user: RbacUser | null | undefined,
  permissionIds: string[],
): boolean {
  return hasPermission(user, permissionIds, "all");
}

/** Validates that every id is a known permission (optional server-side hardening). */
export function isKnownPermission(id: string, known: readonly string[] = []): boolean {
  if (known.length === 0) return true;
  return known.includes(id);
}

export function filterValidPermissionIds(
  ids: string[],
  known: readonly PermissionId[],
): string[] {
  const set = new Set(known);
  return ids.filter((id) => set.has(id as PermissionId));
}
