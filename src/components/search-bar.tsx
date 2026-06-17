"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  sources: string[];
  activeSources: string[];
  onSourceToggle: (source: string) => void;
}

export default function SearchBar({ onSearch, sources, activeSources, onSourceToggle }: SearchBarProps) {
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
    <div className="relative flex items-center gap-2">
      <form onSubmit={handleSubmit} className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value); }}
          placeholder="Search news..."
          className="w-full rounded-full ios-glass py-1.5 pl-8 pr-8 text-xs text-white/70 placeholder:text-white/20 outline-none transition-colors focus:ring-1 focus:ring-white/10"
        />
        {query && (
          <button type="button" onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={12} />
          </button>
        )}
      </form>

      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setShowSources(!showSources)}
          className={`flex h-7 items-center gap-1 rounded-full ios-glass px-2.5 text-[10px] font-medium transition-colors ${
            activeSources.length < sources.length
              ? "text-amber-400"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          Sources
          {activeSources.length < sources.length && (
            <span className="ml-0.5 text-[9px]">({activeSources.length})</span>
          )}
        </button>

        {showSources && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 max-h-72 overflow-y-auto ios-glass rounded-2xl p-2">
            <div className="mb-2 flex items-center justify-between px-2 pb-1.5 border-b border-white/[0.04]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Filter Sources</span>
              <button
                onClick={() => { sources.forEach((s) => { if (!activeSources.includes(s)) onSourceToggle(s); }); }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300"
              >
                All
              </button>
            </div>
            {sources.map((source) => (
              <label
                key={source}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/[0.04]"
              >
                <input
                  type="checkbox"
                  checked={activeSources.includes(source)}
                  onChange={() => onSourceToggle(source)}
                  className="h-3 w-3 rounded border-white/10 bg-white/[0.04] accent-cyan-500"
                />
                <span className="truncate">{source}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
