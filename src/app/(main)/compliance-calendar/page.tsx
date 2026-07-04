"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import ComplianceDateFilterButton from "@/components/compliance/ComplianceDateFilterButton";
import { useRouter } from "next/navigation";
import { Button, Input, Label, TextField } from "@heroui/react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import ComplianceFormModal from "@/components/compliance/ComplianceFormModal";
import CustomSelect from "@/components/ui/CustomSelect";
import useSwal from "@/utils/useSwal";
import {
  complianceApi,
  COMPLIANCE_CATEGORY_OPTIONS,
  COMPLIANCE_COMPANY_TYPE_OPTIONS,
  categoryToSelectId,
  companyTypeLabel,
  normalizeComplianceCategory,
  type ComplianceCategory,
  type ComplianceCompanyType,
  type ComplianceEntry,
  type ComplianceInput,
  type CompliancePenalty,
} from "@/lib/api/compliance";
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CATEGORY_COLORS: Record<ComplianceCategory, string> = {
  GST: "bg-blue-100 text-blue-800",
  "TDS / TCS": "bg-purple-100 text-purple-800",
  "Income Tax": "bg-green-100 text-green-800",
  ROC: "bg-orange-100 text-orange-800",
  MSME: "bg-teal-100 text-teal-800",
  "Advance Tax": "bg-indigo-100 text-indigo-800",
};

function getCategoryColor(category: string) {
  return (
    CATEGORY_COLORS[category as ComplianceCategory] ??
    "bg-gray-100 text-gray-800"
  );
}

function formatDate(day: number, month: number) {
  const monthName = MONTH_NAMES[month - 1] ?? `Month ${month}`;
  return `${day} ${monthName}`;
}

function safePenalty(penalty?: CompliancePenalty | null): CompliancePenalty {
  return {
    title: penalty?.title ?? "-",
    rate: penalty?.rate ?? "-",
    maximum: penalty?.maximum ?? "-",
    interest: penalty?.interest ?? "-",
    section: penalty?.section ?? "-",
  };
}

function PenaltyCell({
  value,
  emphasize,
}: {
  value: string;
  emphasize?: boolean;
}) {
  return (
    <span
      className={`block text-sm leading-snug ${
        emphasize ? "font-medium text-gray-900" : "text-gray-700"
      }`}
      title={value}
    >
      {value}
    </span>
  );
}

function isRequestAborted(err: unknown): boolean {
  if (!axios.isAxiosError(err)) {
    const msg = err instanceof Error ? err.message.toLowerCase() : "";
    return msg.includes("abort") || msg.includes("cancel");
  }
  const msg = (err.message || "").toLowerCase();
  return (
    err.code === "ERR_CANCELED" ||
    err.name === "CanceledError" ||
    msg.includes("abort") ||
    msg.includes("cancel")
  );
}

export default function ComplianceCalendarPage() {
  const router = useRouter();
  const swal = useSwal();

  const [entries, setEntries] = useState<ComplianceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [category, setCategory] = useState("");
  const [companyTypeFilter, setCompanyTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ComplianceEntry | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const itemsPerPage = 10;
  const abortRef = useRef<AbortController | null>(null);
  const filtersRef = useRef({
    search,
    filterMonth,
    filterDay,
    category,
    companyTypeFilter,
    statusFilter,
  });
  filtersRef.current = {
    search,
    filterMonth,
    filterDay,
    category,
    companyTypeFilter,
    statusFilter,
  };

  const fetchEntries = useCallback(async (page: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const {
        search: q,
        filterMonth: month,
        filterDay: day,
        category: cat,
        companyTypeFilter: companyType,
        statusFilter: status,
      } = filtersRef.current;

      const result = await complianceApi.getAll(
        {
          page,
          limit: itemsPerPage,
          search: q || undefined,
          month: month ? Number(month) : undefined,
          day: day ? Number(day) : undefined,
          category: cat ? normalizeComplianceCategory(cat) : undefined,
          companyType: (companyType as ComplianceCompanyType) || undefined,
          companyTypeScope: companyType ? "exact" : undefined,
          status: (status as "done" | "pending") || undefined,
        },
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      setEntries(result.data || []);
      setTotalPages(result.totalPages || 1);
      setTotal(result.total || 0);
      setCurrentPage(page);
    } catch (err) {
      if (controller.signal.aborted || isRequestAborted(err)) return;
      console.error("Error fetching compliance entries:", err);
      setError("Failed to load compliance calendar. Please try again.");
      setEntries([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Single fetch effect - debounce search, immediate for filters/pagination
  useEffect(() => {
    const delay = search ? 300 : 0;
    const timer = setTimeout(() => fetchEntries(1), delay);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [
    search,
    filterMonth,
    filterDay,
    category,
    companyTypeFilter,
    statusFilter,
    fetchEntries,
  ]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchEntries(page);
    },
    [fetchEntries],
  );

  const handleCreate = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEdit = useCallback((entry: ComplianceEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  }, []);

  const handleFormSubmit = async (data: ComplianceInput) => {
    setIsSubmitting(true);
    try {
      if (editingEntry) {
        await complianceApi.update(editingEntry.id, data);
        await swal({
          icon: "success",
          title: "Updated",
          text: "Compliance entry updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await complianceApi.create(data);
        await swal({
          icon: "success",
          title: "Created",
          text: "Compliance entry created successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setIsModalOpen(false);
      setEditingEntry(null);
      fetchEntries(editingEntry ? currentPage : 1);
    } catch (err) {
      console.error("Error saving compliance entry:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(
    async (entry: ComplianceEntry) => {
      const result = await swal({
        title: "Delete entry?",
        text: `Remove "${entry.formName}" from the compliance calendar?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Delete",
      });

      if (!result.isConfirmed) return;

      try {
        await complianceApi.delete(entry.id);
        await swal({
          icon: "success",
          title: "Deleted",
          text: "Compliance entry removed.",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchEntries(currentPage);
      } catch (err) {
        console.error("Error deleting entry:", err);
      }
    },
    [currentPage, fetchEntries, swal],
  );

  const handleStatusToggle = useCallback(async (entry: ComplianceEntry) => {
    const newStatus = entry.status === "done" ? "pending" : "done";
    setTogglingId(entry.id);
    try {
      const penalty = safePenalty(entry.penalty);
      await complianceApi.update(entry.id, {
        day: entry.day,
        month: entry.month,
        category: entry.category,
        companyType: entry.companyType,
        formName: entry.formName,
        description: entry.description,
        period: entry.period,
        locationEnabled: entry.locationEnabled,
        status: newStatus,
        penalty,
      });
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: newStatus } : e)),
      );
    } catch (err) {
      console.error("Error toggling status:", err);
    } finally {
      setTogglingId(null);
    }
  }, []);

  const columns: ColumnDef<ComplianceEntry>[] = useMemo(
    () => [
      {
        id: "date",
        label: "Date",
        render: (row) => (
          <span className="block font-semibold text-gray-900 whitespace-nowrap">
            {formatDate(row.day, row.month)}
          </span>
        ),
      },
      {
        id: "category",
        label: "Category",
        render: (row) => (
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getCategoryColor(row.category)}`}
          >
            {row.category}
          </span>
        ),
      },
      {
        id: "companyType",
        label: "Company Type",
        render: (row) => (
          <span className="block text-sm text-gray-800 whitespace-nowrap">
            {companyTypeLabel(row.companyType)}
          </span>
        ),
      },
      {
        id: "formName",
        label: "Form Name",
        render: (row) => (
          <span className="block font-medium text-gray-900">
            {row.formName}
          </span>
        ),
      },
      {
        id: "description",
        label: "Description",
        render: (row) => (
          <span
            className="block text-gray-700 line-clamp-2"
            title={row.description}
          >
            {row.description || "-"}
          </span>
        ),
      },
      {
        id: "period",
        label: "Period",
        render: (row) => (
          <span className="block text-gray-800 whitespace-nowrap">
            {row.period}
          </span>
        ),
      },
      {
        id: "penaltyTitle",
        label: "Penalty Title",
        render: (row) => (
          <PenaltyCell value={safePenalty(row.penalty).title} emphasize />
        ),
      },
      {
        id: "penaltyRate",
        label: "Penalty Rate",
        render: (row) => <PenaltyCell value={safePenalty(row.penalty).rate} />,
      },
      {
        id: "penaltyMaximum",
        label: "Maximum",
        render: (row) => (
          <PenaltyCell value={safePenalty(row.penalty).maximum} />
        ),
      },
      {
        id: "penaltyInterest",
        label: "Interest",
        render: (row) => (
          <PenaltyCell value={safePenalty(row.penalty).interest} />
        ),
      },
      {
        id: "penaltySection",
        label: "Section",
        render: (row) => (
          <PenaltyCell value={safePenalty(row.penalty).section} />
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (row) => (
          <button
            type="button"
            disabled={togglingId === row.id}
            onClick={() => handleStatusToggle(row)}
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              row.status === "done"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            } ${togglingId === row.id ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
          >
            {row.status === "done" ? "Done" : "Pending"}
          </button>
        ),
      },
      {
        id: "actions",
        label: "Actions",
        canHide: false,
        render: (row) => (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleEdit(row)}
              className="min-w-0 h-auto p-2 text-[#3D63A4] hover:bg-blue-50"
              aria-label="Edit entry"
            >
              <Pencil size={16} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleDelete(row)}
              className="min-w-0 h-auto p-2 text-red-600 hover:bg-red-50"
              aria-label="Delete entry"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete, handleEdit, handleStatusToggle, togglingId],
  );

  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF6A3D] mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </button>
          <h1 className="text-4xl font-bold text-[#FF6A3D]">
            Compliance Calendar
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Track filing deadlines and penalty details
            {total > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({total} {total === 1 ? "entry" : "entries"})
              </span>
            )}
          </p>
        </div>
        <Button
          type="button"
          onClick={handleCreate}
          className="rounded-lg bg-[#FF6A3D] text-white hover:bg-[#e55a2d] shrink-0"
        >
          <Plus size={18} />
          Add Entry
        </Button>
      </div>

      <div className="w-full min-w-0 rounded-xl bg-white shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="flex flex-1 min-w-0 items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 size-4" />
              <TextField
                value={search}
                onChange={setSearch}
                name="searchCompliance"
              >
                <Label className="sr-only">Search</Label>
                <Input
                  placeholder="Search form, description, period, penalty..."
                  className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm"
                />
              </TextField>
            </div>

            <ComplianceDateFilterButton
              value={{ month: filterMonth, day: filterDay }}
              onChange={({ month, day }) => {
                setFilterMonth(month);
                setFilterDay(day);
              }}
            />
          </div>

          <div className="h-[38px] w-full lg:w-auto min-w-[160px]">
            <CustomSelect
              ariaLabel="Filter by company type"
              value={companyTypeFilter}
              options={[
                { id: "", label: "All Companies" },
                ...COMPLIANCE_COMPANY_TYPE_OPTIONS.filter(
                  (c) => c.id !== "all",
                ),
              ]}
              onChange={setCompanyTypeFilter}
            />
          </div>

          <div className="h-[38px] w-full lg:w-auto min-w-[160px]">
            <CustomSelect
              ariaLabel="Filter by category"
              value={category ? categoryToSelectId(category) : ""}
              options={[
                { id: "", label: "All Categories" },
                ...COMPLIANCE_CATEGORY_OPTIONS.map((c) => ({
                  id: c.id,
                  label: c.label,
                })),
              ]}
              onChange={(id) => {
                if (!id) {
                  setCategory("");
                  return;
                }
                const match = COMPLIANCE_CATEGORY_OPTIONS.find(
                  (c) => c.id === id,
                );
                setCategory(match?.label ?? "");
              }}
            />
          </div>

          <div className="h-[38px] w-full lg:w-auto min-w-[140px]">
            <CustomSelect
              ariaLabel="Filter by status"
              value={statusFilter}
              options={[
                { id: "", label: "All Status" },
                { id: "pending", label: "Pending" },
                { id: "done", label: "Done" },
              ]}
              onChange={setStatusFilter}
            />
          </div>

          <Button
            type="button"
            isIconOnly
            variant="ghost"
            onClick={() => fetchEntries(currentPage)}
            className="h-10 w-10 min-w-10 shrink-0 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
            aria-label="Refresh"
          >
            <RefreshCw size={18} />
          </Button>
        </div>

        <div className="w-full min-w-0">
          <DataTable<ComplianceEntry>
            data={entries}
            columns={columns}
            keyField="id"
            loading={loading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            columnMinWidth={150}
            emptyMessage="No compliance entries yet. Add your first filing deadline."
          />
        </div>
      </div>

      <ComplianceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleFormSubmit}
        editingEntry={editingEntry}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
