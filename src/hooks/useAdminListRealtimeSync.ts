"use client";

import { useEffect, useMemo, useRef } from "react";
import { connectSocket } from "@/lib/socket";

export interface AdminListRefreshPayload {
  resource: string;
  type?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Soft-refresh an admin list page when `admin:list-refresh` fires for a
 * matching resource (clients, tickets, feedbacks, crm-leads, …).
 */
export function useAdminListRealtimeSync({
  resource,
  onRefresh,
  enabled = true,
}: {
  resource: string | string[];
  onRefresh: () => void;
  enabled?: boolean;
}): void {
  const onRefreshRef = useRef(onRefresh);
  const resourceKey = useMemo(
    () =>
      (Array.isArray(resource) ? resource : [resource])
        .map((r) => String(r || "").trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join(","),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Array.isArray(resource) ? resource.join(",") : resource],
  );

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled || !resourceKey) return;

    const socket = connectSocket();
    if (!socket) return;

    const resources = new Set(resourceKey.split(","));

    let timer: ReturnType<typeof setTimeout> | null = null;

    const onListRefresh = (payload: AdminListRefreshPayload) => {
      const incoming = String(payload?.resource || "")
        .trim()
        .toLowerCase();
      if (!incoming || !resources.has(incoming)) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => onRefreshRef.current(), 250);
    };

    socket.on("admin:list-refresh", onListRefresh);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        onRefreshRef.current();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timer) clearTimeout(timer);
      socket.off("admin:list-refresh", onListRefresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, resourceKey]);
}
