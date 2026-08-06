"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Eye, Trash2, MessageSquare, AlertOctagon, RotateCcw, History, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { SortDescriptor } from "@heroui/react";
import { SearchSelect, SearchSelectOption } from "@/components/ui/SearchSelect";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export interface Client {
  appNo: string;
  orgId: string;
  client: string;
  email?: string;
  entity: string;
  assigneeId: string | null;
  assignee: string;
  assignerId: string | null;
  assigner: string;
  status: string;
  discontinueReason?: string | null;
  restoreReason?: string | null;
  previousCompanyStatus?: string | null;
  discontinueHistory?: any[];
  updated: string;
  created: string;
}

export const ITEMS_PER_PAGE = 10;

interface ClientsTableProps {
  clientsData: Client[];
  loading: boolean;
  error: string | null;
  sortDescriptor: SortDescriptor;
  onSortChange: (desc: SortDescriptor) => void;
  assigneeOptions: SearchSelectOption[];
  assignerOptions: SearchSelectOption[];
  onAssigneeChange: (appNo: string, opt: SearchSelectOption | null) => void;
  onAssignerChange: (appNo: string, opt: SearchSelectOption | null) => void;
  onDelete: (appNo: string) => void;
  onChat: (orgId: string) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  currentAdminId?: string | null;
  isSuperAdmin?: boolean;
  canAssignClients?: boolean;
  canDeleteClients?: boolean;
  isDiscontinuedView?: boolean;
  onDiscontinue?: (client: Client) => void;
  onRestore?: (client: Client) => void;
  onViewHistory?: (client: Client) => void;
}

function canManageClientAssignment(
  isSuperAdmin: boolean,
  canAssignClients: boolean,
): boolean {
  if (isSuperAdmin) return true;
  return canAssignClients;
}

function canDeleteClientRow(
  _row: Client,
  _currentAdminId: string | null | undefined,
  isSuperAdmin: boolean,
  canDeleteClients: boolean,
): boolean {
  if (isSuperAdmin) return true;
  return canDeleteClients;
}

function RowActionsCell({
  row,
  currentAdminId,
  isSuperAdmin,
  canDeleteClients,
  isDiscontinuedView,
  onChat,
  onDiscontinue,
  onRestore,
  onViewHistory,
  onDelete,
}: {
  row: Client;
  currentAdminId: string | null;
  isSuperAdmin: boolean;
  canDeleteClients: boolean;
  isDiscontinuedView: boolean;
  onChat: (orgId: string) => void;
  onDiscontinue?: (client: Client) => void;
  onRestore?: (client: Client) => void;
  onViewHistory?: (client: Client) => void;
  onDelete: (appNo: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number; openUpward: boolean }>({
    top: 0,
    right: 0,
    openUpward: false,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canDelete = canDeleteClientRow(
    row,
    currentAdminId,
    isSuperAdmin,
    canDeleteClients,
  );

  const toggleMenu = () => {
    if (!menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const openUpward = spaceBelow < 200;

      setMenuPos({
        top: openUpward ? rect.top - 6 : rect.bottom + 6,
        right: Math.max(12, window.innerWidth - rect.right),
        openUpward,
      });
    }
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (menuOpen) setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [menuOpen]);

  return (
    <div className="flex items-center gap-1.5">
      {/* View Details button */}
      <Link
        href={`/clients/${row.appNo}`}
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition flex items-center justify-center shadow-xs"
        title="View Application Details"
      >
        <Eye size={16} />
      </Link>

      {/* Chat with Client button */}
      <button
        type="button"
        onClick={() => onChat(row.orgId)}
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:text-[#FF6A3D] hover:bg-orange-50 dark:hover:bg-slate-800 transition flex items-center justify-center shadow-xs"
        title="Chat with Client"
      >
        <MessageSquare size={16} />
      </button>

      {/* More Actions Dropdown Toggle */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className={`w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center shadow-xs ${
          menuOpen ? "bg-slate-100 dark:bg-slate-800 text-slate-900 border-slate-400" : ""
        }`}
        title="More actions"
      >
        <MoreVertical size={16} />
      </button>

      {/* Floating Dropdown Menu via Portal */}
      {menuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                right: `${menuPos.right}px`,
                ...(menuPos.openUpward
                  ? { bottom: `${window.innerHeight - menuPos.top}px` }
                  : { top: `${menuPos.top}px` }),
              }}
              className="z-[9999] w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
            >
              {onViewHistory && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onViewHistory(row);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <History size={15} className="text-slate-400 shrink-0" />
                  <div className="text-left">
                    <span className="block font-semibold">Audit Logs</span>
                    <span className="block text-[10px] text-slate-400">View discontinue/restore history</span>
                  </div>
                </button>
              )}

              {isDiscontinuedView ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onRestore?.(row);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                >
                  <RotateCcw size={15} className="shrink-0" />
                  <div className="text-left">
                    <span className="block font-semibold">Restore Application</span>
                    <span className="block text-[10px] text-emerald-600/70">Revert to last active status</span>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDiscontinue?.(row);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                >
                  <AlertOctagon size={15} className="shrink-0" />
                  <div className="text-left">
                    <span className="block font-semibold">Discontinue Application</span>
                    <span className="block text-[10px] text-rose-600/70">Pause app & block client access</span>
                  </div>
                </button>
              )}

              {canDelete && (
                <>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(row.appNo);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                  >
                    <Trash2 size={15} className="shrink-0" />
                    <span className="font-semibold">Delete Client</span>
                  </button>
                </>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export default function ClientsTable({
  clientsData,
  loading,
  error,
  sortDescriptor,
  onSortChange,
  assigneeOptions,
  assignerOptions,
  onAssigneeChange,
  onAssignerChange,
  onDelete,
  onChat,
  currentPage,
  totalPages,
  total,
  onPageChange,
  currentAdminId = null,
  isSuperAdmin = false,
  canAssignClients = false,
  canDeleteClients = false,
  isDiscontinuedView = false,
  onDiscontinue,
  onRestore,
  onViewHistory,
}: ClientsTableProps) {
  const columns: ColumnDef<Client>[] = [
    {
      id: "appNo",
      label: "Application No.",
      sortable: false,
      render: (row) => (
        <Link
          href={`/clients/${row.appNo}`}
          className="text-primary-600 hover:text-primary-700 transition-colors cursor-pointer font-semibold"
        >
          {row.appNo}
        </Link>
      ),
    },
    {
      id: "client",
      label: "Client Name",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <span className="font-medium whitespace-nowrap block">{row.client}</span>
          {row.email ? (
            <span className="text-xs text-gray-500 block truncate max-w-[220px]">
              {row.email}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "entity",
      label: "Entity Type",
      sortable: true,
      render: (row) => <span className="text-gray-600 whitespace-nowrap">{row.entity}</span>,
    },
    {
      id: "assignee",
      label: "Assignee",
      sortable: false,
      render: (row) => {
        const canAssign = canManageClientAssignment(
          isSuperAdmin,
          canAssignClients,
        );
        return (
        <div className="min-w-[200px]">
          <SearchSelect
            options={assigneeOptions}
            value={
              row.assigneeId ? { id: row.assigneeId, name: row.assignee } : null
            }
            onChange={(opt) => {
              if (!canAssign) return;
              onAssigneeChange(row.appNo, opt);
            }}
            placeholder="Assignee"
            disabled={!canAssign}
          />
        </div>
        );
      },
    },
    {
      id: "assigner",
      label: "Assigner",
      sortable: false,
      render: (row) => {
        const canAssign = canManageClientAssignment(
          isSuperAdmin,
          canAssignClients,
        );
        return (
        <div className="min-w-[200px]">
          <SearchSelect
            options={assignerOptions}
            value={
              row.assignerId ? { id: row.assignerId, name: row.assigner } : null
            }
            onChange={(opt) => {
              if (!canAssign) return;
              onAssignerChange(row.appNo, opt);
            }}
            placeholder="Assigner"
            disabled={!canAssign}
          />
        </div>
        );
      },
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            row.status.toLowerCase() === "discontinued"
              ? "bg-rose-100 text-rose-800"
              : row.status.toLowerCase().includes("pending") ||
                row.status.toLowerCase().includes("progress")
              ? "bg-orange-100 text-orange-800"
              : row.status.toLowerCase().includes("completed") ||
                row.status.toLowerCase().includes("success")
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "created",
      label: "Registration Date",
      sortable: true,
      render: (row) => (
        <span className="text-gray-500 text-sm whitespace-nowrap">
          {new Date(row.created || row.updated).toLocaleString("en-IN", {
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
      id: "updated",
      label: "Last Update",
      sortable: true,
      render: (row) => (
        <span className="text-gray-500 text-sm whitespace-nowrap">
          {new Date(row.updated).toLocaleString("en-IN", {
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
      id: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <RowActionsCell
          row={row}
          currentAdminId={currentAdminId}
          isSuperAdmin={isSuperAdmin}
          canDeleteClients={canDeleteClients}
          isDiscontinuedView={isDiscontinuedView}
          onChat={onChat}
          onDiscontinue={onDiscontinue}
          onRestore={onRestore}
          onViewHistory={onViewHistory}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <DataTable<Client>
      data={clientsData}
      columns={columns}
      showColumnVisibilityToggle
      columnVisibilityStorageKey="clients"
      keyField="appNo"
      loading={loading}
      error={error}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={total}
      itemsPerPage={ITEMS_PER_PAGE}
      onPageChange={onPageChange}
    />
  );
}
