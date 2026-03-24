import { getMemoryEntries } from "@/lib/data";
import { MemorySearchPanel } from "@/components/memory-search-panel";

export default async function MemoryToolPage() {
  const entries = await getMemoryEntries(100);

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Tools</p>
          <h1 className="text-3xl font-semibold">Memory Logs</h1>
          <p className="text-sm text-zinc-400">Search, filter, and expand every daily memory entry in full-screen mode.</p>
        </div>
        <MemorySearchPanel entries={entries} />
      </div>
    </div>
  );
}
