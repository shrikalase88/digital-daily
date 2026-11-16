"use client";

import { LayoutGrid, List, Layers } from "lucide-react";

export type ViewMode = "bento" | "compact" | "visual";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-full p-1 backdrop-blur-md">
      <button
        onClick={() => onViewModeChange("bento")}
        className={`flex h-7 items-center gap-1.5 px-2.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
          viewMode === "bento"
            ? "bg-white/20 text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
        title="Bento Grid View"
        aria-label="Bento Grid View"
      >
        <LayoutGrid size={13} />
        <span className="hidden sm:inline text-[11px]">Bento</span>
      </button>

      <button
        onClick={() => onViewModeChange("compact")}
        className={`flex h-7 items-center gap-1.5 px-2.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
          viewMode === "compact"
            ? "bg-white/20 text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
        title="Compact Feed View"
        aria-label="Compact Feed View"
      >
        <List size={13} />
        <span className="hidden sm:inline text-[11px]">Compact</span>
      </button>

      <button
        onClick={() => onViewModeChange("visual")}
        className={`flex h-7 items-center gap-1.5 px-2.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
          viewMode === "visual"
            ? "bg-white/20 text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
        title="Visual Cards View"
        aria-label="Visual Cards View"
      >
        <Layers size={13} />
        <span className="hidden sm:inline text-[11px]">Visual</span>
      </button>
    </div>
  );
}
