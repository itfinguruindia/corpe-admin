"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, RefreshCw, FileDown } from "lucide-react";
import { mockClientMessages } from "@/lib/data/mockCommunicationData";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function ClientMessagesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Client-side pagination logic
  const totalItems = mockClientMessages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = mockClientMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "applicationNo",
      label: "Application Number",
      render: (row) => (
        <span className="text-lg font-medium text-[#FF6A3D]">
          {row.applicationNo}
        </span>
      ),
    },
    {
      id: "companyName",
      label: "Name of the Company",
      render: (row) => (
        <span className="text-base text-gray-700">{row.companyName}</span>
      ),
    },
    {
      id: "clientName",
      label: "Client Name",
      render: (row) => (
        <span className="text-base text-gray-700">{row.clientName}</span>
      ),
    },
    {
      id: "action",
      label: "View Message",
      render: (row) => (
        <div className="flex justify-center">
          <Link
            href={`/messages/${row.id}`}
            className="flex h-12 w-12 items-center justify-center rounded-lg text-[#FF6A3D] transition-all hover:bg-[#FFE5DD]"
          >
            <MessageSquare className="h-7 w-7" />
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
        <h2 className="text-2xl font-semibold text-secondary">Client Message</h2>
      </div>

      {/* Messages Table */}
      <DataTable
        data={paginatedData}
        columns={columns}
        keyField="id"
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        emptyMessage="No messages yet"
        emptyIcon={MessageSquare}
      />
    </div>
  );
}
