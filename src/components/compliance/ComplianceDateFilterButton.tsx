"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({
  id: String(index + 1),
  label: name,
}));

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function maxDayForMonth(month: number) {
  return DAYS_IN_MONTH[month - 1] ?? 31;
}

export interface ComplianceDateFilterValue {
  month: string;
  day: string;
}

export const emptyDateFilter = (): ComplianceDateFilterValue => ({
  month: "",
  day: "",
});

export function formatComplianceDateFilterLabel(
  value: ComplianceDateFilterValue,
): string | null {
  const { month, day } = value;
  if (!month || !day) return null;
  return `${day} ${MONTH_NAMES[Number(month) - 1]}`;
}

interface ComplianceDateFilterButtonProps {
  value: ComplianceDateFilterValue;
  onChange: (value: ComplianceDateFilterValue) => void;
}

export default function ComplianceDateFilterButton({
  value,
  onChange,
}: ComplianceDateFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ComplianceDateFilterValue>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasActiveFilter = Boolean(value.month && value.day);
  const canApply = Boolean(draft.month && draft.day);

  const openPopover = useCallback(() => {
    setDraft(value);
    setIsOpen(true);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const applyDraft = () => {
    if (!canApply) return;
    onChange(draft);
    setIsOpen(false);
  };

  const clearAll = () => {
    const cleared = emptyDateFilter();
    setDraft(cleared);
    onChange(cleared);
    setIsOpen(false);
  };

  const applyToday = () => {
    const now = new Date();
    setDraft({
      month: String(now.getMonth() + 1),
      day: String(now.getDate()),
    });
  };

  const activeLabel = formatComplianceDateFilterLabel(value);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAll();
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <div
        className={`inline-flex h-10 items-stretch overflow-hidden rounded-xl border text-sm font-medium shadow-sm transition-all ${
          isOpen || hasActiveFilter
            ? "border-[#FF6A3D]/40 bg-orange-50 text-[#FF6A3D]"
            : "border-gray-200 bg-white text-gray-700"
        }`}
      >
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : openPopover())}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={`inline-flex items-center gap-2 px-3 transition-colors active:scale-[0.98] ${
            !hasActiveFilter && !isOpen
              ? "hover:text-[#FF6A3D]"
              : ""
          }`}
        >
          <CalendarDays className="size-4 shrink-0" />
          <span className="max-w-[7rem] truncate sm:max-w-[9rem]">
            {activeLabel ?? <span className="hidden sm:inline">Date</span>}
            {!activeLabel && <span className="sm:hidden">Date</span>}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear date filter"
            className="inline-flex items-center border-l border-[#FF6A3D]/20 px-2.5 text-[#FF6A3D] transition-colors hover:bg-[#FF6A3D]/10"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Filter by deadline date"
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(100vw-2rem,280px)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl animate-in"
        >
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-900">Deadline date</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Show entries on a specific day
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-[38px] flex-1 min-w-0">
              <CustomSelect
                ariaLabel="Month"
                value={draft.month}
                options={[
                  { id: "", label: "Select month" },
                  ...MONTH_OPTIONS,
                ]}
                onChange={(nextMonth) => {
                  setDraft((prev) => {
                    const next = { ...prev, month: nextMonth };
                    if (!nextMonth) {
                      next.day = "";
                    } else if (next.day) {
                      const maxDay = maxDayForMonth(Number(nextMonth));
                      if (Number(next.day) > maxDay) {
                        next.day = String(maxDay);
                      }
                    }
                    return next;
                  });
                }}
              />
            </div>
            <input
              type="number"
              min={1}
              max={draft.month ? maxDayForMonth(Number(draft.month)) : 31}
              value={draft.day}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, day: e.target.value }))
              }
              placeholder="Day"
              disabled={!draft.month}
              aria-label="Day"
              className="h-[38px] w-16 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <button
            type="button"
            onClick={applyToday}
            className="mt-3 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D]"
          >
            Today
          </button>

          <button
            type="button"
            onClick={applyDraft}
            disabled={!canApply}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#FF6A3D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a2d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply filter
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes compliance-date-filter-in {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-in {
          animation: compliance-date-filter-in 0.16s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
