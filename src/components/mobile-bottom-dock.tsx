"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Zap, Activity, Search, Bookmark } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";

interface MobileBottomDockProps {
  onOpenStories: () => void;
  onOpenPulse: () => void;
  onOpenSearch: () => void;
}

export default function MobileBottomDock({
  onOpenStories,
  onOpenPulse,
  onOpenSearch,
}: MobileBottomDockProps) {
  const pathname = usePathname();
  const { bookmarks } = useBookmarks();
  const isBookmarksPage = pathname === "/bookmarks";
  const isHomePage = pathname === "/";

  return (
    <div className="fixed bottom-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none md:hidden">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="ios-glass-dock pointer-events-auto flex items-center justify-between gap-1 rounded-full px-2.5 py-1.5 shadow-2xl backdrop-blur-2xl max-w-sm w-full border border-white/15"
      >
        {/* Feed / Home */}
        <Link
          href="/"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            isHomePage
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <motion.div whileTap={{ scale: 0.88 }}>
            <Newspaper size={18} />
          </motion.div>
          <span className="text-[10px] tracking-tight mt-0.5">Feed</span>
          {isHomePage && (
            <motion.div
              layoutId="dock-indicator"
              className="absolute -bottom-0.5 h-0.5 w-3 rounded-full bg-white"
            />
          )}
        </Link>

        {/* 60s Stories Flash */}
        <button
          onClick={onOpenStories}
          className="relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all group"
        >
          <motion.div whileTap={{ scale: 0.88 }} className="flex items-center justify-center">
            <Zap size={18} className="text-amber-400 fill-amber-400/25" />
          </motion.div>
          <span className="text-[10px] tracking-tight mt-0.5 text-amber-300 font-medium">
            Stories
          </span>
        </button>

        {/* Live Pulse Drawer */}
        <button
          onClick={onOpenPulse}
          className="relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all group"
        >
          <motion.div
            whileTap={{ scale: 0.88 }}
            className="relative flex items-center justify-center"
          >
            <Activity size={18} className="text-rose-400" />
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
          </motion.div>
          <span className="text-[10px] tracking-tight mt-0.5 text-rose-300 font-medium">
            Pulse
          </span>
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <motion.div whileTap={{ scale: 0.88 }}>
            <Search size={18} />
          </motion.div>
          <span className="text-[10px] tracking-tight mt-0.5">Search</span>
        </button>

        {/* Bookmarks */}
        <Link
          href="/bookmarks"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            isBookmarksPage
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <motion.div whileTap={{ scale: 0.88 }} className="relative">
            <Bookmark size={18} />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-black font-mono">
                {bookmarks.length > 9 ? "9+" : bookmarks.length}
              </span>
            )}
          </motion.div>
          <span className="text-[10px] tracking-tight mt-0.5">Saved</span>
          {isBookmarksPage && (
            <motion.div
              layoutId="dock-indicator"
              className="absolute -bottom-0.5 h-0.5 w-3 rounded-full bg-amber-400"
            />
          )}
        </Link>
      </motion.div>
    </div>
  );
}
