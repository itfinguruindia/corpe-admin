"use client";

import { Eye, Trash2, MessageSquare } from "lucide-react";
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
  updated: string;
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
            row.status.toLowerCase().includes("pending") ||
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
      render: (row) => {
        const canDelete = canDeleteClientRow(
          row,
          currentAdminId,
          isSuperAdmin,
          canDeleteClients,
        );
        return (
        <div className="flex items-center gap-3">
          <Link
            href={`/clients/${row.appNo}`}
            className="cursor-pointer text-secondary hover:text-primary transition-colors"
            title="View Details"
          >
            <Eye size={20} />
          </Link>
          <button
            onClick={() => onChat(row.orgId)}
            className="cursor-pointer text-[#3D63A4] hover:text-[#FF6A3D] transition-colors"
            title="Chat with Client"
          >
            <MessageSquare size={20} />
          </button>
          {canDelete ? (
            <button
              onClick={() => onDelete(row.appNo)}
              className="cursor-pointer text-red-600 hover:text-red-800 transition-colors"
              title="Delete Client"
            >
              <Trash2 size={20} />
            </button>
          ) : null}
        </div>
        );
      },
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
