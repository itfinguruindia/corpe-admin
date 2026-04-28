"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  FileDown,
  Ticket as TicketIcon,
  Search,
} from "lucide-react";
import { TicketApi } from "@/lib/api/tickets";
import type { Ticket, TicketStatus, TicketPriority } from "@/types/tickets";
import { Chip, SearchSelect, SearchSelectOption } from "@/components/ui";
import type { ChipVariant } from "@/components/ui/Chip";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Drawer, useOverlayState } from "@heroui/react";
import { adminApi } from "@/lib/api";
import CustomSelect from "@/components/ui/CustomSelect";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

const StatusSelectOptions = [
  { id: "all", label: "All Status" },
  { id: "open", label: "Open" },
  { id: "close", label: "Close" },
  { id: "resolving", label: "Resolving" },
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

export default function RaisedTicketsPage() {
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

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [comment, setComment] = useState("");
  const [assigneeOptions, setAssigneeOptions] = useState<SearchSelectOption[]>(
    [],
  );
  const drawerState = useOverlayState();

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
    try {
      await TicketApi.updateTicket({ ticketId, assignee: opt?.id || null });
      await loadTickets();
    } catch {
      /* silent */
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
      id: "category",
      label: "Category",
      render: (row) => (
        <span className="text-base text-gray-700">{row.category}</span>
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
      render: (row) => (
        <CustomSelect
          value={row.status}
          onChange={(value) =>
            handleStatusChange(row.id, value as TicketStatus)
          }
          options={StatusSelectOptions.filter((opt) => opt.id !== "all")}
          renderValue={(val) => (
            <Chip
              label={capitalizeFirst(val)}
              variant={getStatusVariant(val as TicketStatus)}
            />
          )}
        />
      ),
    },
    {
      id: "assignee",
      label: "Assignee",
      render: (row) => (
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
      ),
    },
    {
      id: "priority",
      label: "Priority",
      render: (row) => (
        <CustomSelect
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
          <button
            type="button"
            onClick={() => {
              setSelectedTicket(row);
              drawerState.open();
            }}
            className="text-base font-medium text-gray-700 underline hover:text-secondary transition-colors"
          >
            <span>view</span>
          </button>
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

            <div className="relative lg:justify-self-end col-span-full md:col-[1/2] lg:col-[2/3] row-[3/4] md:row-[2/3] lg:row-[1/2]">
              <input
                type="text"
                placeholder="Search by Application No..."
                value={search}
                onChange={handleSearchChange}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20 focus:border-[#FF6A3D] text-sm text-gray-900 bg-white"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
            </div>

            <div className="w-full flex justify-between gap-2 col-span-full md:col-[2/3] lg:col-[3/4] row-[2/3] lg:row-[1/2]">
              <CustomSelect
                value={statusFilter}
                onChange={handleStatusFilterChange}
                options={StatusSelectOptions}
                renderValue={(val) =>
                  val === "all" ? (
                    "All Status"
                  ) : (
                    <Chip
                      label={capitalizeFirst(val)}
                      variant={getStatusVariant(val as TicketStatus)}
                    />
                  )
                }
              />
              <CustomSelect
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
                <button
                  className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border shadow-sm border-gray-200 bg-white"
                  title="Refresh"
                  type="button"
                  onClick={loadTickets}
                  disabled={isLoading}
                >
                  <RefreshCw
                    size={18}
                    className={isLoading ? "animate-spin" : ""}
                  />
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

      <Drawer state={drawerState}>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="bg-white border-l shadow-2xl w-full max-w-md">
              <Drawer.CloseTrigger className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors" />
              <Drawer.Header className="border-b py-2">
                <Drawer.Heading className="text-2xl font-bold text-secondary">
                  Ticket Details
                </Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="overflow-y-auto">
                {selectedTicket ? (
                  <div className="flex flex-col justify-between h-full gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Subject
                        </h3>
                        <p className="text-lg font-medium text-gray-900">
                          {selectedTicket.subject}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Description
                        </h3>
                        <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
                          {selectedTicket.description ||
                            "No description provided."}
                        </div>
                      </div>
                    </div>

                    {/* Comment Section */}
                    <div className="space-y-4">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comment on the issue here..."
                        rows={6}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20"
                      />
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 rounded-lg bg-[#FFE5DD] px-6 py-2 text-base font-medium text-secondary transition-all hover:bg-[#ffd5c5]">
                          Reply via Email
                        </button>
                        <button className="flex items-center gap-2 rounded-lg px-6 py-2 text-base font-medium text-secondary transition-all hover:bg-gray-100">
                          Reply via Dashboard Chat
                        </button>
                        <button className="flex items-center gap-2 rounded-lg px-6 py-2 text-base font-medium text-secondary transition-all hover:bg-gray-100">
                          Call Back
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No ticket selected
                  </div>
                )}
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
