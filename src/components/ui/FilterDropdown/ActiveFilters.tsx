import { X } from "lucide-react";
import { Filters } from "./types";
import { defaultStatus, defaultEntityType, defaultDateRange, defaultAssignee, defaultAssigner } from "./defaults";

interface ActiveFiltersProps {
  filters: Filters;
  onApply: (newFilters: Filters) => void;
}

export default function ActiveFilters({ filters, onApply }: ActiveFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(
    (v) =>
      typeof v === "object" &&
      v !== null &&
      ("selected" in v
        ? (v as any).selected.length > 0
        : Object.values(v).some(Boolean)),
  );

  if (!hasActiveFilters) return null;

  const handleRemoveFilter = (category: keyof Filters, key: string) => {
    const newFilters = { ...filters };

    if (category === "status") {
      newFilters.status = { ...filters.status, [key as keyof typeof filters.status]: false };
    } else if (category === "entityType") {
      newFilters.entityType = { ...filters.entityType, [key as keyof typeof filters.entityType]: false };
    } else if (category === "assignee") {
      newFilters.assignee = {
        selected: filters.assignee.selected.filter((u) => u.id !== key),
      };
    } else if (category === "assigner") {
      newFilters.assigner = {
        selected: filters.assigner.selected.filter((u) => u.id !== key),
      };
    }

    onApply(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters: Filters = {
      status: { ...defaultStatus },
      entityType: { ...defaultEntityType },
      dateRange: { ...defaultDateRange },
      assignee: { ...defaultAssignee },
      assigner: { ...defaultAssigner },
      search: filters.search, // Keep search when clearing filters? Usually yes, or make it optional.
    };
    onApply(clearedFilters);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <span className="text-xs font-medium text-gray-500 mr-1">
        Active Filters:
      </span>

      {/* Status Chips */}
      {Object.entries(filters.status || {}).map(
        ([key, val]) =>
          val && (
            <div
              key={key}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-[11px] font-medium border border-primary-100 italic transition-all hover:border-primary-300"
            >
              <span>
                Status: {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <button
                onClick={() => handleRemoveFilter("status", key)}
                className="hover:text-primary-900"
              >
                <X size={12} />
              </button>
            </div>
          ),
      )}

      {/* Entity Type Chips */}
      {Object.entries(filters.entityType || {}).map(
        ([key, val]) =>
          val && (
            <div
              key={key}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-medium border border-blue-100 italic transition-all hover:border-blue-300"
            >
              <span>
                Entity:{" "}
                {key.charAt(0).toUpperCase() +
                  key.slice(1).replace(/([A-Z])/g, " $1")}
              </span>
              <button
                onClick={() => handleRemoveFilter("entityType", key)}
                className="hover:text-blue-900"
              >
                <X size={12} />
              </button>
            </div>
          ),
      )}

      {/* Assignee Chips */}
      {filters.assignee?.selected.map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-medium border border-amber-100 italic transition-all hover:border-amber-300"
        >
          <span>Assignee: {u.name}</span>
          <button
            onClick={() => handleRemoveFilter("assignee", u.id)}
            className="hover:text-amber-900"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {/* Assigner Chips */}
      {filters.assigner?.selected.map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-[11px] font-medium border border-teal-100 italic transition-all hover:border-teal-300"
        >
          <span>Assigner: {u.name}</span>
          <button
            onClick={() => handleRemoveFilter("assigner", u.id)}
            className="hover:text-teal-900"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {/* Clear All */}
      <button
        onClick={handleClearAll}
        className="text-xs text-gray-500 hover:text-primary-600 font-bold ml-2 underline underline-offset-4 decoration-gray-300 hover:decoration-primary-300 transition-all"
      >
        Clear All
      </button>
    </div>
  );
}
