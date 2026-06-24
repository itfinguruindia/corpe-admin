"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { useClientAssignment } from "@/contexts/ClientAssignmentContext";
import {
  requireClientTabEdit,
  canPerformClientTabEdit,
  type ClientPermissionTab,
} from "@/utils/clientPermissions";

/** Client tab edit check with RBAC + assignment from context. */
export function useClientTabEdit(tab: ClientPermissionTab) {
  const { admin } = usePermissions();
  const { assignment } = useClientAssignment();

  return {
    canEdit: canPerformClientTabEdit(admin, tab, assignment),
    requireEdit: () => requireClientTabEdit(admin, tab, assignment),
    assignment,
  };
}
