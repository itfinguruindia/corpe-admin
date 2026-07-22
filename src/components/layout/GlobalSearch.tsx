"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  History,
  ArrowRight,
  CornerDownLeft,
  Command,
  Users,
  Loader2,
  FileText,
} from "lucide-react";
import { navigationIndex, SearchItem } from "@/data/navigationIndex";
import { clientsApi } from "@/lib/api/clients";
import clsx from "clsx";
import { Input, Label, TextField } from "@heroui/react";

const RECENT_SEARCHES_KEY = "corpe_recent_searches";
const MAX_RECENT = 5;
const CLIENT_SEARCH_LIMIT = 8;
const CLIENT_SEARCH_DEBOUNCE_MS = 300;

type SearchResultItem = SearchItem & {
  meta?: string;
};

function mapClientToSearchItem(client: {
  appNo?: string;
  client?: string;
  email?: string;
  entity?: string;
  status?: string;
}): SearchResultItem | null {
  const appNo = String(client.appNo || "").trim();
  if (!appNo) return null;

  const clientName = String(client.client || "").trim() || "Unnamed client";
  const email = String(client.email || "").trim();
  const entity = String(client.entity || "").trim();
  const status = String(client.status || "").trim();

  return {
    id: `client-${appNo}`,
    title: `${appNo} · ${clientName}`,
    category: "Client",
    path: `/clients/${appNo}`,
    keywords: [appNo, clientName, email, entity, status].filter(Boolean),
    description: [email, entity, status].filter(Boolean).join(" · "),
    meta: appNo,
  };
}

function ResultIcon({
  category,
  selected,
}: {
  category: string;
  selected: boolean;
}) {
  const iconClass = selected ? "text-[#F46A45]" : "text-slate-400";
  if (category === "Client") return <Users size={16} className={iconClass} />;
  if (category === "Page") return <ArrowRight size={16} className={iconClass} />;
  if (category === "Documents")
    return <FileText size={16} className={iconClass} />;
  return <CornerDownLeft size={15} className={iconClass} />;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [pageResults, setPageResults] = useState<SearchResultItem[]>([]);
  const [clientResults, setClientResults] = useState<SearchResultItem[]>([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clientSearchSeq = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setPageResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchTerms = query.toLowerCase().split(" ").filter(Boolean);
    const filtered = navigationIndex.filter((item) => {
      const matchText =
        `${item.title} ${item.category} ${item.keywords.join(" ")}`.toLowerCase();
      return searchTerms.every((term) => matchText.includes(term));
    });

    setPageResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setClientResults([]);
      setIsSearchingClients(false);
      return;
    }

    const seq = ++clientSearchSeq.current;
    setIsSearchingClients(true);

    const timer = window.setTimeout(async () => {
      try {
        const data = await clientsApi.getAllClients(1, CLIENT_SEARCH_LIMIT, {
          search: trimmed,
        });
        if (seq !== clientSearchSeq.current) return;

        const mapped = (data?.clients || [])
          .map(mapClientToSearchItem)
          .filter(Boolean) as SearchResultItem[];

        setClientResults(mapped);
      } catch (error) {
        if (seq !== clientSearchSeq.current) return;
        console.warn("[GlobalSearch] Client search failed", error);
        setClientResults([]);
      } finally {
        if (seq === clientSearchSeq.current) {
          setIsSearchingClients(false);
        }
      }
    }, CLIENT_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  const combinedResults = query.trim()
    ? [...clientResults, ...pageResults]
    : recentSearches;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, clientResults.length, pageResults.length]);

  const saveToRecent = useCallback((item: SearchResultItem) => {
    setRecentSearches((prev) => {
      const newRecent = [
        item,
        ...prev.filter((r) => r.id !== item.id),
      ].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
      return newRecent;
    });
  }, []);

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      saveToRecent(item);
      setIsOpen(false);
      setQuery("");
      setClientResults([]);
      setPageResults([]);
      router.push(item.path);
    },
    [router, saveToRecent],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = combinedResults;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(items.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + items.length) % Math.max(items.length, 1),
      );
    } else if (e.key === "Enter") {
      if (items[selectedIndex]) {
        handleSelect(items[selectedIndex]);
      }
    }
  };

  const hasQuery = Boolean(query.trim());
  const hasResults = combinedResults.length > 0;
  const showEmptyState = hasQuery && !isSearchingClients && !hasResults;

  const renderResultButton = (item: SearchResultItem, index: number) => {
    const selected = index === selectedIndex;

    return (
      <button
        key={`${item.id}-${index}`}
        type="button"
        onClick={() => handleSelect(item)}
        onMouseEnter={() => setSelectedIndex(index)}
        className={clsx(
          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150",
          selected
            ? "bg-[#FFF2EE] ring-1 ring-[#F46A45]/25"
            : "bg-transparent hover:bg-slate-50",
        )}
      >
        <div
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
            selected
              ? "border-[#F46A45]/20 bg-white text-[#F46A45] shadow-sm"
              : "border-slate-100 bg-slate-50 text-slate-400",
          )}
        >
          <ResultIcon category={item.category} selected={selected} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={clsx(
                "truncate text-sm font-semibold",
                selected ? "text-[#1C2F4D]" : "text-slate-800",
              )}
            >
              {item.title}
            </p>
            {item.category === "Client" && (
              <span
                className={clsx(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                  selected
                    ? "bg-[#F46A45]/12 text-[#C24528]"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                Client
              </span>
            )}
          </div>
          {item.description ? (
            <p
              className={clsx(
                "mt-0.5 line-clamp-1 text-[11px]",
                selected ? "text-[#7C2D1C]/70" : "text-slate-500",
              )}
            >
              {item.description}
            </p>
          ) : null}
        </div>

        {selected ? (
          <span className="shrink-0 rounded-md border border-[#F46A45]/20 bg-white px-2 py-1 text-[10px] font-bold tracking-wide text-[#F46A45] shadow-sm">
            Enter
          </span>
        ) : (
          <CornerDownLeft
            size={14}
            className="shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
          />
        )}
      </button>
    );
  };

  const sectionLabel = (label: string, accent?: boolean) => (
    <div
      className={clsx(
        "px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.08em]",
        accent ? "text-[#F46A45]" : "text-slate-400",
      )}
    >
      {label}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full md:max-w-lg">
      <div className="relative">
        <TextField
          value={query}
          onChange={(v) => setQuery(v)}
          name="corpe-global-search"
          autoComplete="off"
        >
          <Label className="sr-only">
            Search clients, applications, or pages
          </Label>
          <Input
            ref={inputRef}
            type="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            name="corpe-global-search"
            role="searchbox"
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search clients, app no, or pages..."
            className={clsx(
              "h-11 w-full rounded-2xl border bg-white pl-11 pr-16 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400",
              isOpen
                ? "border-[#F46A45] shadow-[0_0_0_4px_rgba(244,106,69,0.12)]"
                : "border-slate-200 shadow-sm hover:border-slate-300 focus:border-[#F46A45]",
            )}
          />
        </TextField>

        <Search
          className={clsx(
            "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
            isOpen ? "text-[#F46A45]" : "text-slate-400",
          )}
        />

        {!isOpen && (
          <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 md:flex">
            <Command size={10} />
            <span>K</span>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(28,47,77,0.14)]">
          <div className="border-b border-slate-100 px-4 py-2.5">
            {!hasQuery && recentSearches.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                <History size={12} />
                Recent searches
              </div>
            )}

            {hasQuery && (
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12px] text-slate-500">
                  {hasResults || isSearchingClients ? (
                    <>
                      Results for{" "}
                      <span className="font-semibold text-slate-800">
                        “{query}”
                      </span>
                    </>
                  ) : (
                    "No matches found"
                  )}
                </p>
                {isSearchingClients && (
                  <Loader2 size={13} className="animate-spin text-[#F46A45]" />
                )}
              </div>
            )}

            {!hasQuery && recentSearches.length === 0 && (
              <p className="text-[12px] text-slate-400">
                Search by client name, application no, or page
              </p>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto px-2 py-2 custom-scrollbar">
            {!hasQuery &&
              recentSearches.map((item, index) =>
                renderResultButton(item, index),
              )}

            {hasQuery && clientResults.length > 0 && (
              <>
                {sectionLabel("Clients & applications", true)}
                {clientResults.map((item, index) =>
                  renderResultButton(item, index),
                )}
              </>
            )}

            {hasQuery && pageResults.length > 0 && (
              <>
                {sectionLabel("Pages & sections")}
                {pageResults.map((item, index) =>
                  renderResultButton(item, clientResults.length + index),
                )}
              </>
            )}

            {showEmptyState && (
              <div className="px-3 py-10 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                  <Search size={18} />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  No results found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try an application number, client name, or page title
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 shadow-sm">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 shadow-sm">
                  Enter
                </kbd>
                Open
              </span>
            </div>
            <div className="text-[10px] font-medium text-slate-400">
              {hasQuery
                ? `${clientResults.length} clients · ${pageResults.length} pages`
                : `${navigationIndex.length} pages indexed`}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
