"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  History,
  ArrowRight,
  CornerDownLeft,
  Command,
} from "lucide-react";
import { navigationIndex, SearchItem } from "@/data/navigationIndex";
import clsx from "clsx";

const RECENT_SEARCHES_KEY = "corpe_recent_searches";
const MAX_RECENT = 5;

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
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

  // Keyboard shortcut (Ctrl+K / Cmd+K)
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

  // Handle Outside Click
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

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchTerms = query.toLowerCase().split(" ").filter(Boolean);
    const filtered = navigationIndex.filter((item) => {
      const matchText =
        `${item.title} ${item.category} ${item.keywords.join(" ")}`.toLowerCase();
      return searchTerms.every((term) => matchText.includes(term));
    });

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  const saveToRecent = (item: SearchItem) => {
    const newRecent = [
      item,
      ...recentSearches.filter((r) => r.id !== item.id),
    ].slice(0, MAX_RECENT);
    setRecentSearches(newRecent);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  };

  const handleSelect = (item: SearchItem) => {
    saveToRecent(item);
    setIsOpen(false);
    setQuery("");
    router.push(item.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query.trim() ? results : recentSearches;

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

  const currentItems = query.trim() ? results : recentSearches;
  const hasResults = query.trim()
    ? results.length > 0
    : recentSearches.length > 0;

  return (
    <div ref={containerRef} className="relative w-full md:max-w-lg">
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages or sections..."
          className={clsx(
            "h-11 w-full rounded-2xl border bg-white pl-11 pr-16 text-sm transition-all duration-200 outline-none text-secondary-900 placeholder:text-gray-400",
            isOpen
              ? "border-primary-500 ring-4 ring-primary-50 shadow-md"
              : "border-gray-200 hover:border-primary-300 focus:border-primary-500 shadow-sm",
          )}
        />
        <Search
          className={clsx(
            "absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 transition-colors duration-200",
            isOpen ? "text-primary-500" : "text-gray-400",
          )}
        />

        {/* Ctrl+K Hint */}
        {!isOpen && (
          <div className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] text-gray-400 font-medium pointer-events-none">
            <Command size={10} />
            <span>K</span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {!query.trim() && recentSearches.length > 0 && (
              <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <History size={12} />
                Recent Searches
              </div>
            )}

            {query.trim() && (
              <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {results.length > 0
                  ? `Results for "${query}"`
                  : "No results found"}
              </div>
            )}

            <div className="mt-1 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
              {currentItems.map((item, index) => (
                <button
                  key={`${item.id}-${index}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all duration-150",
                    index === selectedIndex
                      ? "bg-primary-50 text-secondary-900"
                      : "text-gray-600 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                        index === selectedIndex
                          ? "bg-white text-primary-500 shadow-sm"
                          : "bg-gray-100 text-gray-400",
                      )}
                    >
                      {item.category === "Page" ? (
                        <ArrowRight size={18} />
                      ) : (
                        <CornerDownLeft size={16} />
                      )}
                    </div>
                    <div>
                      <p
                        className={clsx(
                          "text-sm font-semibold",
                          index === selectedIndex
                            ? "text-secondary-900"
                            : "text-gray-800",
                        )}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {index === selectedIndex && (
                    <span className="text-[10px] font-bold text-primary-500 bg-white px-2 py-1 rounded shadow-sm">
                      ENTER
                    </span>
                  )}
                </button>
              ))}

              {!hasResults && query.trim() && (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-400">
                    No navigation items found for your search.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
                <span className="px-1.5 py-0.5 rounded border border-gray-200 bg-white shadow-sm">
                  ↑↓
                </span>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
                <span className="px-1.5 py-0.5 rounded border border-gray-200 bg-white shadow-sm">
                  Enter
                </span>
                <span>Select</span>
              </div>
            </div>
            <div className="text-[10px] text-gray-300 font-medium italic">
              Searching {navigationIndex.length} items
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
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
