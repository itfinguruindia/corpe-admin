"use client";

import { useEffect, useRef } from "react";
import { connectSocket } from "@/lib/socket";

export interface TrackerUpdatedPayload {
  orgId: string;
  reason?: string;
  timestamp: number;
}

/**
 * Live tracker sync for admin Tracking Status tab.
 * Joins the org room and refetches when `tracker:updated` fires.
 */
export function useAdminTrackerRealtimeSync({
  orgId,
  onRefresh,
  enabled = true,
}: {
  orgId: string | null | undefined;
  onRefresh: () => void;
  enabled?: boolean;
}): void {
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled || !orgId) return;

    const socket = connectSocket();
    if (!socket) return;

    const orgKey = String(orgId);

    const onConnect = () => {
      socket.emit("tracker:subscribe", { orgId: orgKey });
    };
    onConnect();
    socket.on("connect", onConnect);

    let timer: ReturnType<typeof setTimeout> | null = null;

    const onTrackerUpdated = (payload: TrackerUpdatedPayload) => {
      if (!payload?.orgId || String(payload.orgId) !== orgKey) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => onRefreshRef.current(), 300);
    };

    socket.on("tracker:updated", onTrackerUpdated);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        onRefreshRef.current();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timer) clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("tracker:updated", onTrackerUpdated);
      socket.emit("tracker:unsubscribe", { orgId: orgKey });
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [orgId, enabled]);
}
