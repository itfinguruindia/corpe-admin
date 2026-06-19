"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import type { Admin } from "@/types/admin";
import {
  hasPermission,
  canAccessRoute,
  canViewUsers,
  canCreateUsers,
  canEditUsers,
  canAssignClients,
  canViewRoles,
  canCreateRoles,
  canEditRoles,
  canDeleteRoles,
  canViewActivityLogs,
  canExportActivityLogs,
} from "@/utils/permissions";

export function useAdmin(): Admin | null {
  return useSelector((state: RootState) => state.auth.admin);
}

export function usePermissions() {
  const admin = useAdmin();

  return useMemo(
    () => ({
      admin,
      hasPermission: (ids: string | string[], mode?: "any" | "all") =>
        hasPermission(admin, ids, mode),
      canAccessRoute: (pathname: string) => canAccessRoute(admin, pathname),
      canViewUsers: () => canViewUsers(admin),
      canCreateUsers: () => canCreateUsers(admin),
      canEditUsers: () => canEditUsers(admin),
      canAssignClients: () => canAssignClients(admin),
      canViewRoles: () => canViewRoles(admin),
      canCreateRoles: () => canCreateRoles(admin),
      canEditRoles: () => canEditRoles(admin),
      canDeleteRoles: () => canDeleteRoles(admin),
      canViewActivityLogs: () => canViewActivityLogs(admin),
      canExportActivityLogs: () => canExportActivityLogs(admin),
      isSuperAdmin: Boolean(admin?.isSuperAdmin),
    }),
    [admin],
  );
}
