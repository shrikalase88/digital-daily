"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, SlidersHorizontal, Check } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  sources: string[];
  activeSources: string[];
  onSourceToggle: (source: string) => void;
}

export default function SearchBar({
  onSearch,
  sources,
  activeSources,
  onSourceToggle,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSources, setShowSources] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowSources(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (⌘K or / to focus)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query);
  }

  function handleClear() {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative flex items-center gap-2 w-full">
      <form onSubmit={handleSubmit} role="search" className="relative flex-1 group">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-white transition-colors"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search live stories, topics or sources..."
          style={{ fontSize: "16px" }}
          className="w-full rounded-2xl ios-glass py-2 sm:py-2.5 pl-10 pr-16 text-[16px] sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none border border-white/10 transition-all focus:border-white/30 focus:ring-1 focus:ring-white/10 focus:bg-white/[0.04]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/10">
              ⌘K
            </kbd>
          )}
        </div>
      </form>

      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setShowSources(!showSources)}
          aria-expanded={showSources}
          aria-label="Filter sources"
          className={`flex h-9 sm:h-10 items-center gap-1.5 rounded-2xl ios-pill px-3 text-xs font-semibold border transition-all active:scale-[0.98] ${
            activeSources.length < sources.length
              ? "text-amber-300 border-amber-500/40 bg-amber-500/15 shadow-sm"
              : "text-zinc-300 border-white/10 hover:text-white hover:border-white/20"
          }`}
        >
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">Sources</span>
          {activeSources.length < sources.length ? (
            <span className="rounded-full bg-amber-400 text-black px-1.5 py-0.2 text-[10px] font-bold">
              {activeSources.length}
            </span>
          ) : (
            <span className="text-[10px] text-zinc-500 hidden md:inline">
              ({sources.length})
            </span>
          )}
        </button>

        {showSources && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] max-h-80 overflow-y-auto ios-glass-elevated rounded-2xl p-3 border border-white/15 shadow-2xl">
            <div className="mb-2.5 flex items-center justify-between px-2 pb-2 border-b border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Filter Sources
              </span>
              <button
                onClick={() => {
                  sources.forEach((s) => {
                    if (!activeSources.includes(s)) onSourceToggle(s);
                  });
                }}
                className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                Select All
              </button>
            </div>
            <div className="space-y-1">
              {sources.map((source) => {
                const isSelected = activeSources.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => onSourceToggle(source)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors text-left ${
                      isSelected
                        ? "text-white bg-white/[0.08]"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <span className="truncate">{source}</span>
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-md border text-[10px] transition-all ${
                        isSelected
                          ? "bg-white border-white text-black font-bold"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
