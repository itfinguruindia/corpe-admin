"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { clientsApi } from "@/lib/api/clients";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";
import {
  canMutateClientData,
  canUpdateClientAssignment,
  parseClientAssignmentFromOrg,
  type ClientAssignmentInfo,
} from "@/utils/clientAssignment";

interface ClientAssignmentContextValue {
  appNo: string;
  assignment: ClientAssignmentInfo;
  isLoading: boolean;
  canMutate: boolean;
  canUpdateAssignment: boolean;
  refresh: () => Promise<void>;
}

const ClientAssignmentContext =
  createContext<ClientAssignmentContextValue | null>(null);

export function ClientAssignmentProvider({
  appNo,
  children,
}: {
  appNo: string;
  children: React.ReactNode;
}) {
  const { admin, hasPermission, isSuperAdmin } = usePermissions();
  const [assignment, setAssignment] = useState<ClientAssignmentInfo>({
    assigneeId: null,
    assignerId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadAssignment = useCallback(async () => {
    if (!appNo) return;
    try {
      setIsLoading(true);
      const response = await clientsApi.getCompanyOverview(appNo);
      const org = response?.data ?? response;
      setAssignment(parseClientAssignmentFromOrg(org as Record<string, unknown>));
    } catch {
      setAssignment({ assigneeId: null, assignerId: null });
    } finally {
      setIsLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  const hasClientAssign = hasPermission(PERMISSIONS.CLIENT_ASSIGN);

  const value = useMemo<ClientAssignmentContextValue>(
    () => ({
      appNo,
      assignment,
      isLoading,
      canMutate: canMutateClientData(admin, assignment),
      canUpdateAssignment: canUpdateClientAssignment(
        admin,
        assignment,
        hasClientAssign || isSuperAdmin,
      ),
      refresh: loadAssignment,
    }),
    [
      appNo,
      assignment,
      isLoading,
      admin,
      hasClientAssign,
      isSuperAdmin,
      loadAssignment,
    ],
  );

  return (
    <ClientAssignmentContext.Provider value={value}>
      {children}
    </ClientAssignmentContext.Provider>
  );
}

export function useClientAssignmentContext(): ClientAssignmentContextValue | null {
  return useContext(ClientAssignmentContext);
}

export function useClientAssignment(): ClientAssignmentContextValue {
  const ctx = useContext(ClientAssignmentContext);
  if (!ctx) {
    return {
      appNo: "",
      assignment: { assigneeId: null, assignerId: null },
      isLoading: false,
      canMutate: false,
      canUpdateAssignment: false,
      refresh: async () => {},
    };
  }
  return ctx;
}
