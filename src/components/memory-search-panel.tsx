"use client";

import { useMemo, useState } from "react";
import type { MemoryEntry } from "@/lib/data";
import { Search } from "lucide-react";

interface MemorySearchPanelProps {
  entries: MemoryEntry[];
}

export function MemorySearchPanel({ entries }: MemorySearchPanelProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return entries;
    return entries.filter((entry) =>
      entry.date.toLowerCase().includes(needle) || entry.content.toLowerCase().includes(needle)
    );
  }, [entries, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-zinc-100">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by keyword or date (e.g., 2026-03-23)"
            className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          {filtered.length} / {entries.length} days
        </p>
      </div>
      <div className="mt-6 max-h-[32rem] space-y-3 overflow-y-auto pr-2">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
            No memory entries match that search.
          </div>
        )}
        {filtered.map((entry) => (
          <details key={entry.date} className="group rounded-2xl border border-white/5 bg-muted/40 p-4">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-zinc-100">
              <span>{entry.date}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">tap to expand</span>
            </summary>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {entry.content}
            </pre>
          </details>
        ))}
      </div>
    </div>
  );
}
