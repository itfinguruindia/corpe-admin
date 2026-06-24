"use client";

import { useState, useEffect } from "react";

import { MessageSquareText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton, Tooltip, Chip, Button } from "@heroui/react";

import { TicketApi } from "@/lib/api/tickets";
import type { Ticket } from "@/types/tickets";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";

function formatTime(dateString: string) {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function TicketSkeleton() {
  return (
    <div className="flex flex-wrap justify-between gap-2 items-center rounded-xl p-4 border border-gray-100 bg-gray-50/30">
      <div className="shrink-0 space-y-2">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-5 w-28 rounded-md" />
      </div>
      <div className="shrink-0 space-y-2 flex flex-col items-center">
        <Skeleton className="h-3 w-14 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="shrink-0 space-y-2 px-4">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
      <div className="ml-auto space-y-2 text-center">
        <Skeleton className="h-3 w-10 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
    </div>
  );
}

export default function RaisedTicketsWidget() {
  const { hasPermission } = usePermissions();
  const canViewTickets = hasPermission(PERMISSIONS.TICKET_VIEW);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(canViewTickets);

  useEffect(() => {
    let mounted = true;

    if (!canViewTickets) {
      setLoading(false);
      return;
    }

    TicketApi.getAllTickets(1, 3)
      .then((res) => {
        if (mounted) setTickets(res.tickets);
      })
      .catch(() => {
        if (mounted) setTickets([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [canViewTickets]);

  if (loading) {
    return (
      <div className="space-y-3">
        <TicketSkeleton />
        <TicketSkeleton />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <MessageSquareText className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">No tickets raised yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="flex flex-wrap justify-between gap-2 items-center bg-gray-50/50 rounded-xl p-4 border border-gray-100 transition-all hover:bg-white hover:shadow-sm hover:border-gray-200"
        >
          {/* Application No */}
          <div className="shrink-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              Application No.
            </p>
            <Link
              href={`/clients/${ticket.applicationNo}`}
              className="text-lg font-bold text-primary hover:underline"
            >
              {ticket.applicationNo}
            </Link>
          </div>

          {/* View Message */}
          <div className="shrink-0 flex flex-col items-center border-gray-200 px-6">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              Message
            </p>
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  className="text-primary bg-transparent hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg"
                >
                  <MessageSquareText className="h-5 w-5" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>View message</Tooltip.Content>
            </Tooltip>
          </div>

          {/* Assignee */}
          <div className="shrink-0 px-4">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              Assignee
            </p>
            <Chip
              variant="soft"
              size="sm"
              className="bg-secondary-50 text-secondary font-bold"
            >
              {ticket.assignee?.name || "Unassigned"}
            </Chip>
          </div>

          {/* Time */}
          <div className="ml-auto text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              Time
            </p>
            <Chip variant="soft" size="sm" className="bg-primary-50 text-primary font-semibold">
              {formatTime(ticket.createdOn)}
            </Chip>
          </div>
        </div>
      ))}

      {canViewTickets && (
        <Link href="/tickets">
          <Button
            className="w-full text-secondary/60 hover:text-primary font-bold uppercase tracking-wider text-xs bg-transparent"
          >
            View all tickets
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}
