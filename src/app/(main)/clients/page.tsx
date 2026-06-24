"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { buildFiltersFromParams, useDebouncedCallback } from "@/utils/helpers";
import { filtersToSearchParams } from "@/components/ui/FilterDropdown/helpers";
import { clientsApi } from "@/lib/api";
import { adminApi } from "@/lib/api/admin";
import chatService from "@/services/chat.service";
import useSwal from "@/utils/useSwal";
import FilterDropdown, { Filters } from "@/components/ui/FilterDropdown/index";
import ActiveFilters from "@/components/ui/FilterDropdown/ActiveFilters";
import { SearchSelectOption } from "@/components/ui/SearchSelect";
import type { SortDescriptor } from "@heroui/react";
import ExportDropdown from "@/components/ui/ExportDropdown";
import RefreshButton from "@/components/ui/RefreshButton";
import ClientsTable, {
  Client,
  ITEMS_PER_PAGE,
} from "@/components/clients/ClientsTable";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { admin, isSuperAdmin, hasPermission } = usePermissions();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");

  // Debounced search handler — fires API call with current filters
  const handleSearch = useDebouncedCallback((currentFilters: Filters) => {
    fetchClients(1, currentFilters);
  }, 400);

  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "updated",
    direction: "descending",
  });

  const swal = useSwal();
  const [assigneeOptions, setAssigneeOptions] = useState<SearchSelectOption[]>(
    [],
  );
  const [assignerOptions, setAssignerOptions] = useState<SearchSelectOption[]>(
    [],
  );

  // Store filters state — initialised from URL so a page reload re-applies them
  const [filters, setFilters] = useState<Filters>(() =>
    buildFiltersFromParams(searchParams),
  );

  const fetchClients = async (page: number, filtersOverride?: Filters) => {
    try {
      setLoading(true);
      setError(null);
      const activeFilters = filtersOverride ?? filters;
      const data = await clientsApi.getAllClients(
        page,
        ITEMS_PER_PAGE,
        activeFilters,
      );
      setClientsData(data.clients || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load clients. Please try again later.");
      setClientsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use URL-derived filters for the first fetch so reloads honour the query string
    const initialFilters = buildFiltersFromParams(searchParams);
    fetchClients(1, initialFilters);
    adminApi
      .getAssigneeAndAssigner()
      .then((data) => {
        setAssigneeOptions(
          data.assignee.map((u) => ({
            id: u._id,
            name: `${u.name} (${u.assigneeCount})`,
          })),
        );
        setAssignerOptions(
          data.assigner.map((u) => ({
            id: u._id,
            name: `${u.name} (${u.assignerCount})`,
          })),
        );
      })
      .catch(() => {
        setAssigneeOptions([]);
        setAssignerOptions([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update search in filters when input changes — debounced refetch
  const handleSearchInputChange = (value: string) => {
    setSearch(value);
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    handleSearch(newFilters);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchClients(page);
    }
  };

  const handleSortChange = (desc: SortDescriptor) => {
    setSortDescriptor(desc);
    const newFilters = {
      ...filters,
      sortBy: desc.column,
      sortOrder: desc.direction === "ascending" ? "asc" : "desc",
    };
    setFilters(newFilters);
    fetchClients(1, newFilters);
  };

  const handleDelete = async (applicationNo: string) => {
    const result = await swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F46A45",
      cancelButtonColor: "#3D63A4",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await clientsApi.deleteClient(applicationNo);
        await swal({
          title: "Deleted!",
          text: "Client has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#3D63A4",
        });
        // Refresh the current page
        fetchClients(currentPage);
      } catch (err) {
        console.error("Error deleting client:", err);
        await swal({
          title: "Error!",
          text: "Failed to delete client. Please try again.",
          icon: "error",
          confirmButtonColor: "#F46A45",
        });
      }
    }
  };

  const handleApply = (newFilters: Filters) => {
    setFilters(newFilters);
    setSearch(newFilters.search || "");

    // Sync URL
    const queryParams = filtersToSearchParams(newFilters);
    window.history.replaceState(null, "", `?${queryParams.toString()}`);

    // Pass newFilters directly to avoid stale state
    fetchClients(1, newFilters);
  };

  const handleAssigneeChange = async (
    appNo: string,
    opt: SearchSelectOption | null,
  ) => {
    try {
      await clientsApi.updateAssignee(appNo, opt?.id ?? null);
      setClientsData((prev) =>
        prev.map((c) =>
          c.appNo === appNo
            ? {
                ...c,
                assigneeId: opt?.id ?? null,
                assignee: opt?.name ?? "-",
              }
            : c,
        ),
      );
    } catch {
      /* silent */
    }
  };

  const handleAssignerChange = async (
    appNo: string,
    opt: SearchSelectOption | null,
  ) => {
    try {
      await clientsApi.updateAssigner(appNo, opt?.id ?? null);
      setClientsData((prev) =>
        prev.map((c) =>
          c.appNo === appNo
            ? {
                ...c,
                assignerId: opt?.id ?? null,
                assigner: opt?.name ?? "-",
              }
            : c,
        ),
      );
    } catch {
      /* silent */
    }
  };

  const handleChat = async (orgId: string) => {
    try {
      const room = await chatService.getOrCreateRoom(orgId);
      router.push(`/messages?room=${room._id}`);
    } catch (err) {
      console.error("Error opening chat:", err);
    }
  };

  const showInvalidDateRangeAlert = async () => {
    await swal({
      title: "Invalid date range",
      text: "From date cannot be after To date.",
      icon: "warning",
      confirmButtonColor: "#F46A45",
    });
  };

  const handleExportClients = async (
    withDateRange: boolean,
    dateFrom?: string,
    dateTo?: string,
  ) => {
    try {
      setIsExporting(true);
      let exportFilters: Filters & { dateFrom?: string; dateTo?: string } = {
        ...filters,
        ...(withDateRange && dateFrom ? { dateFrom } : {}),
        ...(withDateRange && dateTo ? { dateTo } : {}),
      };
      if (withDateRange && (dateFrom || dateTo)) {
        const { dateRange, ...rest } = exportFilters;
        void dateRange;
        exportFilters = rest as Filters & { dateFrom?: string; dateTo?: string };
      }

      let page = 1;
      let totalPagesForExport = 1;
      const rows: Client[] = [];

      while (page <= totalPagesForExport) {
        const data = await clientsApi.getAllClients(page, 100, exportFilters);
        rows.push(...(data.clients || []));
        totalPagesForExport = data.totalPages || 1;
        page += 1;
      }

      const worksheetRows = [
        [
          "Application No.",
          "Client Name",
          "Entity Type",
          "Assignee",
          "Assigner",
          "Status",
          "Last Update",
        ],
        ...rows.map((client) => [
          client.appNo,
          client.client,
          client.entity,
          client.assignee || "-",
          client.assigner || "-",
          client.status,
          new Date(client.updated).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(worksheetRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clients");
      XLSX.writeFile(wb, `clients-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error("Error exporting clients:", err);
      await swal({
        title: "Export failed",
        text: "Unable to export clients right now. Please try again.",
        icon: "error",
        confirmButtonColor: "#F46A45",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-6 py-6 pb-4">
        {/* Unified Search and Filter Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search by client name, application no, or entity..."
                className="w-full h-11 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <RefreshButton
                onClick={() => fetchClients(currentPage)}
                isLoading={loading}
                ariaLabel="Refresh clients"
              />
              <div className="relative group/export">
                <ExportDropdown
                  title="Export Clients"
                  isExporting={isExporting}
                  onInvalidDateRange={showInvalidDateRangeAlert}
                  onExportDateRange={(dateFrom, dateTo) =>
                    handleExportClients(true, dateFrom, dateTo)
                  }
                  onExportAll={() => handleExportClients(false)}
                />
              </div>

              <FilterDropdown
                onApply={handleApply}
                search={search}
                onSearchChange={handleSearchInputChange}
                filters={filters}
              />
            </div>
          </div>

          {/* Active Filter Chips */}
          <ActiveFilters filters={filters} onApply={handleApply} />
        </div>
      </div>

      <ClientsTable
        clientsData={clientsData}
        loading={loading}
        error={error}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        assigneeOptions={assigneeOptions}
        assignerOptions={assignerOptions}
        onAssigneeChange={handleAssigneeChange}
        onAssignerChange={handleAssignerChange}
        onDelete={handleDelete}
        onChat={handleChat}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        onPageChange={handlePageChange}
        currentAdminId={admin?.id ?? null}
        isSuperAdmin={isSuperAdmin}
        canAssignClients={hasPermission(PERMISSIONS.CLIENT_ASSIGN)}
        canDeleteClients={hasPermission(PERMISSIONS.CLIENT_DELETE)}
      />
    </div>
  );
}
