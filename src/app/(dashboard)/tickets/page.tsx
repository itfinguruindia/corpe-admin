"use client";

import React, { useState } from "react";
import Link from "next/link";
import { mockTickets } from "@/lib/data/mockTicketsData";
import type { TicketStatus, TicketPriority } from "@/types/tickets";
import { Chip, Dropdown } from "@/components/ui";
import type { ChipVariant } from "@/components/ui";

export default function RaisedTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">(
    "all",
  );
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Filter tickets based on selected filters
  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

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

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "• Open", value: "open" },
    { label: "• Close", value: "close" },
    { label: "• Resolving", value: "resolving" },
  ];

  const priorityOptions = [
    { label: "All", value: "all" },
    { label: "• High", value: "high" },
    { label: "• Medium", value: "medium" },
    { label: "• Low", value: "low" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#FF6A3D]">GUJC000001</h1>
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

      {/* Tickets Table */}
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
                <Dropdown
                  label="Status"
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(value) =>
                    setStatusFilter(value as TicketStatus | "all")
                  }
                  isOpen={showStatusDropdown}
                  onToggle={() => setShowStatusDropdown(!showStatusDropdown)}
                  onClose={() => setShowStatusDropdown(false)}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Assignee
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                <Dropdown
                  label="Priority"
                  options={priorityOptions}
                  value={priorityFilter}
                  onChange={(value) =>
                    setPriorityFilter(value as TicketPriority | "all")
                  }
                  isOpen={showPriorityDropdown}
                  onToggle={() =>
                    setShowPriorityDropdown(!showPriorityDropdown)
                  }
                  onClose={() => setShowPriorityDropdown(false)}
                />
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
            {filteredTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
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
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="text-base font-medium text-gray-700 underline hover:text-secondary transition-colors"
                    >
                      view
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State - Show when no tickets */}
      {filteredTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
          <p className="mt-4 text-lg text-gray-500">
            {statusFilter !== "all" || priorityFilter !== "all"
              ? "No tickets match the selected filters"
              : "No tickets raised yet"}
          </p>
        </div>
      )}
    </div>
  );
}
