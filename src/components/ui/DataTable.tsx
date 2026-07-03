"use client";

import { AlertCircle, ChevronUp, Inbox, Settings2 } from "lucide-react";
import { Table, EmptyState, Skeleton, cn } from "@heroui/react";
import type { SortDescriptor } from "@heroui/react";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CustomPagination from "./Pagination";

const COLUMN_STORAGE_PREFIX = "corpe-admin:table-columns:";

function readStoredColumnIds(storageKey: string): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : null;
  } catch {
    return null;
  }
}

function writeStoredColumnIds(storageKey: string, columnIds: string[]) {
  if (typeof window === "undefined" || !columnIds.length) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(columnIds));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export type ColumnDef<T> = {
  id: string;
  label: string;
  sortable?: boolean;
  canHide?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
};

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyField: keyof T | ((row: T) => string | number);
  loading?: boolean;
  error?: string | null;

  sortDescriptor?: SortDescriptor;
  onSortChange?: (desc: SortDescriptor) => void;

  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  /** When true, shows Show/Hide Columns control and persists visibility in localStorage */
  showColumnVisibilityToggle?: boolean;
  columnVisibilityStorageKey?: string;

  emptyMessage?: string;
  emptyIcon?: React.ElementType;

  /** Override default min-height on the table container (default: min-h-[70vh]) */
  tableMinHeight?: string;
  /** Minimum column width in px (default: 200) */
  columnMinWidth?: number;
}

function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center justify-between">
      {children}
      {!!sortDirection && (
        <ChevronUp
          className={cn(
            "size-3 transform transition-transform duration-100 ease-out",
            sortDirection === "descending" ? "rotate-180" : "",
          )}
        />
      )}
    </span>
  );
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  loading = false,
  error = null,
  sortDescriptor,
  onSortChange,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  showColumnVisibilityToggle = false,
  columnVisibilityStorageKey,
  emptyMessage = "No items found matching criteria.",
  emptyIcon: EmptyIcon = Inbox,
  tableMinHeight = "min-h-[70vh]",
  columnMinWidth = 200,
}: DataTableProps<T>) {
  const [isColumnPanelOpen, setIsColumnPanelOpen] = useState(false);
  const hasLoadedFromStorage = useRef(false);
  const columnsSignature = useMemo(
    () => columns.map((col) => `${col.id}:${col.canHide !== false}`).join("|"),
    [columns],
  );
  const allColumnIds = useMemo(() => columns.map((col) => col.id), [columnsSignature]);
  const defaultVisibleColumnIds = useMemo(() => {
    const hideable = columns
      .filter((col) => col.canHide !== false)
      .map((col) => col.id);
    return hideable.length ? hideable : allColumnIds;
  }, [columnsSignature, allColumnIds]);

  const storageKey = useMemo(() => {
    const id =
      columnVisibilityStorageKey ||
      (typeof window !== "undefined" ? window.location.pathname : "default");
    return `${COLUMN_STORAGE_PREFIX}${id}`;
  }, [columnVisibilityStorageKey]);

  const resolveVisibleIds = (stored: string[] | null) => {
    if (!allColumnIds.length) return [];
    if (!stored?.length) return defaultVisibleColumnIds;
    const restored = stored.filter((id) => allColumnIds.includes(id));
    return restored.length ? restored : defaultVisibleColumnIds;
  };

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() =>
    resolveVisibleIds(readStoredColumnIds(storageKey)),
  );

  // Load saved column visibility from localStorage (client-only).
  useLayoutEffect(() => {
    if (!showColumnVisibilityToggle) return;
    hasLoadedFromStorage.current = false;
    setVisibleColumnIds(resolveVisibleIds(readStoredColumnIds(storageKey)));
    hasLoadedFromStorage.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showColumnVisibilityToggle, storageKey, columnsSignature]);

  // Persist to localStorage whenever the user changes visible columns.
  useEffect(() => {
    if (!showColumnVisibilityToggle) return;
    if (!hasLoadedFromStorage.current || !visibleColumnIds.length) return;
    writeStoredColumnIds(storageKey, visibleColumnIds);
  }, [showColumnVisibilityToggle, storageKey, visibleColumnIds]);

  const visibleColumns = useMemo(
    () =>
      showColumnVisibilityToggle
        ? columns.filter((col) => visibleColumnIds.includes(col.id))
        : columns,
    [columns, showColumnVisibilityToggle, visibleColumnIds],
  );

  const toggleColumn = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column || column.canHide === false) return;

    setVisibleColumnIds((prev) => {
      const isVisible = prev.includes(columnId);
      const next = isVisible
        ? prev.length <= 1
          ? prev
          : prev.filter((id) => id !== columnId)
        : [...prev, columnId];
      writeStoredColumnIds(storageKey, next);
      return next;
    });
  };

  const showPagination =
    currentPage !== undefined &&
    totalPages !== undefined &&
    totalItems !== undefined &&
    onPageChange &&
    !loading &&
    !error &&
    totalPages > 1;

  const getKey = (row: T) => {
    if (typeof keyField === "function") {
      return keyField(row);
    }
    return String(row[keyField]);
  };

  return (
    <>
      <div className="py-5">
        {showColumnVisibilityToggle && (
          <div className="mb-3 flex justify-end">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColumnPanelOpen((prev) => !prev)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <Settings2 className="size-4" />
                Show/Hide Columns
              </button>

              {isColumnPanelOpen && (
                <div className="absolute right-0 z-30 mt-2 max-h-80 w-64 overflow-auto rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Visible Columns
                  </p>
                  <div className="space-y-2">
                    {columns.map((col) => {
                      const isLocked = col.canHide === false;
                      const checked = visibleColumnIds.includes(col.id);
                      return (
                        <label
                          key={col.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50",
                            isLocked ? "cursor-not-allowed opacity-60 hover:bg-transparent" : "",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isLocked}
                            onChange={() => toggleColumn(col.id)}
                            className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Table
          className={cn(
            "bg-white border text-sm border-gray-200 rounded-xl shadow-sm w-full p-0 overflow-hidden",
            tableMinHeight,
          )}
        >
          <Table.ScrollContainer className="w-full overflow-x-auto">
            <Table.Content
              aria-label="Data Table"
              className="w-full text-left border-collapse"
              sortDescriptor={sortDescriptor}
              onSortChange={onSortChange}
            >
              <Table.Header className="bg-secondary border-b-2 border-gray-100">
                {visibleColumns.map((col, i) => (
                  <Table.Column
                    id={col.id}
                    allowsSorting={col.sortable}
                    isRowHeader={i === 0}
                    key={col.id}
                    className="px-5 py-3.5 font-semibold whitespace-nowrap uppercase tracking-wider text-sm"
                    defaultWidth="1fr"
                    minWidth={columnMinWidth}
                  >
                    {({ sortDirection }) => (
                      <SortableColumnHeader sortDirection={sortDirection}>
                        <button className="hover:text-primary-500 text-white">
                          {col.label}
                        </button>
                      </SortableColumnHeader>
                    )}
                  </Table.Column>
                ))}
              </Table.Header>

              <Table.Body
                className="divide-y divide-gray-100"
                renderEmptyState={() => {
                  if (error) {
                    return (
                      <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-3 text-center py-10">
                        <AlertCircle className="size-10 text-red-500 mb-2" />
                        <span className="text-lg font-semibold text-gray-900">
                          Failed to load payload
                        </span>
                        <span className="text-sm text-gray-500 max-w-md">
                          {error}
                        </span>
                      </EmptyState>
                    );
                  }
                  return (
                    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-3 text-center py-10">
                      <EmptyIcon className="size-10 text-gray-300 mb-2" />
                      <span className="text-sm font-medium text-gray-500">
                        {emptyMessage}
                      </span>
                    </EmptyState>
                  );
                }}
              >
                {loading
                  ? Array.from({ length: itemsPerPage }).map((_, i) => (
                      <Table.Row
                        key={`skeleton-${i}`}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        {visibleColumns.map((col, j) => (
                          <Table.Cell
                            key={`skeleton-${i}-${j}`}
                            className="px-5 py-4"
                          >
                            <Skeleton className="h-4 w-full max-w-32 rounded-md bg-gray-200" />
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))
                  : error
                    ? []
                    : data.map((row, index) => (
                        <Table.Row
                          key={getKey(row)}
                          className="hover:bg-primary-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                        >
                          {visibleColumns.map((col) => (
                            <Table.Cell
                              key={col.id}
                              className="px-5 py-4 align-top text-gray-800"
                            >
                              {col.render
                                ? col.render(row, index)
                                : String((row as any)[col.id]) || ""}
                            </Table.Cell>
                          ))}
                        </Table.Row>
                      ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      {showPagination && (
        <div className="mt-6 pb-6 flex flex-col md:flex-row justify-between items-center px-4 gap-4">
          <div className="text-sm font-medium text-gray-500">
            Showing{" "}
            <span className="text-gray-900">
              {(currentPage! - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900">
              {Math.min(currentPage! * itemsPerPage, totalItems!)}
            </span>{" "}
            of <span className="text-gray-900">{totalItems}</span> results
          </div>

          <CustomPagination
            currentPage={currentPage!}
            totalPages={totalPages!}
            onPageChange={onPageChange!}
          />
        </div>
      )}
    </>
  );
}
