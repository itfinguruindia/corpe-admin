"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { safeRouterReplace } from "@/utils/navigation";
import {
  getRedirectForDeniedRoute,
  getRequiredPermissionsForRoute,
} from "@/lib/rbac/routePermissions";
import { isRbacSessionReady } from "@/lib/rbac/rbacSession";
import {
  consumeRouteAccessDeniedToast,
  markRouteAccessDeniedForToast,
} from "@/lib/rbac/routeAccessDenied";

interface RoutePermissionGuardProps {
  children: React.ReactNode;
}

/**
 * Blocks rendering of protected pages when the admin lacks route permissions.
 * Authentication is handled separately by src/proxy.ts (cookie).
 * Edit/upload denial toasts are shown on the page via requireClientTabEdit().
 */
export default function RoutePermissionGuard({
  children,
}: RoutePermissionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, canAccessRoute, isSuperAdmin, hasPermission } =
    usePermissions();

  const rule = getRequiredPermissionsForRoute(pathname);
  const sessionReady = isRbacSessionReady(admin);
  const allowed = canAccessRoute(pathname);
  const isDenied =
    sessionReady &&
    Boolean(admin) &&
    Boolean(rule) &&
    !allowed &&
    !isSuperAdmin;
  const redirectingRef = useRef(false);

  useEffect(() => {
    consumeRouteAccessDeniedToast();
  }, [pathname]);

  useEffect(() => {
    if (!isDenied) {
      redirectingRef.current = false;
      return;
    }

    const redirectTo = getRedirectForDeniedRoute(
      pathname,
      (perms) => hasPermission(perms, "any"),
      isSuperAdmin,
    );

    const normalizedPath = pathname.replace(/\/$/, "") || "/";
    const normalizedRedirect = redirectTo.replace(/\/$/, "") || "/";
    if (normalizedRedirect === normalizedPath || redirectingRef.current) {
      return;
    }

    redirectingRef.current = true;
    markRouteAccessDeniedForToast();

    console.warn(
      `[RBAC] Access denied to ${pathname}. Required:`,
      rule?.permissions,
    );

    safeRouterReplace(router, redirectTo);
  }, [isDenied, pathname, rule, router, hasPermission, isSuperAdmin]);

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

  if (!sessionReady) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-gray-500">Loading session…</p>
      </div>
    );
  }

  if (allowed || isSuperAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <p className="text-gray-500">Redirecting…</p>
    </div>
  );
}
