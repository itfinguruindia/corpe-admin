"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TicketApi } from "@/lib/api/tickets";
import type { Ticket } from "@/types/tickets";
import { Button } from "@heroui/react";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function TicketDetailsPage() {
  const params = useParams() || {};
  const router = useRouter();
  const ticketId = String((params as any).ticketId || "");

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const data = await TicketApi.getTicketById(ticketId);
    setTicket(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!ticketId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const submit = async () => {
    if (!ticket || !comment.trim()) return;
    try {
      setIsSubmitting(true);
      const ok = await TicketApi.updateTicket({
        ticketId: ticket.id,
        comment: comment.trim(),
      });
      if (ok) {
        setComment("");
        await load();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-slate-500">Loading ticket…</div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Ticket not found.</p>
        <Button className="mt-4" onPress={() => router.push("/tickets")}>
          Back to tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Ticket Details</h1>
          <p className="mt-1 text-sm text-slate-500">
            Created on {ticket.createdOn ? formatDate(ticket.createdOn) : "—"}
          </p>
        </div>
        <Button variant="ghost" onPress={() => router.push("/tickets")}>
          Back
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Subject
            </h3>
            <p className="text-lg font-medium text-gray-900">{ticket.subject}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Description
            </h3>
            <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description || "No description provided."}
            </div>
          </div>

          {(ticket.updates?.length ?? 0) > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Updates
              </h3>
              <div className="space-y-2">
                {ticket.updates!.map((u) => (
                  <div
                    key={u.id || u.timestamp}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-secondary">
                        {u.author || "Admin"}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {u.timestamp ? formatDate(u.timestamp) : ""}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                      {u.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Add update
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write an update for this ticket…"
              rows={6}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20"
            />
            <div className="mt-3 flex justify-end">
              <Button
                className="rounded-lg bg-primary px-6 py-2 text-base font-semibold text-white transition-all hover:bg-secondary disabled:opacity-60"
                isDisabled={!comment.trim() || isSubmitting}
                onPress={submit}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

