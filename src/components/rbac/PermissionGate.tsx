"use client";

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGateProps {
  permissions: string | string[];
  mode?: "any" | "all";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders children only when the current admin has the required permission(s).
 */
export default function PermissionGate({
  permissions,
  mode = "any",
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permissions, mode)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
