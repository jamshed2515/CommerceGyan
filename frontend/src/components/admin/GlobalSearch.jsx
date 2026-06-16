"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Users, BookOpen, Layers, Calendar, User, Loader2 } from "lucide-react";
import API from "@/config/api";

const CATEGORY_CONFIG = {
  students:  { label: "Students",  icon: Users,     color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/40",   tab: "students"   },
  teachers:  { label: "Teachers",  icon: User,      color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40", tab: "teachers" },
  courses:   { label: "Courses",   icon: BookOpen,  color: "text-emerald-500",bg: "bg-emerald-50 dark:bg-emerald-950/40", tab: "courses" },
  batches:   { label: "Batches",   icon: Layers,    color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/40",  tab: "batches"   },
  schedules: { label: "Schedules", icon: Calendar,  color: "text-rose-500",   bg: "bg-rose-50 dark:bg-rose-950/40",   tab: "schedules" },
};

function getResultLabel(category, item) {
  switch (category) {
    case "students":
      return {
        primary: item.name,
        secondary: [item.className, item.stream, item.batch?.batchName].filter(Boolean).join(" · "),
      };
    case "teachers":
      return {
        primary: item.name,
        secondary: [item.subject, item.email].filter(Boolean).join(" · "),
      };
    case "courses":
      return {
        primary: item.title,
        secondary: [item.category, item.price ? `₹${item.price}` : null].filter(Boolean).join(" · "),
      };
    case "batches":
      return {
        primary: item.batchName,
        secondary: [item.course?.title, item.timing, item.teacher?.name].filter(Boolean).join(" · "),
      };
    case "schedules":
      return {
        primary: `${item.subject} — ${item.dayOfWeek}`,
        secondary: [item.batch?.batchName, `${item.startTime}–${item.endTime}`, item.teacher?.name].filter(Boolean).join(" · "),
      };
    default:
      return { primary: "Unknown", secondary: "" };
  }
}

// Flat list of all results for keyboard navigation
function flattenResults(results) {
  const flat = [];
  for (const category of Object.keys(CATEGORY_CONFIG)) {
    if (results[category]?.length > 0) {
      for (const item of results[category]) {
        flat.push({ category, item });
      }
    }
  }
  return flat;
}

export default function GlobalSearch({ token, onNavigate }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const totalResults = results
    ? Object.values(results).reduce((s, arr) => s + arr.length, 0)
    : 0;
  const flatResults = results ? flattenResults(results) : [];

  // ── Open / Close ──────────────────────────────────────────────────────────
  const openSearch = useCallback(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults(null);
    setActiveIndex(0);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        open ? closeSearch() : openSearch();
      }
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openSearch, closeSearch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeSearch();
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeSearch]);

  // ── Debounced search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) { setResults(null); setLoading(false); return; }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/admin/search?q=${encodeURIComponent(q)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setResults(data);
        setActiveIndex(0);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(debounceRef.current);
  }, [query, open, token]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!flatResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[activeIndex]) navigateTo(flatResults[activeIndex]);
    }
  };

  // ── Navigate to result ────────────────────────────────────────────────────
  const navigateTo = ({ category, item }) => {
    closeSearch();
    const tab = CATEGORY_CONFIG[category].tab;
    onNavigate(tab, item._id);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Trigger button (replaces the static input in the header) */}
      <button
        onClick={openSearch}
        className="hidden sm:flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 h-10 w-72 xl:w-96 hover:border-blue-400/50 hover:bg-white dark:hover:bg-slate-900 transition-all text-left group"
        aria-label="Open search (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 group-hover:text-blue-500 transition-colors" />
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex-1 group-hover:text-slate-500 transition-colors">
          Search students, courses, batches...
        </span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 select-none rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-400 shadow-sm">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Search Overlay */}
      {open && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Panel */}
          <div
            ref={containerRef}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-down"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
              {loading ? (
                <Loader2 className="w-4 h-4 text-blue-500 shrink-0 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search students, teachers, courses, batches..."
                className="flex-1 bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:ring-0"
                autoComplete="off"
                spellCheck="false"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}
                  className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3 text-slate-500" />
                </button>
              )}
              <kbd
                onClick={closeSearch}
                className="inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Idle state */}
              {!query && !results && (
                <div className="py-10 text-center">
                  <Search className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                    Start typing to search
                  </p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1 font-semibold">
                    Students · Teachers · Courses · Batches · Schedules
                  </p>
                </div>
              )}

              {/* Loading */}
              {loading && query && (
                <div className="py-10 text-center">
                  <Loader2 className="w-6 h-6 text-blue-500 mx-auto animate-spin" />
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-3">Searching...</p>
                </div>
              )}

              {/* No results */}
              {!loading && results && totalResults === 0 && (
                <div className="py-10 text-center">
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                    No results for <span className="text-slate-600 dark:text-slate-300">&quot;{query}&quot;</span>
                  </p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1 font-semibold">
                    Try a different name, email, or subject
                  </p>
                </div>
              )}

              {/* Grouped results */}
              {!loading && results && totalResults > 0 && (() => {
                let flatIdx = 0;
                return Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
                  const items = results[cat] || [];
                  if (!items.length) return null;
                  const Icon = cfg.icon;
                  return (
                    <div key={cat}>
                      {/* Category header */}
                      <div className={`flex items-center gap-2 px-4 py-2 ${cfg.bg} border-b border-slate-100 dark:border-slate-800`}>
                        <Icon className={`w-3 h-3 ${cfg.color} shrink-0`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {items.length}
                        </span>
                      </div>

                      {/* Items */}
                      {items.map((item) => {
                        const { primary, secondary } = getResultLabel(cat, item);
                        const thisIdx = flatIdx++;
                        const isActive = thisIdx === activeIndex;
                        return (
                          <button
                            key={item._id}
                            onMouseEnter={() => setActiveIndex(thisIdx)}
                            onClick={() => navigateTo({ category: cat, item })}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 ${
                              isActive
                                ? "bg-blue-50 dark:bg-blue-950/40"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            {/* Icon badge */}
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                            </span>

                            {/* Text */}
                            <div className="min-w-0 flex-1">
                              <p className={`text-[13px] font-bold truncate ${
                                isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"
                              }`}>
                                {primary}
                              </p>
                              {secondary && (
                                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                  {secondary}
                                </p>
                              )}
                            </div>

                            {/* Arrow hint */}
                            {isActive && (
                              <span className="text-[10px] font-black text-blue-400 dark:text-blue-500 shrink-0">
                                ↵ Open
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer */}
            {results && totalResults > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 font-mono text-[9px]">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 font-mono text-[9px]">↵</kbd>
                  Open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 font-mono text-[9px]">Esc</kbd>
                  Close
                </span>
                <span className="ml-auto">{totalResults} result{totalResults !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
