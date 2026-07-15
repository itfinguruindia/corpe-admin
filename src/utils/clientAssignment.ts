import type { Admin } from "@/types/admin";
import { hasFullAdminAccess } from "@/utils/elevatedAdmin";

export interface ClientAssignmentInfo {
  assigneeId: string | null;
  assignerId: string | null;
}

export function normalizeAssignmentId(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    const id = (value as { _id?: unknown })._id;
    return id != null ? String(id) : null;
  }
  return String(value);
}

export function parseClientAssignmentFromOrg(
  org: Record<string, unknown> | null | undefined,
): ClientAssignmentInfo {
  return {
    assigneeId: normalizeAssignmentId(org?.assignee),
    assignerId: normalizeAssignmentId(org?.assigner),
  };
}

export function isAdminAssignedToClient(
  admin: Admin | null | undefined,
  assignment: ClientAssignmentInfo | null | undefined,
): boolean {
  if (!admin?.id || !assignment) return false;
  const id = admin.id.toString();
  return id === assignment.assigneeId || id === assignment.assignerId;
}

/** Full-admin roles, or assignee/assigner — required for edit/delete on client data. */
export function canMutateClientData(
  admin: Admin | null | undefined,
  assignment: ClientAssignmentInfo | null | undefined,
): boolean {
  if (!admin) return false;
  if (hasFullAdminAccess(admin)) return true;
  return isAdminAssignedToClient(admin, assignment);
}

/** Full-admin roles, or client-assign permission. */
export function canUpdateClientAssignment(
  admin: Admin | null | undefined,
  _assignment?: ClientAssignmentInfo | null | undefined,
  hasClientAssign = false,
): boolean {
  if (!admin) return false;
  if (hasFullAdminAccess(admin)) return true;
  return hasClientAssign;
}
