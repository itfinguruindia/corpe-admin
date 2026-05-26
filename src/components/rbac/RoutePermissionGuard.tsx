"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { Button } from "@heroui/react";
import { usePermissions } from "@/hooks/usePermissions";
import { getRequiredPermissionsForRoute } from "@/lib/rbac/routePermissions";

interface RoutePermissionGuardProps {
  children: React.ReactNode;
}

/**
 * Blocks rendering of protected pages when the admin lacks route permissions.
 * Authentication is handled separately by proxy.ts (cookie).
 */
export default function RoutePermissionGuard({
  children,
}: RoutePermissionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, canAccessRoute, isSuperAdmin } = usePermissions();

  const rule = getRequiredPermissionsForRoute(pathname);
  const allowed = canAccessRoute(pathname);

  useEffect(() => {
    if (admin && rule && !allowed) {
      console.warn(
        `[RBAC] Access denied to ${pathname}. Required:`,
        rule.permissions,
      );
    }
  }, [admin, allowed, pathname, rule]);

  if (!rule) {
    return <>{children}</>;
  }

  if (!admin) {
    const hasToken =
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem("accessToken"));
    if (hasToken) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center">
          <p className="text-gray-500">Loading session…</p>
        </div>
      );
    }
    return null;
  }

  if (allowed || isSuperAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
      <ShieldOff className="size-12 text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold text-secondary mb-2">Access denied</h1>
      <p className="text-gray-600 max-w-md">
        You do not have permission to view this page. Contact your administrator
        to request access.
      </p>
      {rule.permissions.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 font-mono">
          Required: {rule.permissions.join(" or ")}
        </p>
      )}
      <Button
        className="mt-6 bg-[#FF6A3D] text-white"
        onPress={() => router.push("/dashboard")}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
