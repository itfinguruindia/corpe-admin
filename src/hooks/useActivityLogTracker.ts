"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { activityLogsApi } from "@/lib/api/activityLogs";
import { getIsLoggingOut } from "@/utils/auth";

const PATH_MODULE_MAP: Array<{ pattern: RegExp; module: string; label: string }> =
  [
    { pattern: /^\/dashboard/, module: "Dashboard", label: "Dashboard" },
    { pattern: /^\/clients/, module: "Clients", label: "Clients" },
    { pattern: /^\/feedbacks/, module: "Feedbacks", label: "Feedbacks" },
    { pattern: /^\/marketing/, module: "Marketing", label: "Marketing" },
    { pattern: /^\/documents/, module: "Documents", label: "Documents" },
    { pattern: /^\/communication/, module: "Communication", label: "Communication" },
    { pattern: /^\/tickets/, module: "Tickets", label: "Raised Tickets" },
    { pattern: /^\/notifications/, module: "Notifications", label: "Notifications" },
    {
      pattern: /^\/settings\/activity-logs/,
      module: "Audit Logs",
      label: "System Activity Logs",
    },
    { pattern: /^\/settings\/users/, module: "User Management", label: "Admin Users" },
    { pattern: /^\/settings\/roles/, module: "Roles & Permissions", label: "Roles" },
    { pattern: /^\/settings/, module: "Settings", label: "Settings" },
  ];

function resolvePage(pathname: string): { module: string; label: string } {
  for (const entry of PATH_MODULE_MAP) {
    if (entry.pattern.test(pathname)) {
      return { module: entry.module, label: entry.label };
    }
  }
  const segment = pathname.split("/").filter(Boolean)[0] || "Admin";
  const label = segment.charAt(0).toUpperCase() + segment.slice(1);
  return { module: label, label: `Viewed ${label}` };
}

/**
 * Records admin panel page views in the activity log (debounced).
 */
export function useActivityLogTracker(): void {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!pathname || getIsLoggingOut()) return;
    if (pathname === lastPath.current) return;

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      if (getIsLoggingOut()) return;
      if (!localStorage.getItem("accessToken")) return;

      const { module, label } = resolvePage(pathname);
      lastPath.current = pathname;

      activityLogsApi
        .trackPageView({
          module,
          description: `Viewed ${label} page`,
          metadata: { path: pathname },
        })
        .catch(() => {});
    }, 600);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);
}
