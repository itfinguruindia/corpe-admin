"use client";

import { useState, useEffect } from "react";

import { MessageSquareText, ArrowRight } from "lucide-react";
import Link from "next/link";

import { TicketApi } from "@/lib/api/tickets";
import type { Ticket } from "@/types/tickets";

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
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-5 w-28" />
      </div>
      <div className="shrink-0 space-y-2 flex flex-col items-center">
        <div className="skeleton h-3 w-14" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
      <div className="shrink-0 space-y-2 px-4">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-5 w-20" />
      </div>
      <div className="ml-auto space-y-2 text-center">
        <div className="skeleton h-3 w-10" />
        <div className="skeleton h-4 w-16" />
      </div>
    </div>
  );
}

export default function RaisedTicketsWidget() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    TicketApi.getAllTickets(1, 3)
      .then((res) => setTickets(res.tickets))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

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
            <button className="flex items-center justify-center p-2 rounded-lg hover:bg-white transition-all text-primary border border-transparent hover:border-gray-200 hover:shadow-sm">
              <MessageSquareText className="h-6 w-6" />
            </button>
          </div>

          {/* Assignee */}
          <div className="shrink-0 px-4">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              Assignee
            </p>
            <p className="text-lg font-bold text-secondary">
              {ticket.assignee?.name || "Unassigned"}
            </p>
          </div>

          {/* Time */}
          <div className="ml-auto text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
              Time
            </p>
            <span className="text-sm font-semibold text-primary">
              {formatTime(ticket.createdOn)}
            </span>
          </div>
        </div>
      ))}

      {/* View All Link */}
      <Link
        href="/tickets"
        className="flex items-center justify-center gap-1.5 pt-2 text-xs font-bold text-secondary/60 hover:text-primary transition-colors uppercase tracking-wider"
      >
        View all tickets
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
