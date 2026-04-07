"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type SearchSelectOption = {
  id: string;
  name: string;
};

type SingleSelectProps = {
  multiple?: false;
  value: SearchSelectOption | null;
  onChange: (option: SearchSelectOption | null) => void;
};

type MultiSelectProps = {
  multiple: true;
  value: SearchSelectOption[];
  onChange: (options: SearchSelectOption[]) => void;
};

type BaseSelectProps = {
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
};

export type SearchSelectProps = BaseSelectProps &
  (SingleSelectProps | MultiSelectProps);

export function SearchSelect(props: SearchSelectProps) {
  const {
    options,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    isLoading = false,
    disabled = false,
    className = "",
  } = props;

  const isMultiple = props.multiple === true;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const portalId = useId();

  const selectedSingle = !isMultiple
    ? (props.value as SearchSelectOption | null)
    : null;
  const selectedMulti = isMultiple ? (props.value as SearchSelectOption[]) : [];

  const isOptionSelected = (opt: SearchSelectOption) => {
    if (isMultiple) return selectedMulti.some((s) => s.id === opt.id);
    return selectedSingle?.id === opt.id;
  };

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Recalculate portal position whenever it opens or window scrolls/resizes
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const update = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !document.getElementById(portalId)?.contains(target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
      setTimeout(() => searchRef.current?.focus(), 0);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, portalId]);

  const handleSelect = (opt: SearchSelectOption) => {
    if (isMultiple) {
      const current = props.value as SearchSelectOption[];
      const exists = current.some((s) => s.id === opt.id);
      const next = exists
        ? current.filter((s) => s.id !== opt.id)
        : [...current, opt];
      (props.onChange as (v: SearchSelectOption[]) => void)(next);
      // Stay open in multi mode
    } else {
      (props.onChange as (v: SearchSelectOption | null) => void)(opt);
      setIsOpen(false);
      setSearch("");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMultiple) {
      (props.onChange as (v: SearchSelectOption[]) => void)([]);
    } else {
      (props.onChange as (v: SearchSelectOption | null) => void)(null);
    }
  };

  const removeChip = (id: string) => {
    const next = selectedMulti.filter((s) => s.id !== id);
    (props.onChange as (v: SearchSelectOption[]) => void)(next);
  };

  const triggerLabel = () => {
    if (isLoading) return "Loading...";
    if (isMultiple) {
      if (selectedMulti.length === 0) return placeholder;
      if (selectedMulti.length === 1) return selectedMulti[0].name;
      return `${selectedMulti.length} selected`;
    }
    return selectedSingle ? selectedSingle.name : placeholder;
  };

  const hasValue = isMultiple ? selectedMulti.length > 0 : !!selectedSingle;

  const dropdownContent = isOpen ? (
    <div
      id={portalId}
      data-searchselect-portal=""
      style={dropdownStyle}
      className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-visible min-w-48"
    >
      {/* Search */}
      <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-slate-100">
        <Search size={13} className="text-slate-400 shrink-0" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 text-xs outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
        />
      </div>

      {/* Options */}
      <ul className="max-h-44 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <li className="px-3 py-2 text-xs text-slate-400 text-center">
            No results
          </li>
        ) : (
          filtered.map((opt) => {
            const selected = isOptionSelected(opt);
            return (
              <li
                key={opt.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors
                  ${selected ? "bg-orange-50 text-orange-600 font-medium" : "text-slate-700 hover:bg-slate-50"}
                `}
              >
                {isMultiple && (
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                      ${selected ? "bg-orange-500 border-orange-500" : "border-slate-300 bg-white"}
                    `}
                  >
                    {selected && (
                      <Check size={10} strokeWidth={3} className="text-white" />
                    )}
                  </span>
                )}
                <span className="truncate">{opt.name}</span>
                {!isMultiple && selected && (
                  <span className="ml-auto text-orange-500 text-xs">✓</span>
                )}
              </li>
            );
          })
        )}
      </ul>

      {/* Selected chips in multi mode */}
      {isMultiple && selectedMulti.length > 0 && (
        <div className="flex flex-wrap gap-1 px-2.5 py-2 border-t border-slate-100">
          {selectedMulti.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full border border-orange-200"
            >
              {s.name}
              <span
                onMouseDown={(e) => {
                  e.preventDefault();
                  removeChip(s.id);
                }}
                className="cursor-pointer hover:text-orange-900"
              >
                <X size={10} />
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg border text-sm transition-all focus:outline-none
          ${isOpen ? "border-orange-400 ring-1 ring-orange-200" : "border-slate-200 hover:border-slate-300"}
          ${disabled || isLoading ? "bg-slate-50 cursor-not-allowed text-slate-400" : "bg-white text-slate-700 cursor-pointer"}
        `}
      >
        <span className={`truncate ${!hasValue ? "text-slate-400" : ""}`}>
          {triggerLabel()}
        </span>
        <span className="flex items-center gap-0.5 shrink-0">
          {hasValue && !disabled && (
            <span
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {/* Portal dropdown — escapes overflow:hidden parents */}
      {typeof document !== "undefined" &&
        createPortal(dropdownContent, document.body)}
    </div>
  );
}
