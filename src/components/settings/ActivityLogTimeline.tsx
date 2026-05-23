"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  FilterX,
  History,
  LogIn,
  LogOut,
  MessageSquare,
  Shield,
  Trash2,
  AlertTriangle,
  ImageIcon,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityLog, ActivityLogType } from "@/types/activityLog";
import { Chip, type ChipVariant } from "@/components/ui/Chip";
import { Skeleton } from "@heroui/react";

const formatTime = (value: string) => {
  try {
    return new Date(value).toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

const formatRelativeTime = (value: string) => {
  try {
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return null;
  } catch {
    return null;
  }
};

const formatDateHeader = (value: string) => {
  try {
    const d = new Date(value);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    const dateStr = d.toLocaleDateString("en-GB", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return dateStr;
  } catch {
    return value;
  }
};

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name[0] || "?").toUpperCase();
};

const avatarColor = (name: string) => {
  const colors = [
    "#3D63A4",
    "#F36541",
    "#157A6E",
    "#8B5CF6",
    "#D97706",
    "#0891B2",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
};

type IconConfig = {
  Icon: LucideIcon;
  bg: string;
  iconColor: string;
  ring: string;
};

const getTimelineIcon = (type: ActivityLogType, status: string): IconConfig => {
  if (status === "failed") {
    return {
      Icon: AlertTriangle,
      bg: "bg-red-500",
      iconColor: "text-white",
      ring: "ring-red-100",
    };
  }
  switch (type) {
    case "login":
      return {
        Icon: LogIn,
        bg: "bg-[#3D63A4]",
        iconColor: "text-white",
        ring: "ring-blue-100",
      };
    case "logout":
      return {
        Icon: LogOut,
        bg: "bg-slate-500",
        iconColor: "text-white",
        ring: "ring-slate-100",
      };
    case "login_failed":
      return {
        Icon: AlertTriangle,
        bg: "bg-amber-500",
        iconColor: "text-white",
        ring: "ring-amber-100",
      };
    case "delete":
      return {
        Icon: Trash2,
        bg: "bg-gray-500",
        iconColor: "text-white",
        ring: "ring-gray-100",
      };
    case "permission_change":
      return {
        Icon: Shield,
        bg: "bg-amber-800",
        iconColor: "text-white",
        ring: "ring-amber-100",
      };
    case "create":
    case "approve":
      return {
        Icon: FileText,
        bg: "bg-emerald-600",
        iconColor: "text-white",
        ring: "ring-emerald-100",
      };
    case "upload":
    case "download":
      return {
        Icon: ImageIcon,
        bg: "bg-emerald-600",
        iconColor: "text-white",
        ring: "ring-emerald-100",
      };
    case "reject":
      return {
        Icon: AlertTriangle,
        bg: "bg-red-400",
        iconColor: "text-white",
        ring: "ring-red-100",
      };
    default:
      return {
        Icon: MessageSquare,
        bg: "bg-[#3D63A4]/80",
        iconColor: "text-white",
        ring: "ring-blue-50",
      };
  }
};

const getStatusVariant = (status: string): ChipVariant => {
  const map: Record<string, ChipVariant> = {
    success: "green",
    failed: "red",
    warning: "yellow",
  };
  return map[status] || "gray";
};

const getSubtext = (log: ActivityLog): string => {
  if (log.errorDetails) return log.errorDetails;
  if (log.status === "failed") return "Action failed";
  if (log.status === "warning") return "Completed with warnings";
  if (log.entityType)
    return `${formatLabel(log.entityType)}${log.entityId ? ` · ${log.entityId.slice(-8)}` : ""}`;
  if (log.apiEndpoint) {
    const path = log.apiEndpoint.replace(/^\/api/, "");
    return `${log.requestMethod || "HTTP"} ${path}`;
  }
  return formatLabel(log.activityType);
};

function groupByDate(
  logs: ActivityLog[],
): { dateKey: string; logs: ActivityLog[] }[] {
  const map = new Map<string, ActivityLog[]>();
  for (const log of logs) {
    const key = new Date(log.createdAt).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(log);
  }
  return Array.from(map.entries()).map(([dateKey, items]) => ({
    dateKey,
    logs: items,
  }));
}

function DiffPreview({
  oldValues,
  newValues,
}: {
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}) {
  const keys = useMemo(() => {
    const set = new Set<string>();
    if (oldValues) Object.keys(oldValues).forEach((k) => set.add(k));
    if (newValues) Object.keys(newValues).forEach((k) => set.add(k));
    return Array.from(set).slice(0, 6);
  }, [oldValues, newValues]);

  if (keys.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      {keys.map((key) => (
        <div
          key={key}
          className="grid grid-cols-[100px_1fr] gap-2 text-xs rounded-md overflow-hidden border border-gray-100"
        >
          <span className="bg-gray-50 px-2 py-1.5 font-medium text-gray-600 truncate">
            {key}
          </span>
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {oldValues?.[key] !== undefined && (
              <span className="flex-1 px-2 py-1.5 bg-red-50/80 text-red-800 line-through decoration-red-300/60 truncate">
                {String(oldValues[key])}
              </span>
            )}
            {newValues?.[key] !== undefined && (
              <span className="flex-1 px-2 py-1.5 bg-emerald-50/80 text-emerald-800 font-medium truncate">
                {String(newValues[key])}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelinePagination({
  currentPage,
  totalPages,
  loading,
  onPageChange,
  position,
}: {
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  position: "top" | "bottom";
}) {
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const max = 7;
    if (totalPages <= max) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={`Activity log pagination ${position}`}
      className={`flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-4 py-4 ${
        position === "top"
          ? "border-b border-gray-100 bg-gradient-to-b from-slate-50/80 to-white"
          : "border-t border-gray-100 bg-slate-50/40"
      }`}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || loading}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#3D63A4] transition-colors hover:bg-[#3D63A4]/10 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline">Newer</span>
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              disabled={loading}
              aria-current={currentPage === page ? "page" : undefined}
              className={`min-h-9 min-w-9 rounded-lg text-sm font-medium transition-all ${
                currentPage === page
                  ? "bg-[#3D63A4] text-white shadow-md shadow-[#3D63A4]/25 scale-105"
                  : "text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#3D63A4] transition-colors hover:bg-[#3D63A4]/10 disabled:pointer-events-none disabled:opacity-40"
      >
        <span className="hidden sm:inline">Older</span>
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

interface ActivityLogTimelineProps {
  logs: ActivityLog[];
  loading?: boolean;
  error?: string | null;
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onOpenDetail: (log: ActivityLog) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export default function ActivityLogTimeline({
  logs,
  loading,
  error,
  currentPage,
  totalPages,
  totalItems = 0,
  onPageChange,
  onOpenDetail,
  onClearFilters,
  hasActiveFilters,
}: ActivityLogTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => groupByDate(logs), [logs]);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-10 text-center">
        <AlertTriangle className="mx-auto size-10 text-red-400 mb-3" />
        <p className="text-red-800 font-medium">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-[#3D63A4] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
      <TimelinePagination
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        onPageChange={onPageChange}
        position="top"
      />

      <div className="relative min-h-[280px]">
        {loading && logs.length > 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <div className="h-8 w-8 rounded-full border-2 border-[#3D63A4] border-t-transparent animate-spin" />
          </div>
        )}

        <div className="px-4 sm:px-8 py-6 sm:py-8">
          {loading && logs.length === 0 ? (
            <div className="space-y-10">
              {[1, 2].map((g) => (
                <div key={g}>
                  <Skeleton className="h-6 w-40 mb-6 rounded-lg" />
                  <div className="space-y-6 pl-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-5 w-14 shrink-0 rounded" />
                        <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                        <Skeleton className="h-28 flex-1 rounded-xl" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F6FAFF] border border-gray-100">
                <History className="size-8 text-[#3D63A4]/40" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No activity found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">
                {hasActiveFilters
                  ? "Nothing matches your current filters. Try adjusting or clearing them."
                  : "Actions performed in the admin panel will appear here."}
              </p>
              {hasActiveFilters && onClearFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#3D63A4] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#345589] transition-colors"
                >
                  <FilterX size={16} />
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {grouped.map(({ dateKey, logs: dayLogs }) => (
                <section key={dateKey} className="relative">
                  <div className="sticky top-0 z-10 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 mb-2 bg-white/90 backdrop-blur-md border-b border-gray-100/80 flex items-center justify-between gap-3">
                    <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                      {formatDateHeader(dayLogs[0].createdAt)}
                    </h2>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {dayLogs.length} {dayLogs.length === 1 ? "event" : "events"}
                    </span>
                  </div>

                  <div className="relative ml-0 sm:ml-2">
                    <div
                      className="absolute left-[52px] sm:left-[108px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#3D63A4]/20 via-gray-200 to-transparent"
                      aria-hidden
                    />

                    <ul className="space-y-1">
                      {dayLogs.map((log, index) => {
                        const { Icon, bg, iconColor, ring } = getTimelineIcon(
                          log.activityType,
                          log.status,
                        );
                        const expanded = expandedIds.has(log._id);
                        const hasDiff =
                          Boolean(
                            log.oldValues &&
                              Object.keys(log.oldValues).length,
                          ) ||
                          Boolean(
                            log.newValues &&
                              Object.keys(log.newValues).length,
                          );
                        const hasDetails = hasDiff || Boolean(log.errorDetails);
                        const relative = formatRelativeTime(log.createdAt);

                        return (
                          <li
                            key={log._id}
                            className="relative animate-in fade-in slide-in-from-bottom-2 duration-300"
                            style={{
                              animationDelay: `${Math.min(index, 8) * 40}ms`,
                              animationFillMode: "backwards",
                            }}
                          >
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 py-3 sm:py-4 group">
                              <div className="flex sm:w-[100px] shrink-0 items-center sm:items-start justify-between sm:justify-end sm:flex-col sm:pt-3 gap-1 pl-1 sm:pl-0">
                                <time
                                  className="text-xs sm:text-sm font-medium text-gray-500 tabular-nums"
                                  dateTime={log.createdAt}
                                >
                                  {formatTime(log.createdAt)}
                                </time>
                                {relative && (
                                  <span className="text-[10px] sm:text-xs text-gray-400">
                                    {relative}
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-3 sm:gap-4 flex-1 min-w-0 pl-12 sm:pl-0">
                                <div className="absolute left-[36px] sm:left-[92px] z-10 -translate-x-1/2">
                                  <div
                                    className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full ring-4 ${ring} ${bg} shadow-sm transition-transform group-hover:scale-110`}
                                  >
                                    <Icon
                                      size={18}
                                      className={iconColor}
                                      strokeWidth={2}
                                    />
                                  </div>
                                </div>

                                <article className="flex-1 min-w-0">
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onOpenDetail(log)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        onOpenDetail(log);
                                      }
                                    }}
                                    className={`w-full text-left rounded-xl border bg-white transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D63A4]/40 focus-visible:ring-offset-2 ${
                                      expanded
                                        ? "border-[#3D63A4]/25 shadow-md ring-1 ring-[#3D63A4]/10"
                                        : "border-gray-200/90 shadow-sm hover:border-[#3D63A4]/20 hover:shadow-md"
                                    }`}
                                  >
                                    <div className="p-4 sm:p-5">
                                      <div className="flex gap-3 sm:gap-4">
                                        <div
                                          className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-inner"
                                          style={{
                                            backgroundColor: avatarColor(
                                              log.adminName,
                                            ),
                                          }}
                                        >
                                          {getInitials(log.adminName)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="font-semibold text-gray-900 text-[15px]">
                                              {log.adminName}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                              ·
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {log.isSuperAdmin
                                                ? "Super Admin"
                                                : log.roleName || "Admin"}
                                            </span>
                                          </div>

                                          <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center rounded-md bg-[#3D63A4]/10 px-2 py-0.5 text-xs font-semibold text-[#3D63A4]">
                                              {log.module}
                                            </span>
                                            <Chip
                                              label={formatLabel(log.status)}
                                              variant={getStatusVariant(
                                                log.status,
                                              )}
                                            />
                                            <span className="text-xs text-gray-400 capitalize">
                                              {formatLabel(log.activityType)}
                                            </span>
                                          </div>

                                          <p className="mt-2.5 text-sm text-gray-700 leading-relaxed">
                                            {log.description}
                                          </p>

                                          <p className="mt-1.5 text-xs text-gray-500 font-mono truncate max-w-full">
                                            {getSubtext(log)}
                                          </p>

                                          {expanded && hasDetails && (
                                            <div
                                              className="mt-4 pt-4 border-t border-gray-100"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {log.errorDetails && (
                                                <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                                                  {log.errorDetails}
                                                </p>
                                              )}
                                              <DiffPreview
                                                oldValues={log.oldValues}
                                                newValues={log.newValues}
                                              />
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                          {hasDetails && (
                                            <button
                                              type="button"
                                              onClick={(e) =>
                                                toggleExpand(e, log._id)
                                              }
                                              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                              aria-expanded={expanded}
                                              aria-label={
                                                expanded
                                                  ? "Collapse"
                                                  : "Show changes"
                                              }
                                            >
                                              <ChevronDown
                                                size={20}
                                                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                                              />
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onOpenDetail(log);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#FF6A3D] hover:bg-[#FF6A3D]/10 transition-colors"
                                          >
                                            View details
                                            <ExternalLink size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {(totalPages > 1 || totalItems > 0) && !loading && logs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-slate-50/50 text-xs text-gray-500">
          <span>
            Showing page {currentPage} of {totalPages}
            {totalItems > 0 && (
              <>
                {" "}
                · {totalItems.toLocaleString()} total entries
              </>
            )}
          </span>
        </div>
      )}

      <TimelinePagination
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        onPageChange={onPageChange}
        position="bottom"
      />
    </div>
  );
}
