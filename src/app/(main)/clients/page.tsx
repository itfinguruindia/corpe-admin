"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import ClientsTable, {
  Client,
  ITEMS_PER_PAGE,
} from "@/components/clients/ClientsTable";

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    opt: SearchSelectOption,
  ) => {
    try {
      await clientsApi.updateAssignee(appNo, opt.id);
      setClientsData((prev) =>
        prev.map((c) =>
          c.appNo === appNo
            ? { ...c, assigneeId: opt.id, assignee: opt.name }
            : c,
        ),
      );
    } catch {
      /* silent */
    }
  };

  const handleAssignerChange = async (
    appNo: string,
    opt: SearchSelectOption,
  ) => {
    try {
      await clientsApi.updateAssigner(appNo, opt.id);
      setClientsData((prev) =>
        prev.map((c) =>
          c.appNo === appNo
            ? { ...c, assignerId: opt.id, assigner: opt.name }
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

  return (
    <div className="w-full">
      {/* HEADER & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-6 py-6 pb-4">
        {/* Unified Search and Filter Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search by client name, application no, or entity..."
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none rounded-xl border border-gray-200 shadow-sm"
              />
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

            <div className="flex items-center gap-2 self-end">
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
      />
    </div>
  );
}
