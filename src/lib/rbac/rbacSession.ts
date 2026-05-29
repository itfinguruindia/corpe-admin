import type { Admin } from "@/types/admin";

/**
 * True when admin permissions are safe to evaluate (avoids false denials while
 * AuthSessionSync hydrates permissions from localStorage).
 */
export function isRbacSessionReady(admin: Admin | null | undefined): boolean {
  if (!admin?.id) return false;
  if (admin.isSuperAdmin) return true;

  const perms = admin.permissions;
  if (Array.isArray(perms) && perms.length > 0) return true;

  if (typeof window === "undefined") return true;

  try {
    const raw = localStorage.getItem("adminInfo");
    if (!raw) return true;
    const parsed = JSON.parse(raw) as Admin;
    const cached = parsed?.permissions;
    return !Array.isArray(cached) || cached.length === 0;
  } catch {
    return true;
  }
}
