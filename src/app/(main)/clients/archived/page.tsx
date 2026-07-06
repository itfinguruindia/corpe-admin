"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft, Archive, Eye } from "lucide-react";

import { clientsApi } from "@/lib/api";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { useDebouncedCallback } from "@/utils/helpers";

interface ArchivedClient {
  orgId: string;
  appNo: string;
  companyType: string;
  clientName: string;
  clientEmail: string;
  archivedAt: string;
  archivedByName: string;
  archiveReason: string;
}

export default function ArchivedClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ArchivedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchArchived = async (currentPage: number, searchVal: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientsApi.getArchivedClients(
        currentPage,
        10,
        searchVal,
      );
      setClients(data.clients || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(currentPage);
    } catch (err) {
      console.error("Error fetching archived clients:", err);
      setError("Failed to load archived applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchDebounced = useDebouncedCallback((val: string) => {
    fetchArchived(1, val);
  }, 400);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    handleSearchDebounced(val);
  };

  const handlePageChange = (nextPage: number) => {
    fetchArchived(nextPage, search);
  };

  const columns: ColumnDef<ArchivedClient>[] = [
    {
      id: "appNo",
      label: "Application No.",
      render: (row) => (
        <button
          onClick={() => router.push(`/clients/archived/${row.orgId}`)}
          className="font-bold text-primary hover:text-primary-hover hover:underline text-left cursor-pointer transition-colors"
        >
          {row.appNo}
        </button>
      ),
    },
    {
      id: "client",
      label: "Client Details",
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900 block">
            {row.clientName}
          </span>
          <span className="text-xs text-gray-500 block">{row.clientEmail}</span>
        </div>
      ),
    },
    {
      id: "companyType",
      label: "Company Type",
      render: (row) => (
        <span className="text-gray-600 font-medium">{row.companyType}</span>
      ),
    },
    {
      id: "archivedBy",
      label: "Archived By",
      render: (row) => (
        <span className="text-gray-600 text-sm">{row.archivedByName}</span>
      ),
    },
    {
      id: "archivedAt",
      label: "Archived Date",
      render: (row) => (
        <span className="text-gray-500 text-sm">
          {new Date(row.archivedAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      id: "archiveReason",
      label: "Reason",
      render: (row) => (
        <span
          className="text-gray-500 text-sm block max-w-xs truncate"
          title={row.archiveReason}
        >
          {row.archiveReason}
        </span>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => router.push(`/clients/archived/${row.orgId}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors cursor-pointer"
        >
          <Eye className="size-3.5" />
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => router.push("/clients")}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Active Clients
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 text-gray-700 rounded-xl">
              <Archive className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Archived Applications
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                View point-in-time snapshot records of applications that were
                archived or rejected.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by application no, company type, or reason..."
            className="w-full h-11 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm"
          />
        </div>
      </div>

      {/* Table Container */}
      <DataTable<ArchivedClient>
        data={clients}
        columns={columns}
        keyField="orgId"
        loading={loading}
        error={error}
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        itemsPerPage={10}
        onPageChange={handlePageChange}
        emptyMessage="No archived applications found."
      />
    </div>
  );
}
