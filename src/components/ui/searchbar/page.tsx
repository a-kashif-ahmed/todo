"use client";
import { useState, useEffect, useRef } from "react";
import { Search, GitBranch, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Workflow {
  id: string;
  name: string;
  platform: string;
  status: string;
}

interface Incident {
  id: string;
  workflow_id: string;
  error_message: string | null;
  detected_at: string;
}

interface Result {
  type: "workflow" | "incident";
  id: string;
  label: string;
  sublabel: string;
  href: string;
  status?: string;
}

const statusDot: Record<string, string> = {
  healthy:  "bg-status-success",
  failing:  "bg-status-error",
  degraded: "bg-status-warning",
  unknown:  "bg-gray-500",
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [allData, setAllData] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load all data once on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [wfRes, incRes] = await Promise.all([
          fetch("/api/workflows").then(r => r.json()),
          fetch("/api/incidents?status=open").then(r => r.json()),
        ]);

        const workflowResults: Result[] = (wfRes.workflows || []).map((w: Workflow) => ({
          type: "workflow",
          id: w.id,
          label: w.name,
          sublabel: `${w.platform} · ${w.status}`,
          href: `/workflows/${w.id}`,
          status: w.status,
        }));

        const incidentResults: Result[] = (incRes.incidents || []).map((inc: Incident) => ({
          type: "incident",
          id: inc.id,
          label: inc.error_message || "Workflow failure",
          sublabel: `Incident · ${new Date(inc.detected_at).toLocaleString()}`,
          href: `/workflows/${inc.workflow_id}/incidents/${inc.id}`,
        }));

        setAllData([...workflowResults, ...incidentResults]);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  // Filter on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setSelected(-1);
      return;
    }
    const q = query.toLowerCase();
    const filtered = allData.filter(r =>
      r.label.toLowerCase().includes(q) ||
      r.sublabel.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 8));
    setOpen(true);
    setSelected(-1);
  }, [query, allData]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function navigate(href: string) {
    setQuery("");
    setOpen(false);
    setSelected(-1);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && selected >= 0) {
      navigate(results[selected].href);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      {/* Search input */}
      <div className={`flex items-center gap-3 rounded-full border bg-surface-2 px-5 py-2 transition-colors ${
        open ? "border-brand-blue/40" : "border-border"
      }`}>
        <Search size={15} className="text-text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search workflows, incidents..."
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-2 border border-border rounded-xl shadow-xl overflow-hidden z-50">

          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-text-muted">
              No results for "{query}"
            </div>
          ) : (
            <>
              {/* Workflows group */}
              {results.filter(r => r.type === "workflow").length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-4 pt-3 pb-1">
                    Workflows
                  </p>
                  {results.filter(r => r.type === "workflow").map((r, i) => {
                    const globalIdx = results.indexOf(r);
                    return (
                      <button
                        key={r.id}
                        onClick={() => navigate(r.href)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          selected === globalIdx ? "bg-brand-blue/10" : "hover:bg-surface-3/50"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                          <GitBranch size={12} className="text-brand-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{r.label}</p>
                          <p className="text-[11px] text-text-muted capitalize">{r.sublabel}</p>
                        </div>
                        {r.status && (
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[r.status] || "bg-gray-500"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Incidents group */}
              {results.filter(r => r.type === "incident").length > 0 && (
                <div className="border-t border-border-light">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-4 pt-3 pb-1">
                    Open Incidents
                  </p>
                  {results.filter(r => r.type === "incident").map(r => {
                    const globalIdx = results.indexOf(r);
                    return (
                      <button
                        key={r.id}
                        onClick={() => navigate(r.href)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          selected === globalIdx ? "bg-brand-blue/10" : "hover:bg-surface-3/50"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-status-error/10 border border-status-error/20 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={12} className="text-status-error" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{r.label}</p>
                          <p className="text-[11px] text-text-muted">{r.sublabel}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-border-light flex items-center gap-3 text-[10px] text-gray-600">
                <span><kbd className="bg-surface border border-border rounded px-1">↑↓</kbd> navigate</span>
                <span><kbd className="bg-surface border border-border rounded px-1">↵</kbd> open</span>
                <span><kbd className="bg-surface border border-border rounded px-1">esc</kbd> close</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}