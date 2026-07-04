"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  FileDown,
  History,
  RefreshCw,
  Search,
  SlidersHorizontal,
  XCircle,
  X,
} from "lucide-react";
import { Button, Drawer, useOverlayState } from "@heroui/react";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { activityLogsApi } from "@/lib/api/activityLogs";
import type {
  ActivityLog,
  ActivityLogFilterOptions,
  ActivityLogStatus,
} from "@/types/activityLog";
import { Chip, type ChipVariant } from "@/components/ui/Chip";
import CustomSelect from "@/components/ui/CustomSelect";
import ActivityLogTimeline from "@/components/settings/ActivityLogTimeline";
import {
  canExportActivityLogs,
  canViewActivityLogs,
} from "@/utils/permissions";
import { getIsLoggingOut } from "@/utils/auth";
import type { Admin } from "@/types/admin";
import type { RootState } from "@/redux/store";

function getAdminFromStorage(): Admin | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("adminInfo");
    return raw ? (JSON.parse(raw) as Admin) : null;
  } catch {
    return null;
  }
}

function isIgnorableFetchError(err: unknown): boolean {
  if (getIsLoggingOut()) return true;
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) return true;
    const msg = (err.message || "").toLowerCase();
    return (
      err.code === "ERR_CANCELED" ||
      msg.includes("abort") ||
      msg.includes("cancel")
    );
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("abort") || msg.includes("cancel");
  }
  return false;
}

const ITEMS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 450;

const PRESET_OPTIONS = [
  { id: "", label: "All time" },
  { id: "today", label: "Today" },
  { id: "last7", label: "Last 7 days" },
  { id: "last30", label: "Last 30 days" },
];

const QUICK_PRESETS = [
  { id: "today", label: "Today" },
  { id: "last7", label: "7 days" },
  { id: "last30", label: "30 days" },
] as const;

const STATUS_OPTIONS = [
  { id: "", label: "All statuses" },
  { id: "success", label: "Success" },
  { id: "failed", label: "Failed" },
  { id: "warning", label: "Warning" },
];

const getStatusVariant = (status: ActivityLogStatus): ChipVariant => {
  const map: Record<ActivityLogStatus, ChipVariant> = {
    success: "green",
    failed: "red",
    warning: "yellow",
  };
  return map[status] || "gray";
};

const formatDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return value;
  }
};

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function JsonBlock({
  title,
  data,
  highlight,
}: {
  title: string;
  data?: Record<string, unknown>;
  highlight?: "old" | "new";
}) {
  if (!data || Object.keys(data).length === 0) return null;
  const styles =
    highlight === "old"
      ? "border-red-200/80 bg-red-50/50"
      : highlight === "new"
        ? "border-emerald-200/80 bg-emerald-50/50"
        : "border-gray-200 bg-gray-50";

  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        {title}
      </h4>
      <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

const defaultFilters = () => ({
  search: "",
  preset: "",
  statusFilter: "",
  activityTypeFilter: "",
  moduleFilter: "",
  adminFilter: "",
  roleFilter: "",
  dateFrom: "",
  dateTo: "",
});

export default function ActivityLogsPage() {
  const router = useRouter();
  const reduxAdmin = useSelector((state: RootState) => state.auth.admin);
  const [storedAdmin, setStoredAdmin] = useState<Admin | null>(null);
  const [hasToken, setHasToken] = useState(true);

  useEffect(() => {
    setStoredAdmin(getAdminFromStorage());
    setHasToken(Boolean(localStorage.getItem("accessToken")));
  }, []);

  const admin = reduxAdmin ?? storedAdmin;
  const sessionActive = hasToken && !getIsLoggingOut();
  const canView = sessionActive && canViewActivityLogs(admin);
  const canExport = sessionActive && canExportActivityLogs(admin);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filterOptions, setFilterOptions] =
    useState<ActivityLogFilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [preset, setPreset] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const drawerState = useOverlayState({
    isOpen: isDetailOpen,
    onOpenChange: (open) => {
      setIsDetailOpen(open);
      if (!open) setSelectedLog(null);
    },
  });

  const fetchIdRef = useRef(0);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (searchDebounced) n++;
    if (preset) n++;
    if (statusFilter) n++;
    if (activityTypeFilter) n++;
    if (moduleFilter) n++;
    if (adminFilter) n++;
    if (roleFilter) n++;
    if (dateFrom || dateTo) n++;
    return n;
  }, [
    searchDebounced,
    preset,
    statusFilter,
    activityTypeFilter,
    moduleFilter,
    adminFilter,
    roleFilter,
    dateFrom,
    dateTo,
  ]);

  const hasActiveFilters = activeFilterCount > 0;

  const clearAllFilters = () => {
    const d = defaultFilters();
    setSearch(d.search);
    setSearchDebounced(d.search);
    setPreset(d.preset);
    setStatusFilter(d.statusFilter);
    setActivityTypeFilter(d.activityTypeFilter);
    setModuleFilter(d.moduleFilter);
    setAdminFilter(d.adminFilter);
    setRoleFilter(d.roleFilter);
    setDateFrom(d.dateFrom);
    setDateTo(d.dateTo);
    setCurrentPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!canView || getIsLoggingOut()) {
      setIsLoading(false);
      return;
    }
    activityLogsApi
      .getFilterOptions()
      .then(setFilterOptions)
      .catch(() => {});
  }, [canView]);

  useEffect(() => {
    if (!canView || getIsLoggingOut()) return;

    const fetchId = ++fetchIdRef.current;
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await activityLogsApi.getLogs({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchDebounced || undefined,
          preset: (preset || undefined) as
            | "today"
            | "last7"
            | "last30"
            | undefined,
          status: statusFilter || undefined,
          activityType: activityTypeFilter || undefined,
          module: moduleFilter || undefined,
          adminId: adminFilter || undefined,
          roleId: roleFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sort: "desc",
        });

        if (cancelled || fetchId !== fetchIdRef.current) return;

        setLogs(result.logs);
        setTotalPages(result.totalPages);
        setTotalItems(result.total);
      } catch (err: unknown) {
        if (cancelled || fetchId !== fetchIdRef.current) return;
        if (isIgnorableFetchError(err)) return;
        setError(
          err instanceof Error ? err.message : "Failed to load activity logs",
        );
        setLogs([]);
      } finally {
        if (!cancelled && fetchId === fetchIdRef.current) {
          setIsLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    canView,
    currentPage,
    searchDebounced,
    preset,
    statusFilter,
    activityTypeFilter,
    moduleFilter,
    adminFilter,
    roleFilter,
    dateFrom,
    dateTo,
  ]);

  const handleManualRefresh = async () => {
    fetchIdRef.current += 1;
    const fetchId = fetchIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await activityLogsApi.getLogs({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchDebounced || undefined,
        preset: (preset || undefined) as
          | "today"
          | "last7"
          | "last30"
          | undefined,
        status: statusFilter || undefined,
        activityType: activityTypeFilter || undefined,
        module: moduleFilter || undefined,
        adminId: adminFilter || undefined,
        roleId: roleFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sort: "desc",
      });
      if (fetchId === fetchIdRef.current) {
        setLogs(result.logs);
        setTotalPages(result.totalPages);
        setTotalItems(result.total);
      }
    } catch (err: unknown) {
      if (fetchId === fetchIdRef.current && !isIgnorableFetchError(err)) {
        setError(
          err instanceof Error ? err.message : "Failed to load activity logs",
        );
      }
    } finally {
      if (fetchId === fetchIdRef.current) setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!canExport) return;
    try {
      const data = await activityLogsApi.exportLogs({
        search: searchDebounced || undefined,
        preset: (preset || undefined) as
          | "today"
          | "last7"
          | "last30"
          | undefined,
        status: statusFilter || undefined,
        activityType: activityTypeFilter || undefined,
        module: moduleFilter || undefined,
        adminId: adminFilter || undefined,
        roleId: roleFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sort: "desc",
      });
      const wsData = [
        [
          "Date & Time",
          "User",
          "Email",
          "Role",
          "Activity",
          "Module",
          "Status",
          "IP",
          "Endpoint",
          "Description",
        ],
        ...data.map((log) => [
          formatDateTime(log.createdAt),
          log.adminName,
          log.adminEmail || "",
          log.roleName || (log.isSuperAdmin ? "Super Admin" : ""),
          log.activityType,
          log.module,
          log.status,
          log.ipAddress || "",
          log.apiEndpoint || "",
          log.description,
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Activity Logs");
      XLSX.writeFile(
        wb,
        `activity-logs-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch {
      /* axios toast */
    }
  };

  const openDetail = (log: ActivityLog) => {
    setSelectedLog(log);
    setCopiedId(false);
    setIsDetailOpen(true);
    setDetailLoading(true);
    activityLogsApi
      .getLogById(log._id)
      .then((full) => setSelectedLog(full))
      .catch(() => {
        /* keep list row data */
      })
      .finally(() => setDetailLoading(false));
  };

  const copyActivityId = () => {
    if (!selectedLog?._id) return;
    navigator.clipboard.writeText(selectedLog._id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!sessionActive) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8">
        <RefreshCw className="size-8 text-gray-300 animate-spin mb-3" />
        <p className="text-gray-500">Redirecting to login…</p>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <History className="size-12 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-secondary mb-2">
          System Activity Logs
        </h1>
        <p className="text-gray-600 max-w-md">
          You do not have permission to view activity logs. Contact your super
          admin to grant the <strong>activity-logs.view</strong> permission.
        </p>
        <Button
          className="mt-6 bg-[#FF6A3D] text-white"
          onPress={() => router.push("/settings")}
        >
          Back to Settings
        </Button>
      </div>
    );
  }

  const activityTypeOptions = [
    { id: "", label: "All activity types" },
    ...(filterOptions?.activityTypes || []).map((t) => ({
      id: t,
      label: formatLabel(t),
    })),
  ];

  const moduleOptions = [
    { id: "", label: "All modules" },
    ...(filterOptions?.modules || []).map((m) => ({ id: m, label: m })),
  ];

  const adminOptions = [
    { id: "", label: "All admins" },
    ...(filterOptions?.admins || []).map((a) => ({
      id: a.id,
      label: a.name,
    })),
  ];

  const roleOptions = [
    { id: "", label: "All roles" },
    ...(filterOptions?.roles || []).map((r) => ({
      id: r.id,
      label: r.name,
    })),
  ];

  return (
    <>
      <div className="w-full max-w-4xl mx-auto pb-12">
        {/* Breadcrumb & header */}
        <div className="mb-6">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#3D63A4] transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#FF6A3D] tracking-tight">
                Activity Logs
              </h1>
              <p className="text-gray-600 mt-1.5 text-sm max-w-lg">
                Complete, immutable audit trail of actions across the admin
                panel.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isLoading}
                aria-label="Refresh"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-[#3D63A4] transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>
              {canExport && (
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A3D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#FF6A3D]/25 hover:bg-[#e55a2d] transition-colors"
                >
                  <FileDown size={18} />
                  Export
                </button>
              )}
            </div>
          </div>

          {/* Summary strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total events
              </p>
              <p className="mt-0.5 text-xl font-bold text-secondary tabular-nums">
                {isLoading && totalItems === 0
                  ? "-"
                  : totalItems.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                This page
              </p>
              <p className="mt-0.5 text-xl font-bold text-gray-900 tabular-nums">
                {logs.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Active filters
              </p>
              <p className="mt-0.5 text-xl font-bold text-[#FF6A3D] tabular-nums">
                {activeFilterCount}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar: search + quick filters */}
        <div className="mb-4 rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search users, modules, descriptions, endpoints..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#3D63A4]/15 focus:border-[#3D63A4] transition-all [color-scheme:light]"
                />
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors shrink-0 ${
                  filtersOpen || hasActiveFilters
                    ? "border-[#3D63A4] bg-[#3D63A4]/5 text-[#3D63A4]"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <SlidersHorizontal size={18} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3D63A4] px-1.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
                {filtersOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 mr-1">Quick:</span>
              {QUICK_PRESETS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setPreset(preset === q.id ? "" : q.id);
                    setDateFrom("");
                    setDateTo("");
                    setCurrentPage(1);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    preset === q.id
                      ? "bg-[#3D63A4] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {q.label}
                </button>
              ))}
              <span className="w-px h-4 bg-gray-200 mx-1 hidden sm:block" />
              {(["success", "failed", "warning"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(statusFilter === s ? "" : s);
                    setCurrentPage(1);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    statusFilter === s
                      ? s === "success"
                        ? "bg-emerald-600 text-white"
                        : s === "failed"
                          ? "bg-red-500 text-white"
                          : "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X size={14} />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Collapsible advanced filters */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-0 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                  <CustomSelect
                    ariaLabel="Date preset"
                    value={preset}
                    onChange={(v) => {
                      setPreset(v);
                      setCurrentPage(1);
                    }}
                    options={PRESET_OPTIONS}
                  />
                  <CustomSelect
                    ariaLabel="Activity type"
                    value={activityTypeFilter}
                    onChange={(v) => {
                      setActivityTypeFilter(v);
                      setCurrentPage(1);
                    }}
                    options={activityTypeOptions}
                  />
                  <CustomSelect
                    ariaLabel="Module"
                    value={moduleFilter}
                    onChange={(v) => {
                      setModuleFilter(v);
                      setCurrentPage(1);
                    }}
                    options={moduleOptions}
                  />
                  <CustomSelect
                    ariaLabel="Admin"
                    value={adminFilter}
                    onChange={(v) => {
                      setAdminFilter(v);
                      setCurrentPage(1);
                    }}
                    options={adminOptions}
                  />
                  <CustomSelect
                    ariaLabel="Role"
                    value={roleFilter}
                    onChange={(v) => {
                      setRoleFilter(v);
                      setCurrentPage(1);
                    }}
                    options={roleOptions}
                  />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="text-xs text-gray-500">Custom range</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPreset("");
                      setCurrentPage(1);
                    }}
                    className="h-10 px-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg [color-scheme:light]"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPreset("");
                      setCurrentPage(1);
                    }}
                    className="h-10 px-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg [color-scheme:light]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ActivityLogTimeline
          logs={logs}
          loading={isLoading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onOpenDetail={openDetail}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <Drawer state={drawerState}>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="bg-white border-l shadow-2xl w-full max-w-md sm:max-w-lg flex flex-col max-h-[100dvh]">
              <Drawer.CloseTrigger className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" />
              {selectedLog ? (
                <>
                  <Drawer.Header className="border-b border-gray-100 px-5 pt-5 pb-4 pr-14 shrink-0">
                    <div className="flex items-start gap-3">
                      <div
                        className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{
                          backgroundColor: (() => {
                            const colors = [
                              "#3D63A4",
                              "#F36541",
                              "#157A6E",
                              "#8B5CF6",
                            ];
                            let h = 0;
                            for (const c of selectedLog.adminName)
                              h += c.charCodeAt(0);
                            return colors[h % colors.length];
                          })(),
                        }}
                      >
                        {selectedLog.adminName
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Drawer.Heading className="text-xl font-bold text-gray-900 leading-tight">
                          {selectedLog.adminName}
                        </Drawer.Heading>
                        <p className="text-sm text-gray-500 truncate">
                          {selectedLog.adminEmail ||
                            (selectedLog.isSuperAdmin
                              ? "Super Administrator"
                              : selectedLog.roleName)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDateTime(selectedLog.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip
                        label={formatLabel(selectedLog.status)}
                        variant={getStatusVariant(selectedLog.status)}
                      />
                      <span className="inline-flex rounded-md bg-[#3D63A4]/10 px-2 py-0.5 text-xs font-semibold text-[#3D63A4]">
                        {selectedLog.module}
                      </span>
                    </div>
                  </Drawer.Header>

                  <Drawer.Body className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {detailLoading && (
                      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                        <RefreshCw className="size-5 animate-spin mr-2" />
                        Loading details…
                      </div>
                    )}
                    <div className="rounded-xl bg-[#F6FAFF] border border-[#3D63A4]/10 p-4">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {selectedLog.description}
                      </p>
                      <p className="mt-2 text-xs font-medium text-gray-500">
                        {formatLabel(selectedLog.activityType)}
                      </p>
                    </div>

                    {selectedLog.errorDetails && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
                        <XCircle className="text-red-500 shrink-0" size={20} />
                        <div>
                          <p className="text-xs font-semibold text-red-800 uppercase">
                            Error
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            {selectedLog.errorDetails}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                        Request metadata
                      </h3>
                      <dl className="grid grid-cols-1 gap-3 text-sm">
                        {[
                          ["IP", selectedLog.ipAddress],
                          [
                            "Browser",
                            selectedLog.browserInfo || selectedLog.userAgent,
                          ],
                          [
                            "API",
                            `${selectedLog.requestMethod || ""} ${selectedLog.apiEndpoint || ""}`.trim(),
                          ],
                          [
                            "Entity",
                            selectedLog.entityType
                              ? `${selectedLog.entityType}${selectedLog.entityId ? ` · ${selectedLog.entityId}` : ""}`
                              : null,
                          ],
                          ["Request ID", selectedLog.requestId],
                        ]
                          .filter(([, v]) => v)
                          .map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-lg bg-gray-50 px-3 py-2.5 border border-gray-100"
                            >
                              <dt className="text-xs text-gray-500">{label}</dt>
                              <dd className="mt-0.5 font-mono text-xs text-gray-800 break-all">
                                {value}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 px-3 py-2">
                      <span className="text-xs text-gray-500 font-mono truncate">
                        {selectedLog._id}
                      </span>
                      <button
                        type="button"
                        onClick={copyActivityId}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#3D63A4] hover:underline shrink-0 ml-2"
                      >
                        <Copy size={14} />
                        {copiedId ? "Copied" : "Copy ID"}
                      </button>
                    </div>

                    <JsonBlock
                      title="Previous values"
                      data={selectedLog.oldValues}
                      highlight="old"
                    />
                    <JsonBlock
                      title="New values"
                      data={selectedLog.newValues}
                      highlight="new"
                    />
                  </Drawer.Body>
                </>
              ) : (
                <Drawer.Body className="p-8 text-center text-gray-500">
                  No log selected
                </Drawer.Body>
              )}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
