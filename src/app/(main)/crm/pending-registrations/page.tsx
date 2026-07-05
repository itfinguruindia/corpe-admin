"use client";

import { Eye, Trash2, Search, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Label, TextField } from "@heroui/react";

import {
  pendingRegistrationApi,
  type PendingRegistrationItem,
} from "@/lib/api/marketing";
import { PendingRegistrationDetailModal } from "@/components/marketing/PendingRegistrationDetailModal";
import useSwal from "@/utils/useSwal";
import { useDebouncedCallback } from "@/utils/helpers";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import CustomSelect from "@/components/ui/CustomSelect";

const STEP_OPTIONS = [
  { id: "", label: "All steps" },
  { id: "0", label: "Phone verified" },
  { id: "1", label: "Company type" },
  { id: "2", label: "Personal details" },
  { id: "3", label: "Business names" },
  { id: "4", label: "Additional details" },
  { id: "5", label: "Review" },
  { id: "6", label: "Payment" },
];

const STEP_LABELS: Record<number, string> = {
  0: "Phone verified",
  1: "Company type",
  2: "Personal details",
  3: "Business names",
  4: "Additional details",
  5: "Review",
  6: "Payment",
};

export default function PendingRegistrationsPage() {
  const [records, setRecords] = useState<PendingRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [stepFilter, setStepFilter] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<PendingRegistrationItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const itemsPerPage = 10;
  const swal = useSwal();

  const handleSearch = useDebouncedCallback((page: number) => {
    fetchRecords(page);
  }, 300);

  const fetchRecords = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await pendingRegistrationApi.getAll(
        page,
        itemsPerPage,
        search || undefined,
        stepFilter !== "" ? Number(stepFilter) : undefined,
      );
      setRecords(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching pending registrations:", err);
      setError("Failed to load pending registrations. Please try again later.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1);
  }, []);

  useEffect(() => {
    handleSearch(1);
  }, [search, stepFilter]);

  const handleViewDetails = (row: PendingRegistrationItem) => {
    setSelectedRecord(row);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await swal({
      title: "Remove this entry?",
      text: "This pending registration record will be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await pendingRegistrationApi.delete(id);
      await swal({
        title: "Deleted",
        text: "Pending registration removed.",
        icon: "success",
      });
      fetchRecords(currentPage);
    } catch (err) {
      console.error("Error deleting pending registration:", err);
      await swal({
        title: "Error",
        text: "Failed to delete record. Please try again.",
        icon: "error",
      });
    }
  };

  const columns: ColumnDef<PendingRegistrationItem>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Name",
        render: (row) => (
          <span className="font-semibold text-gray-900 whitespace-nowrap">
            {[row.firstName, row.lastName].filter(Boolean).join(" ") || "-"}
          </span>
        ),
      },
      {
        id: "email",
        label: "Email",
        render: (row) => (
          <span className="text-gray-700 whitespace-nowrap">
            {row.email || "-"}
          </span>
        ),
      },
      {
        id: "phone",
        label: "Phone",
        render: (row) => (
          <span className="text-gray-700 whitespace-nowrap">{row.phone}</span>
        ),
      },
      {
        id: "companyType",
        label: "Company type",
        render: (row) => (
          <span
            className="text-gray-700 max-w-[180px] truncate block"
            title={row.companyType || row.companyName || ""}
          >
            {row.companyType || row.companyName || "-"}
          </span>
        ),
      },
      {
        id: "step",
        label: "Last step",
        render: (row) => (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 whitespace-nowrap">
            {STEP_LABELS[row.maxStepReached] ?? `Step ${row.maxStepReached}`}
          </span>
        ),
      },
      {
        id: "razorpay",
        label: "Razorpay opens",
        render: (row) => (
          <span className="text-gray-900 font-semibold whitespace-nowrap">
            {row.razorpayPopupOpenCount ?? 0}
          </span>
        ),
      },
      {
        id: "lastActivityAt",
        label: "Last activity",
        render: (row) => (
          <span className="text-gray-700 whitespace-nowrap">
            {row.lastActivityAt
              ? new Date(row.lastActivityAt).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        id: "createdAt",
        label: "Started",
        render: (row) => (
          <span className="text-gray-700 whitespace-nowrap">
            {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
          </span>
        ),
      },
      {
        id: "action",
        label: "Action",
        render: (row) => (
          <div className="flex items-center gap-1">
            <Button
              onClick={() => handleViewDetails(row)}
              className="min-w-0 h-auto p-2 text-primary hover:text-secondary hover:bg-blue-50"
              aria-label="View registration details"
              variant="ghost"
              type="button"
            >
              <Eye size={18} />
            </Button>
            <Button
              onClick={() => handleDelete(row._id)}
              className="min-w-0 h-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-50"
              aria-label="Delete pending registration"
              variant="ghost"
              type="button"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ),
      },
    ],
    [currentPage],
  );

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-6 p-6 pb-0 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pending Registrations
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Users who started signup but did not complete registration. Total:{" "}
              <span className="font-semibold text-gray-900">{total}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 size-5" />
              <TextField
                value={search}
                onChange={setSearch}
                name="searchPending"
              >
                <Label className="sr-only">Search pending registrations</Label>
                <Input
                  aria-label="Search pending registrations"
                  placeholder="Search name, email, phone..."
                  className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm"
                />
              </TextField>
            </div>

            <div className="h-[38px] w-full sm:w-auto min-w-[168px]">
              <CustomSelect
                ariaLabel="Filter by step"
                value={stepFilter}
                onChange={setStepFilter}
                options={STEP_OPTIONS}
              />
            </div>

            <Button
              isIconOnly
              onClick={() => fetchRecords(currentPage)}
              className="h-10 w-10 min-w-10 shrink-0 rounded-lg border border-gray-200 bg-white p-0 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Refresh pending registrations"
              type="button"
              variant="ghost"
            >
              <RefreshCw size={18} />
            </Button>
          </div>
        </div>
      </div>

      <DataTable<PendingRegistrationItem>
        data={records}
        columns={columns}
        keyField="_id"
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={fetchRecords}
      />

      <PendingRegistrationDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />
    </div>
  );
}
