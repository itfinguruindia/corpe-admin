"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";

interface ExportDropdownProps {
  title: string;
  description?: string;
  isExporting?: boolean;
  onExportDateRange: (dateFrom?: string, dateTo?: string) => void | Promise<void>;
  onExportAll: () => void | Promise<void>;
  onInvalidDateRange?: () => void | Promise<void>;
  className?: string;
}

export default function ExportDropdown({
  title,
  description = "Use date range or export all rows with active filters.",
  isExporting = false,
  onExportDateRange,
  onExportAll,
  onInvalidDateRange,
  className = "",
}: ExportDropdownProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleDateRangeExport = async () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      if (onInvalidDateRange) await onInvalidDateRange();
      return;
    }
    await onExportDateRange(dateFrom || undefined, dateTo || undefined);
  };

  return (
    <div className={`relative group/export shrink-0 ${className}`}>
      <button
        type="button"
        disabled={isExporting}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-[#3D63A4] transition-colors disabled:opacity-60"
        title={title}
      >
        <FileDown size={18} />
      </button>

      <div className="invisible opacity-0 translate-y-1 pointer-events-none absolute right-0 top-12 z-30 w-[340px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl transition-all duration-150 group-hover/export:visible group-hover/export:opacity-100 group-hover/export:translate-y-0 group-hover/export:pointer-events-auto group-focus-within/export:visible group-focus-within/export:opacity-100 group-focus-within/export:translate-y-0 group-focus-within/export:pointer-events-auto">
        <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
        <p className="text-xs text-gray-500 mb-3">{description}</p>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-3">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-full px-2 text-xs text-gray-900 bg-white border border-gray-200 rounded-lg [color-scheme:light]"
            aria-label="Export from date"
          />
          <span className="text-xs text-gray-500">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-full px-2 text-xs text-gray-900 bg-white border border-gray-200 rounded-lg [color-scheme:light]"
            aria-label="Export to date"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDateRangeExport}
            disabled={isExporting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#3D63A4] px-3 py-2 text-xs font-semibold text-white hover:bg-[#35588f] transition-colors disabled:opacity-60"
          >
            {isExporting ? "Exporting..." : "Export Date Range"}
          </button>
          <button
            type="button"
            onClick={onExportAll}
            disabled={isExporting}
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Export All (Filtered)
          </button>
        </div>
      </div>
    </div>
  );
}
