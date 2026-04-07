"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockTickets } from "@/lib/data/mockTicketsData";
import type { TicketStatus, TicketPriority } from "@/types/tickets";
import { Chip } from "@/components/ui";
import type { ChipVariant } from "@/components/ui";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ticket = mockTickets.find((t) => t.id === id);
  const [comment, setComment] = useState("");

  if (!ticket) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary">
            Ticket not found
          </h2>
          <p className="mt-2 text-gray-600">
            The ticket you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/tickets"
            className="mt-4 inline-block text-[#FF6A3D] hover:underline"
          >
            ← Back to tickets
          </Link>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: TicketStatus): ChipVariant => {
    const variantMap: Record<TicketStatus, ChipVariant> = {
      open: "blue",
      close: "gray",
      resolving: "yellow",
    };
    return variantMap[status];
  };

  const getPriorityVariant = (priority: TicketPriority): ChipVariant => {
    const variantMap: Record<TicketPriority, ChipVariant> = {
      high: "red",
      medium: "orange",
      low: "green",
    };
    return variantMap[priority];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/tickets"
        className="inline-flex items-center gap-2 text-secondary hover:text-[#FF6A3D] transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base font-medium">Back to Tickets</span>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#FF6A3D]">
            {ticket.applicationNo}
          </h1>
          <div className="mt-4 inline-block">
            <span className="rounded-full bg-[#FFE5DD] px-6 py-2 text-lg font-medium text-secondary">
              Communication
            </span>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div>
        <h2 className="text-2xl font-semibold text-secondary">
          Raised Tickets
        </h2>
      </div>

      {/* Ticket Details Table */}
      <div className="rounded-xl bg-white shadow-sm overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Application No.
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Subject
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Assignee
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Created On
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="px-6 py-4 text-base font-medium text-[#FF6A3D]">
                {ticket.applicationNo}
              </td>
              <td className="px-6 py-4 text-base text-gray-700">
                {ticket.category}
              </td>
              <td className="px-6 py-4 text-base text-gray-700">
                {ticket.subject}
              </td>
              <td className="px-6 py-4">
                <Chip
                  label={capitalizeFirst(ticket.status)}
                  variant={getStatusVariant(ticket.status)}
                />
              </td>
              <td className="px-6 py-4 text-base text-gray-700">
                {ticket.assignee}
              </td>
              <td className="px-6 py-4">
                <Chip
                  label={capitalizeFirst(ticket.priority)}
                  variant={getPriorityVariant(ticket.priority)}
                />
              </td>
              <td className="px-6 py-4 text-base text-gray-700">
                {formatDate(ticket.createdOn)}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <span className="text-base font-medium text-gray-700">
                    view
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comment Section */}
      <div className="rounded-xl bg-white shadow-sm p-6">
        <div className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comment hare..."
            rows={6}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20"
          />
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-lg bg-[#FFE5DD] px-6 py-2 text-base font-medium text-secondary transition-all hover:bg-[#ffd5c5]">
              Reply via Email
            </button>
            <button className="flex items-center gap-2 rounded-lg px-6 py-2 text-base font-medium text-secondary transition-all hover:bg-gray-100">
              Reply via Dashboard Chat
            </button>
            <button className="flex items-center gap-2 rounded-lg px-6 py-2 text-base font-medium text-secondary transition-all hover:bg-gray-100">
              Call Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
