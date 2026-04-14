"use client";

import { AlertCircle, ChevronUp, Inbox } from "lucide-react";
import { Table, Pagination, EmptyState, Skeleton, cn } from "@heroui/react";
import type { SortDescriptor } from "@heroui/react";
import React from "react";

export type ColumnDef<T> = {
  id: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
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

  emptyMessage?: string;
  emptyIcon?: React.ElementType;
}

function getPaginationItems(currentPage: number, totalPages: number) {
  const siblingCount = 1;
  const totalPageNumbers = siblingCount + 5;
  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    return [
      ...Array.from({ length: leftItemCount }, (_, i) => i + 1),
      "...",
      totalPages,
    ];
  }
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    return [
      1,
      "...",
      ...Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + 1 + i,
      ),
    ];
  }
  return [
    1,
    "...",
    ...Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    ),
    "...",
    totalPages,
  ];
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
  emptyMessage = "No items found matching criteria.",
  emptyIcon: EmptyIcon = Inbox,
}: DataTableProps<T>) {
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
      <div className="p-5">
        <Table className="bg-white border text-sm border-gray-200 rounded-xl shadow-sm w-full overflow-hidden min-h-[650px]">
          <Table.ScrollContainer className="w-full overflow-x-auto">
            <Table.Content
              aria-label="Data Table"
              className="w-full text-left border-collapse"
              sortDescriptor={sortDescriptor}
              onSortChange={onSortChange}
            >
              <Table.Header className="bg-secondary border-b-2 border-gray-100">
                {columns.map((col, i) => (
                  <Table.Column
                    id={col.id}
                    allowsSorting={col.sortable}
                    isRowHeader={i === 0}
                    key={col.id}
                    className="px-5 py-3.5 font-semibold whitespace-nowrap uppercase tracking-wider text-sm"
                    defaultWidth="1fr"
                    minWidth={200}
                  >
                    {({ sortDirection }) => (
                      <SortableColumnHeader sortDirection={sortDirection}>
                        <button className="hover:text-primary-500">
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
                        {columns.map((col, j) => (
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
                    : data.map((row) => (
                        <Table.Row
                          key={getKey(row)}
                          className="hover:bg-primary-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                        >
                          {columns.map((col) => (
                            <Table.Cell
                              key={col.id}
                              className="px-5 py-4 align-middle text-gray-800"
                            >
                              {col.render
                                ? col.render(row)
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

          <Pagination>
            <Pagination.Content className="flex gap-1.5 items-center">
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={currentPage === 1}
                  onPress={() => onPageChange!(currentPage! - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                >
                  <Pagination.PreviousIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Pagination.Previous>
              </Pagination.Item>

              {getPaginationItems(currentPage!, totalPages!).map(
                (item, idx) => (
                  <Pagination.Item key={idx}>
                    {item === "..." ? (
                      <Pagination.Ellipsis className="px-2 text-gray-400 font-medium" />
                    ) : (
                      <Pagination.Link
                        isActive={currentPage === item}
                        onPress={() => onPageChange!(item as number)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          currentPage === item
                            ? "bg-[#F46A45] text-white shadow-sm hover:opacity-90"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {item}
                      </Pagination.Link>
                    )}
                  </Pagination.Item>
                ),
              )}

              <Pagination.Item>
                <Pagination.Next
                  isDisabled={currentPage === totalPages}
                  onPress={() => onPageChange!(currentPage! + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                >
                  <span className="hidden sm:inline">Next</span>
                  <Pagination.NextIcon className="w-4 h-4" />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      )}
    </>
  );
}
