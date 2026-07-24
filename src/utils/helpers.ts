import { useRef } from "react";
import { fromQueryValue } from "../components/ui/FilterDropdown/helpers";
import {
  defaultStatus,
  defaultDateRange,
  defaultEntityType,
  defaultRegistrationType,
} from "../components/ui/FilterDropdown/defaults";
import { Filters } from "../components/ui/FilterDropdown/index";

/**
 * Debounce a callback function for React components.
 * @param callback The function to debounce
 * @param delay The debounce delay in ms
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
) {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return (...args: Parameters<T>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
// Utility functions for formatting

/**
 * Formats a number as Indian Rupee currency (₹).
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "INR"): string {
  if (currency === "USD") {
    return `$ ${new Intl.NumberFormat("en-US").format(amount)}`;
  }
  return `\u20B9 ${new Intl.NumberFormat("en-IN").format(amount)}`;
}

export const getFileType = (url: string) => {
  // Strip query params before checking extension
  const cleanUrl = (url || "").split("?")[0];
  let decoded = cleanUrl;
  try {
    decoded = decodeURIComponent(cleanUrl);
  } catch {
    decoded = cleanUrl;
  }

  if (decoded.match(/\.(jpeg|jpg|png|gif|webp|svg|bmp)$/i)) return "image";
  if (decoded.match(/\.pdf$/i)) return "pdf";
  return "other";
};

export const buildFiltersFromParams = (sp: URLSearchParams): Filters => {
  const status = fromQueryValue(defaultStatus, sp.get("status"));
  const entityType = fromQueryValue(defaultEntityType, sp.get("entity"));
  const registrationType = fromQueryValue(
    defaultRegistrationType,
    sp.get("registrationType"),
  );
  const dateRange = fromQueryValue(defaultDateRange, sp.get("date"));
  const assigneeIds = sp.get("assignee");
  const assignerIds = sp.get("assigner");
  return {
    status,
    entityType,
    registrationType,
    dateRange,
    assignee: {
      selected: assigneeIds
        ? assigneeIds.split(",").map((id) => ({ id, name: id }))
        : [],
    },
    assigner: {
      selected: assignerIds
        ? assignerIds.split(",").map((id) => ({ id, name: id }))
        : [],
    },
    search: sp.get("search") ?? "",
  };
};
