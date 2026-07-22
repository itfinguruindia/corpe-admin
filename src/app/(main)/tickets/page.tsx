"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Ticket as TicketIcon,
  Search,
} from "lucide-react";
import * as XLSX from "xlsx";
import { TicketApi } from "@/lib/api/tickets";
import type { Ticket, TicketStatus, TicketPriority } from "@/types/tickets";
import { Chip, SearchSelect, SearchSelectOption } from "@/components/ui";
import type { ChipVariant } from "@/components/ui/Chip";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import ExportDropdown from "@/components/ui/ExportDropdown";
import {
  Button,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { adminApi } from "@/lib/api";
import CustomSelect from "@/components/ui/CustomSelect";
import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";

const ITEMS_PER_PAGE = 10;

const StatusSelectOptions = [
  { id: "all", label: "All Status" },
  { id: "open", label: "Open" },
  { id: "under process", label: "Under Process" },
  { id: "resolved", label: "Resolved" },
];

const PrioritySelectOptions = [
  { id: "all", label: "All Priorities" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

const getStatusVariant = (status: TicketStatus): ChipVariant => {
  const variantMap: Record<TicketStatus, ChipVariant> = {
    open: "blue",
    "under process": "yellow",
    resolved: "gray",
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
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

const capitalizeFirst = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getStatusLabel = (status: string) =>
  StatusSelectOptions.find((opt) => opt.id === status)?.label ??
  capitalizeFirst(status);

export default function RaisedTicketsPage() {
  const { hasPermission } = usePermissions();
  const canEditTickets = hasPermission(PERMISSIONS.TICKET_EDIT);
  const canExportTickets = hasPermission(PERMISSIONS.TICKET_VIEW);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">(
    "all",
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const [assigneeOptions, setAssigneeOptions] = useState<SearchSelectOption[]>(
    [],
  );

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const response = await TicketApi.getAllTickets(
        currentPage,
        ITEMS_PER_PAGE,
        search,
        statusFilter,
        priorityFilter,
      );
      const admins = await adminApi.getAllAdmins();
      setTickets(response.tickets);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
      setAssigneeOptions(
        admins.map((admin: any) => ({ id: admin._id, name: admin.name })),
      );
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadTickets();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, search, statusFilter, priorityFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as any);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value as any);
    setCurrentPage(1);
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    if (!canEditTickets) return;
    try {
      await TicketApi.updateTicket({ ticketId, status });
      await loadTickets();
    } catch {
      /* silent */
    }
  };

  const handlePriorityChange = async (
    ticketId: string,
    priority: TicketPriority,
  ) => {
    if (!canEditTickets) return;
    try {
      await TicketApi.updateTicket({ ticketId, priority });
      await loadTickets();
    } catch {
      /* silent */
    }
  };

  const handleAssigneeChange = async (
    ticketId: string,
    opt: SearchSelectOption | null,
  ) => {
    if (!canEditTickets) return;
    try {
      await TicketApi.updateTicket({ ticketId, assignee: opt?.id || null });
      await loadTickets();
    } catch {
      /* silent */
    }
  };

  const handleExportTickets = async (
    withDateRange: boolean,
    dateFrom?: string,
    dateTo?: string,
  ) => {
    if (!canExportTickets) return;
    try {
      setIsExporting(true);
      let page = 1;
      let pages = 1;
      const allTickets: Ticket[] = [];
      while (page <= pages) {
        const res = await TicketApi.getAllTickets(
          page,
          100,
          search,
          statusFilter,
          priorityFilter,
        );
        allTickets.push(...res.tickets);
        pages = res.totalPages || 1;
        page += 1;
      }

      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const toDate = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;
      const rows =
        withDateRange && (fromDate || toDate)
          ? allTickets.filter((t) => {
              const created = t.createdOn ? new Date(t.createdOn) : null;
              if (!created || Number.isNaN(created.getTime())) return false;
              if (fromDate && created < fromDate) return false;
              if (toDate && created > toDate) return false;
              return true;
            })
          : allTickets;

      const wsData = [
        [
          "Application No.",
          "Subject",
          "Status",
          "Assignee",
          "Priority",
          "Created On",
          "Description",
        ],
        ...rows.map((t) => [
          t.applicationNo,
          t.subject,
          t.status,
          t.assignee?.name || "-",
          t.priority,
          t.createdOn ? new Date(t.createdOn).toLocaleString("en-IN") : "",
          t.description || "",
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tickets");
      XLSX.writeFile(wb, `tickets-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Failed to export tickets:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const columns: ColumnDef<Ticket>[] = [
    {
      id: "applicationNo",
      label: "Application No.",
      render: (row) => (
        <Link
          href={`/clients/${row.applicationNo}`}
          className="text-base font-medium text-[#FF6A3D]"
        >
          {row.applicationNo}
        </Link>
      ),
    },
    {
      id: "subject",
      label: "Subject",
      render: (row) => (
        <span className="text-base text-gray-700">{row.subject}</span>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (row) =>
        canEditTickets ? (
          <CustomSelect
            ariaLabel={`Status for ticket ${row.applicationNo || row.id}`}
            value={row.status}
            onChange={(value) =>
              handleStatusChange(row.id, value as TicketStatus)
            }
            options={StatusSelectOptions.filter((opt) => opt.id !== "all")}
            renderValue={(val) => (
              <Chip
                label={getStatusLabel(val)}
                variant={getStatusVariant(val as TicketStatus)}
              />
            )}
          />
        ) : (
          <Chip
            label={getStatusLabel(row.status)}
            variant={getStatusVariant(row.status)}
          />
        ),
    },
    {
      id: "assignee",
      label: "Assignee",
      render: (row) =>
        canEditTickets ? (
          <SearchSelect
            options={assigneeOptions}
            value={
              row.assignee
                ? { id: row.assignee._id, name: row.assignee.name }
                : null
            }
            onChange={(opt) => {
              handleAssigneeChange(row.id, opt);
            }}
            placeholder="Assignee"
          />
        ) : (
          <span className="text-base text-gray-700">
            {row.assignee?.name || "-"}
          </span>
        ),
    },
    {
      id: "priority",
      label: "Priority",
      render: (row) =>
        canEditTickets ? (
          <CustomSelect
            ariaLabel={`Priority for ticket ${row.applicationNo || row.id}`}
            value={row.priority}
            onChange={(value) =>
              handlePriorityChange(row.id, value as TicketPriority)
            }
            options={PrioritySelectOptions.filter((opt) => opt.id !== "all")}
            renderValue={(val) => (
              <Chip
                label={capitalizeFirst(val)}
                variant={getPriorityVariant(val as TicketPriority)}
              />
            )}
          />
        ) : (
          <Chip
            label={capitalizeFirst(row.priority)}
            variant={getPriorityVariant(row.priority)}
          />
        ),
    },
    {
      id: "createdOn",
      label: "Created On",
      render: (row) => (
        <span className="text-base text-gray-700">
          {formatDate(row.createdOn)}
        </span>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex justify-center">
          <Link
            href={`/tickets/${row.id}`}
            className="text-base font-medium text-gray-700 underline hover:text-secondary"
          >
            view
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="w-full">
        {/* HEADER & SEARCH TOOLBAR */}
        <div className="flex flex-col gap-6 py-6 pb-0 mb-4">
          <div className="grid grid-rows-3 md:grid-rows-2 lg:grid-rows-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-[auto_1fr_auto] items-center gap-4">
            <h1 className="text-4xl font-bold text-[#FF6A3D] text-left">
              Raised Tickets
            </h1>

            <div className="relative w-full md:w-64 lg:justify-self-end col-span-full md:col-[1/2] lg:col-[2/3] row-[3/4] md:row-[2/3] lg:row-[1/2]">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-[18px] -translate-y-1/2 text-gray-400" />
              <TextField
                value={search}
                onChange={handleSearchChange}
                name="searchTickets"
              >
                <Label className="sr-only">Search by application number</Label>
                <Input
                  placeholder="Search by Application No..."
                  className="w-full bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20 rounded-lg border border-gray-200"
                />
              </TextField>
            </div>

            <div className="w-full flex justify-between gap-2 col-span-full md:col-[2/3] lg:col-[3/4] row-[2/3] lg:row-[1/2]">
              <CustomSelect
                ariaLabel="Filter by status"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                options={StatusSelectOptions}
                renderValue={(val) =>
                  val === "all" ? (
                    "All Status"
                  ) : (
                    <Chip
                      label={getStatusLabel(val)}
                      variant={getStatusVariant(val as TicketStatus)}
                    />
                  )
                }
              />
              <CustomSelect
                ariaLabel="Filter by priority"
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                options={PrioritySelectOptions}
                renderValue={(val) =>
                  val === "all" ? (
                    "All Priorities"
                  ) : (
                    <Chip
                      label={capitalizeFirst(val)}
                      variant={getPriorityVariant(val as TicketPriority)}
                    />
                  )
                }
              />

              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span title="Refresh" className="inline-flex">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={loadTickets}
                    isDisabled={isLoading}
                    aria-label="Refresh tickets"
                    className="min-w-0 h-auto p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border shadow-sm border-gray-200 bg-white"
                  >
                    <RefreshCw
                      size={18}
                      className={isLoading ? "animate-spin" : ""}
                    />
                  </Button>
                </span>
                {canExportTickets && (
                  <ExportDropdown
                    title="Export Tickets"
                    isExporting={isExporting}
                    onInvalidDateRange={() =>
                      alert("From date cannot be after To date.")
                    }
                    onExportDateRange={(dateFrom, dateTo) =>
                      handleExportTickets(true, dateFrom, dateTo)
                    }
                    onExportAll={() => handleExportTickets(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <DataTable
          data={tickets}
          columns={columns}
          keyField="id"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          loading={isLoading}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          emptyMessage={
            statusFilter !== "all" || priorityFilter !== "all" || search
              ? "No tickets match the selected filters"
              : "No tickets raised yet"
          }
          emptyIcon={TicketIcon}
        />
      </div>
    </>
  );
}
