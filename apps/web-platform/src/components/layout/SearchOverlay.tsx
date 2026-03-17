import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TRENDING_SEARCHES = [
  "Book a ride to downtown",
  "Find nearby clinics",
  "Pay utility bills",
  "Events this weekend",
  "Air quality index",
  "Nearby restaurants",
];

const RECENT_SEARCHES_KEY = "cityos_recent_searches";
const MAX_RECENT = 6;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export function SearchOverlay({ isOpen, onClose, onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) onSearch("");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, onSearch]);

  const handleSubmit = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      const trimmed = searchQuery.trim();
      const updated = [trimmed, ...recentSearches.filter((r) => r !== trimmed)].slice(0, MAX_RECENT);
      setRecentSearches(updated);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      onSearch(trimmed);
      onClose();
    },
    [recentSearches, onSearch, onClose],
  );

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  }, []);

  if (!isOpen) return null;

  const filteredTrending = query
    ? TRENDING_SEARCHES.filter((t) => t.toLowerCase().includes(query.toLowerCase()))
    : TRENDING_SEARCHES;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center pt-[10vh] px-4">
        <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(query);
              }}
              placeholder="Ask Dakkah anything..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} className="p-1 rounded hover:bg-muted">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded border border-border bg-muted text-[10px] text-muted-foreground font-mono">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {recentSearches.length > 0 && !query && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent</span>
                  <button onClick={clearRecent} className="text-[10px] text-muted-foreground hover:text-foreground">
                    Clear
                  </button>
                </div>
                {recentSearches.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(item)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left group"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{item}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <div className={cn("p-3", recentSearches.length > 0 && !query && "border-t border-border")}>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {query ? "Suggestions" : "Trending"}
              </span>
              {filteredTrending.length > 0 ? (
                filteredTrending.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(item)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left group"
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{item}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))
              ) : (
                <button
                  onClick={() => handleSubmit(query)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left group"
                >
                  <Search className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm flex-1">
                    Ask: <span className="font-medium text-primary">"{query}"</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              )}
            </div>
          </div>

          <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Powered by Dakkah AI Copilot
            </span>
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono">&#8984;K</kbd>
              <span>to open</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
