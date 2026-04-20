"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RefreshCw, FileDown, Search, Ticket } from "lucide-react";
import { mockTickets } from "@/lib/data/mockTicketsData";
import type { TicketStatus, TicketPriority } from "@/types/tickets";
import { Chip } from "@/components/ui";
import type { ChipVariant } from "@/components/ui/Chip";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function RaisedTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter tickets based on selected filters
  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  // Pagination logic
  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const columns: ColumnDef<any>[] = [
    {
      id: "applicationNo",
      label: "Application No.",
      render: (row) => (
        <span className="text-base font-medium text-[#FF6A3D]">
          {row.applicationNo}
        </span>
      ),
    },
    {
      id: "category",
      label: "Category",
      render: (row) => <span className="text-base text-gray-700">{row.category}</span>,
    },
    {
      id: "subject",
      label: "Subject",
      render: (row) => <span className="text-base text-gray-700">{row.subject}</span>,
    },
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <Chip
          label={capitalizeFirst(row.status)}
          variant={getStatusVariant(row.status)}
        />
      ),
    },
    {
      id: "assignee",
      label: "Assignee",
      render: (row) => <span className="text-base text-gray-700">{row.assignee}</span>,
    },
    {
      id: "priority",
      label: "Priority",
      render: (row) => (
        <Chip
          label={capitalizeFirst(row.priority)}
          variant={getPriorityVariant(row.priority)}
        />
      ),
    },
    {
      id: "createdOn",
      label: "Created On",
      render: (row) => <span className="text-base text-gray-700">{formatDate(row.createdOn)}</span>,
    },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex justify-center">
          <Link
            href={`/tickets/${row.id}`}
            className="text-base font-medium text-gray-700 underline hover:text-secondary transition-colors"
          >
            view
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-w-0">
      {/* HEADER & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-6 p-6 pb-0 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#FF6A3D]">GUJC000001</h1>
              <div className="mt-4 inline-block">
                <span className="rounded-full bg-[#FFE5DD] px-6 py-2 text-lg font-medium text-secondary">
                  Communication
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-[38px] w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-gray-200 bg-transparent px-4 pr-8 text-sm text-gray-900 transition-all hover:bg-gray-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-position-[right_0.5rem_center]"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="close">Close</option>
              <option value="resolving">Resolving</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="h-[38px] w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-gray-200 bg-transparent px-4 pr-8 text-sm text-gray-900 transition-all hover:bg-gray-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-position-[right_0.5rem_center]"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border shadow-sm border-gray-200 bg-white"
                title="Refresh"
                type="button"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={18} />
              </button>
              <button
                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border shadow-sm border-gray-200 bg-white"
                title="Export"
                type="button"
              >
                <FileDown size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="px-6 mb-2">
        <h2 className="text-2xl font-semibold text-secondary">Raised Tickets</h2>
      </div>

      {/* Tickets Table */}
      <DataTable
        data={paginatedData}
        columns={columns}
        keyField="id"
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        emptyMessage={
          statusFilter !== "all" || priorityFilter !== "all"
            ? "No tickets match the selected filters"
            : "No tickets raised yet"
        }
        emptyIcon={Ticket}
      />
    </div>
  );
}
