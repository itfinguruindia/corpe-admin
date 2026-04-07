"use client";

import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildFiltersFromParams, useDebouncedCallback } from "@/utils/helpers";
import { clientsApi } from "@/lib/api";
import { adminApi } from "@/lib/api/admin";
import Pagination from "@/components/ui/Pagination";
import useSwal from "@/utils/useSwal";
import FilterDropdown, { Filters } from "@/components/ui/FilterDropdown/index";
import { SearchSelect, SearchSelectOption } from "@/components/ui/SearchSelect";
import {
  defaultStatus,
  defaultEntityType,
  defaultDateRange,
} from "@/components/ui/FilterDropdown/defaults";
import { fromQueryValue } from "@/components/ui/FilterDropdown/helpers";

interface Client {
  appNo: string;
  client: string;
  entity: string;
  assigneeId: string | null;
  assignee: string;
  assignerId: string | null;
  assigner: string;
  status: string;
  updated: string;
}

export default function ClientsPage() {
  const searchParams = useSearchParams();
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
  const itemsPerPage = 10;
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
        itemsPerPage,
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
    // Pass newFilters directly to avoid stale state
    fetchClients(1, newFilters);
  };

  return (
    <div className="w-full">
      {/* ORANGE TOOLBAR */}
      <div className="flex h-16 items-center justify-between bg-[#F46A45] px-6 text-white">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">Latest</span>
          {/* Search Bar */}
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder="Search clients..."
            className="rounded-lg px-3 py-1.5 text-black text-base focus:outline-none focus:ring-2 focus:ring-white/70 bg-white/90 placeholder:text-gray-400 min-w-55"
            style={{ minWidth: 180 }}
          />
        </div>
        <div className="flex items-center gap-4">
          <FilterDropdown
            onApply={handleApply}
            search={search}
            onSearchChange={handleSearchInputChange}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-6 p-5 gap-">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-[160px_140px_170px_140px_140px_80px_120px_100px] gap-x-6 border-b border-black pb-2 text-[20px] font-bold text-secondary">
          <div>Application No.</div>
          <div>Client Name</div>
          <div>Entity Type</div>
          <div>Assignee</div>
          <div>Assigner</div>
          <div>Status</div>
          <div>Last Update</div>
          <div>Actions</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-8 text-center text-lg text-gray-500">
            Loading clients...
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-8 text-center text-lg text-red-500">{error}</div>
        )}

        {/* Empty State */}
        {!loading && !error && clientsData.length === 0 && (
          <div className="py-8 text-center text-lg text-gray-500">
            No clients found.
          </div>
        )}

        {/* TABLE ROWS */}
        {!loading &&
          !error &&
          clientsData.length > 0 &&
          clientsData.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[160px_140px_170px_140px_140px_80px_120px_100px] gap-x-6 border-b border-black py-4 text-lg font-normal text-gray-900"
            >
              <Link
                href={`/clients/${row.appNo}`}
                className="text-primary cursor-pointer font-semibold text-xl"
              >
                {row.appNo}
              </Link>
              <div className="text-lg">{row.client}</div>
              <div>{row.entity}</div>
              <div>
                <SearchSelect
                  options={assigneeOptions}
                  value={
                    row.assigneeId
                      ? { id: row.assigneeId, name: row.assignee }
                      : null
                  }
                  onChange={async (opt) => {
                    if (!opt) return;
                    try {
                      await clientsApi.updateAssignee(row.appNo, opt.id);
                      setClientsData((prev) =>
                        prev.map((c) =>
                          c.appNo === row.appNo
                            ? { ...c, assigneeId: opt.id, assignee: opt.name }
                            : c,
                        ),
                      );
                    } catch {
                      /* silent */
                    }
                  }}
                  placeholder="Assignee"
                />
              </div>
              <div>
                <SearchSelect
                  options={assignerOptions}
                  value={
                    row.assignerId
                      ? { id: row.assignerId, name: row.assigner }
                      : null
                  }
                  onChange={async (opt) => {
                    if (!opt) return;
                    try {
                      await clientsApi.updateAssigner(row.appNo, opt.id);
                      setClientsData((prev) =>
                        prev.map((c) =>
                          c.appNo === row.appNo
                            ? { ...c, assignerId: opt.id, assigner: opt.name }
                            : c,
                        ),
                      );
                    } catch {
                      /* silent */
                    }
                  }}
                  placeholder="Assigner"
                />
              </div>
              <div>{row.status}</div>
              <div className="text-sm">
                {new Date(row.updated).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/clients/${row.appNo}`}
                  className="cursor-pointer text-secondary hover:text-primary transition-colors"
                  title="View Details"
                >
                  <Eye size={20} />
                </Link>
                <button
                  onClick={() => handleDelete(row.appNo)}
                  className="cursor-pointer text-red-600 hover:text-red-800 transition-colors"
                  title="Delete Client"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-6 pb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <div className="text-center mt-2 text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, total)} of {total} clients
          </div>
        </div>
      )}
    </div>
  );
}
