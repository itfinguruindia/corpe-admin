"use client";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import type { RootState } from "@/redux/store";
import { connectSocket, getSocket } from "@/lib/socket";
import chatService from "@/services/chat.service";
import { TicketApi } from "@/lib/api/tickets";
import { getMetadataForPathname } from "@/lib/site-metadata";

const POLL_INTERVAL_MS = 30000;

function formatBadge(count: number): string {
  if (count <= 0) return "";
  return count > 99 ? "99+" : String(count);
}

function resolveAbsoluteTitle(pathname: string): string {
  const meta = getMetadataForPathname(pathname || "/");
  const title = meta.title;
  if (typeof title === "string") return title;
  if (title && typeof title === "object" && "absolute" in title) {
    return String((title as { absolute?: string }).absolute || "CorpE Admin");
  }
  return "CorpE Admin";
}

/**
 * Tracks unread client messages + unseen open tickets (DB-backed seenAdmins).
 */
export function useCommunicationBadges() {
  const pathname = usePathname();
  const adminId = useSelector(
    (state: RootState) => state.auth?.admin?.id || "",
  );

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);

  const refresh = useCallback(async () => {
    if (!adminId) {
      setUnreadMessages(0);
      setOpenTickets(0);
      return;
    }

    try {
      const viewingTickets = pathname?.startsWith("/tickets");

      if (viewingTickets) {
        await TicketApi.markTicketsSeen().catch(() => false);
      }

      const [messageCount, ticketCount] = await Promise.all([
        chatService.getUnreadCount().catch(() => 0),
        TicketApi.getUnreadCount().catch(() => 0),
      ]);

      setUnreadMessages(Number(messageCount) || 0);
      setOpenTickets(viewingTickets ? 0 : Number(ticketCount) || 0);
    } catch (error) {
      console.warn("[useCommunicationBadges] Failed to refresh counts", error);
    }
  }, [adminId, pathname]);

  useEffect(() => {
    refresh();
    const intervalId = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  useEffect(() => {
    if (!adminId) return;

    const socket = connectSocket() || getSocket();
    if (!socket) return;

    const handleRoomUpdated = () => {
      refresh();
    };

    socket.on("chat:roomUpdated", handleRoomUpdated);
    return () => {
      socket.off("chat:roomUpdated", handleRoomUpdated);
    };
  }, [adminId, refresh]);

  useEffect(() => {
    if (
      pathname?.startsWith("/tickets") ||
      pathname?.startsWith("/messages")
    ) {
      void refresh();
    }
  }, [pathname, refresh]);

  useEffect(() => {
    const total = unreadMessages + openTickets;
    const baseTitle = resolveAbsoluteTitle(pathname || "/");
    document.title =
      total > 0 ? `(${formatBadge(total)}) ${baseTitle}` : baseTitle;
  }, [unreadMessages, openTickets, pathname]);

  return {
    unreadMessages,
    openTickets,
    totalUnread: unreadMessages + openTickets,
    refresh,
  };
}

export default useCommunicationBadges;
