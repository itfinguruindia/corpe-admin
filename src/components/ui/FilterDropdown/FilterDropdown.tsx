import { useEffect, useRef, useState } from "react";
import {
  X,
  CalendarDays,
  User,
  UserCheck,
  Building2,
  CircleDot,
  Filter,
} from "lucide-react";
import Checkbox from "../Checkbox";
import AccordionSection from "../AccordionSection";
import { SearchSelect } from "../SearchSelect";
import type { SearchSelectOption } from "../SearchSelect";
import { useRouter, useSearchParams } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import {
  Filters,
  StatusFilters,
  EntityTypeFilters,
  DateRangeFilters,
  AssigneeFilters,
  AssignerFilters,
} from "./types";
import { defaultStatus, defaultEntityType, defaultDateRange } from "./defaults";
import { toQueryValue, fromQueryValue, countActive, toggle, filtersToSearchParams } from "./helpers";

export type FilterDropdownProps = {
  onApply: (filters: Filters) => void;
  onClear?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  filters?: Filters;
};

export default function FilterDropdown({
  onApply,
  onClear,
  search = "",
  onSearchChange,
  filters: externalFilters,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [assigneeOptions, setAssigneeOptions] = useState<SearchSelectOption[]>(
    [],
  );
  const [assignerOptions, setAssignerOptions] = useState<SearchSelectOption[]>(
    [],
  );
  const [loadingUsers, setLoadingUsers] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<StatusFilters>(() => {
    const raw = searchParams.get("status");
    return raw ? fromQueryValue(defaultStatus, raw) : { ...defaultStatus };
  });

  const [entityType, setEntityType] = useState<EntityTypeFilters>(() => {
    const raw = searchParams.get("entity");
    return raw
      ? fromQueryValue(defaultEntityType, raw)
      : { ...defaultEntityType };
  });

  const [dateRange, setDateRange] = useState<DateRangeFilters>(() => {
    const raw = searchParams.get("date");
    return raw
      ? fromQueryValue(defaultDateRange, raw)
      : { ...defaultDateRange };
  });

  const [assignee, setAssignee] = useState<AssigneeFilters>(() => {
    const ids = searchParams.get("assignee");
    if (!ids) return { selected: [] };
    return { selected: ids.split(",").map((id) => ({ id, name: id })) };
  });

  const [assigner, setAssigner] = useState<AssignerFilters>(() => {
    const ids = searchParams.get("assigner");
    if (!ids) return { selected: [] };
    return { selected: ids.split(",").map((id) => ({ id, name: id })) };
  });

  const [searchInput, setSearchInput] = useState(search);

  // Sync internal state when external filters change (e.g., from chips)
  useEffect(() => {
    if (!externalFilters) return;
    setStatus(externalFilters.status);
    setEntityType(externalFilters.entityType);
    setDateRange(externalFilters.dateRange);
    setAssignee(externalFilters.assignee);
    setAssigner(externalFilters.assigner);
  }, [externalFilters]);

  // Fetch assignee/assigner list when dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingUsers(true);
    adminApi
      .getAssigneeAndAssigner()
      .then((data) => {
        const aeOpts = data.assignee.map((u) => ({ id: u._id, name: u.name }));
        const arOpts = data.assigner.map((u) => ({ id: u._id, name: u.name }));
        setAssigneeOptions(aeOpts);
        setAssignerOptions(arOpts);

        // Resolve names for any items that were restored from URL (name === id)
        setAssignee((prev) => ({
          selected: prev.selected.map(
            (s) => aeOpts.find((o) => o.id === s.id) ?? s,
          ),
        }));
        setAssigner((prev) => ({
          selected: prev.selected.map(
            (s) => arOpts.find((o) => o.id === s.id) ?? s,
          ),
        }));
      })
      .catch(() => {
        setAssigneeOptions([]);
        setAssignerOptions([]);
      })
      .finally(() => setLoadingUsers(false));
  }, [isOpen]);
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    onSearchChange?.(e.target.value);
  };

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const totalActive =
    countActive(status) +
    countActive(entityType) +
    countActive(dateRange) +
    assignee.selected.length +
    assigner.selected.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Element;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !target.closest?.("[data-searchselect-portal]")
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleApply = () => {
    const params = new URLSearchParams();
    const s = toQueryValue(status);
    const e = toQueryValue(entityType);
    const d = toQueryValue(dateRange);
    if (assignee.selected.length > 0)
      params.set("assignee", assignee.selected.map((u) => u.id).join(","));
    if (assigner.selected.length > 0)
      params.set("assigner", assigner.selected.map((u) => u.id).join(","));
    if (s) params.set("status", s);
    if (e) params.set("entity", e);
    if (d) params.set("date", d);
    if (searchInput) params.set("search", searchInput);
    
    const queryParams = filtersToSearchParams({
      status,
      entityType,
      dateRange,
      assignee,
      assigner,
      search: searchInput,
    });

    // Use history.replaceState to sync URL without triggering Next.js RSC navigation
    window.history.replaceState(null, "", `?${queryParams.toString()}`);
    onApply({
      status,
      entityType,
      dateRange,
      assignee,
      assigner,
      search: searchInput,
    });
    setIsOpen(false);
  };

  const clearAll = () => {
    window.history.replaceState(null, "", "?");
    setStatus({
      created: false,
      inProcess: false,
      completed: false,
      onHold: false,
      delayed: false,
      pending: false,
    });
    setEntityType({
      llp: false,
      opcs: false,
      privateIndividual: false,
      privateCorporate: false,
      publicIndividual: false,
      publicCorporate: false,
      foreignIndividual: false,
    });
    setDateRange({
      today: false,
      lastWeek: false,
      lastMonth: false,
      lastYear: false,
    });
    setAssignee({ selected: [] });
    setAssigner({ selected: [] });
    onClear?.();
  };

  // Helper counts for each filter section
  const statusCount = Object.values(status).filter(Boolean).length;
  const entityTypeCount = Object.values(entityType).filter(Boolean).length;
  const dateRangeCount = Object.values(dateRange).filter(Boolean).length;
  const assigneeCount = assignee.selected.length;
  const assignerCount = assigner.selected.length;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95
        ${
          isOpen
            ? "bg-primary-500 text-white border-primary-500 shadow-primary-200"
            : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-white hover:border-primary-400 hover:text-primary-600"
        }`}
      >
        <Filter size={18} className={isOpen ? "text-white" : "text-gray-500"} />
        <span>Filters</span>
        {totalActive > 0 && (
          <span className={`w-5 h-5 text-[10px] rounded-full flex items-center justify-center font-bold ${
            isOpen ? "bg-white text-primary-500" : "bg-primary-500 text-white"
          }`}>
            {totalActive}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-2xl shadow-2xl border overflow-hidden animate-in">
          {/* Header */}
          <div className="flex flex-col gap-2 px-4 py-3 border-b bg-slate-50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Filter By
              </span>
              {totalActive > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-orange-500 font-semibold flex items-center gap-1"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
            </div>
            {/* Search Input inside dropdown */}
            {/* <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Search clients..."
              className="rounded-lg px-2 py-1 text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white/90 placeholder:text-gray-400 border border-slate-200"
              style={{ minWidth: "100%" }}
            /> */}
          </div>

          <AccordionSection
            title={statusCount > 0 ? `Status (${statusCount})` : "Status"}
            icon={CircleDot}
          >
            {/* <Checkbox
              checked={status.pending}
              onChange={() => toggle(setStatus, "created")}
              label="Created"
            /> */}
            <Checkbox
              checked={status.pending}
              onChange={() => toggle(setStatus, "pending")}
              label="Pending"
            />
            <Checkbox
              checked={status.inProcess}
              onChange={() => toggle(setStatus, "inProcess")}
              label="In Process"
            />
            <Checkbox
              checked={status.completed}
              onChange={() => toggle(setStatus, "completed")}
              label="Completed"
            />
            <Checkbox
              checked={status.onHold}
              onChange={() => toggle(setStatus, "onHold")}
              label="On Hold"
            />
            <Checkbox
              checked={status.delayed}
              onChange={() => toggle(setStatus, "delayed")}
              label="Delayed"
            />
          </AccordionSection>

          <AccordionSection
            title={
              entityTypeCount > 0
                ? `Entity Type (${entityTypeCount})`
                : "Entity Type"
            }
            icon={Building2}
          >
            {/* <Checkbox
              checked={entityType.llp}
              onChange={() => toggle(setEntityType, "llp")}
              label="LLP"
            /> */}
            <Checkbox
              checked={entityType.opcs}
              onChange={() => toggle(setEntityType, "opcs")}
              label="OPC"
            />

            {/* Private Companies */}
            <Checkbox
              checked={
                entityType.privateIndividual && entityType.privateCorporate
              }
              indeterminate={
                (entityType.privateIndividual || entityType.privateCorporate) &&
                !(entityType.privateIndividual && entityType.privateCorporate)
              }
              onChange={() => {
                const allChecked =
                  entityType.privateIndividual && entityType.privateCorporate;
                setEntityType((prev) => ({
                  ...prev,
                  privateIndividual: !allChecked,
                  privateCorporate: !allChecked,
                }));
              }}
              label="Private Companies"
              className="font-semibold"
            />
            <div style={{ paddingLeft: 24 }}>
              <Checkbox
                checked={entityType.privateIndividual}
                onChange={() => toggle(setEntityType, "privateIndividual")}
                label="Individual Shareholders"
              />
              <Checkbox
                checked={entityType.privateCorporate}
                onChange={() => toggle(setEntityType, "privateCorporate")}
                label="Corporate Shareholders"
              />
            </div>

            {/* Public Companies */}
            <Checkbox
              checked={
                entityType.publicIndividual && entityType.publicCorporate
              }
              indeterminate={
                (entityType.publicIndividual || entityType.publicCorporate) &&
                !(entityType.publicIndividual && entityType.publicCorporate)
              }
              onChange={() => {
                const allChecked =
                  entityType.publicIndividual && entityType.publicCorporate;
                setEntityType((prev) => ({
                  ...prev,
                  publicIndividual: !allChecked,
                  publicCorporate: !allChecked,
                }));
              }}
              label="Public Companies"
              className="font-semibold"
            />
            <div style={{ paddingLeft: 24 }}>
              <Checkbox
                checked={entityType.publicIndividual}
                onChange={() => toggle(setEntityType, "publicIndividual")}
                label="Individual Shareholders"
              />
              <Checkbox
                checked={entityType.publicCorporate}
                onChange={() => toggle(setEntityType, "publicCorporate")}
                label="Corporate Shareholders"
              />
            </div>

            {/* Foreign Individual */}
            <Checkbox
              checked={entityType.foreignIndividual}
              onChange={() => toggle(setEntityType, "foreignIndividual")}
              label="Foreign Individual"
            />
          </AccordionSection>

          <AccordionSection
            title={
              dateRangeCount > 0
                ? `Date Range (${dateRangeCount})`
                : "Date Range"
            }
            icon={CalendarDays}
          >
            <Checkbox
              checked={dateRange.today}
              onChange={() => toggle(setDateRange, "today")}
              label="Today"
            />
            <Checkbox
              checked={dateRange.lastWeek}
              onChange={() => toggle(setDateRange, "lastWeek")}
              label="Last Week"
            />
            <Checkbox
              checked={dateRange.lastMonth}
              onChange={() => toggle(setDateRange, "lastMonth")}
              label="Last Month"
            />
            <Checkbox
              checked={dateRange.lastYear}
              onChange={() => toggle(setDateRange, "lastYear")}
              label="Last Year"
            />
          </AccordionSection>

          <AccordionSection
            title={
              assigneeCount > 0 ? `Assignee (${assigneeCount})` : "Assignee"
            }
            icon={User}
          >
            <SearchSelect
              multiple
              options={assigneeOptions}
              value={assignee.selected}
              onChange={(opts) => setAssignee({ selected: opts })}
              placeholder="Select Assignee"
              isLoading={loadingUsers}
              className="mt-1"
            />
          </AccordionSection>

          <AccordionSection
            title={
              assignerCount > 0 ? `Assigner (${assignerCount})` : "Assigner"
            }
            icon={UserCheck}
          >
            <SearchSelect
              multiple
              options={assignerOptions}
              value={assigner.selected}
              onChange={(opts) => setAssigner({ selected: opts })}
              placeholder="Select Assigner"
              isLoading={loadingUsers}
              className="mt-1"
            />
          </AccordionSection>

          <div className="px-4 py-3 border-t bg-slate-50 flex justify-end">
            <button
              onClick={handleApply}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all w-full"
            >
              Apply
            </button>
          </div>
          <style jsx global>{`
            @keyframes animate-in {
              from {
                opacity: 0;
                transform: translateY(-8px) scale(0.97);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            .animate-in {
              animation: animate-in 0.18s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
