import {
  getDailyLogs,
  getAgentLanes,
  getMissionMetrics,
  getPipelineItems,
  getDashboardSnapshot,
  getReminderEntries,
  getWorklogSummaries,
  getMemoryEntries
} from "@/lib/data";
import { MemorySearchPanel } from "@/components/memory-search-panel";
import { clsx } from "clsx";
import { Activity, CalendarCheck2, Clock, Flame, LayoutGrid, LogOutIcon, NotebookPen, RefreshCcw } from "lucide-react";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-600/20 text-emerald-300",
  planning: "bg-sky-500/20 text-sky-200",
  blocked: "bg-rose-500/20 text-rose-200",
  review: "bg-amber-500/20 text-amber-200"
};

export default async function MissionControl() {
  const [
    logs,
    agentLanes,
    metrics,
    pipelineItems,
    snapshot,
    reminderEntries,
    worklogs,
    memoryEntries
  ] = await Promise.all([
    getDailyLogs(),
    getAgentLanes(),
    getMissionMetrics(),
    getPipelineItems(),
    getDashboardSnapshot(),
    getReminderEntries(),
    getWorklogSummaries(),
    getMemoryEntries()
  ]);

  const reminderList = reminderEntries.length
    ? reminderEntries.map((entry) => entry.action ? `${entry.title}: ${entry.action}` : entry.title)
    : snapshot.reminders;
  const quickReminders = reminderList.slice(0, 4);
  const openLoops = snapshot.openLoops.slice(0, 4);

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">ATLAS OPERATIONS</p>
            <h1 className="mt-3 text-4xl font-semibold">Mission Control Dashboard</h1>
            <p className="mt-2 text-zinc-400">Clean, Linear-inspired overview of everything Paul & Atlas are moving forward today.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/30">
              <RefreshCcw className="h-4 w-4" /> Refresh Data
            </button>
            <button className="flex items-center gap-2 rounded-full bg-foreground/90 px-4 py-2 text-sm font-medium text-background">
              <NotebookPen className="h-4 w-4" /> Log Update
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-white/5 bg-gradient-to-br from-card via-card/80 to-card/40 p-6 shadow-[0_25px_45px_rgba(5,8,20,0.45)]">
              <div className="text-sm text-zinc-500">{metric.label}</div>
              <div className="mt-3 text-3xl font-semibold">{metric.value}</div>
              <p className="mt-2 text-xs text-zinc-400">
                {metric.trend === "up" && "↗"}
                {metric.trend === "down" && "↘"}
                {metric.trend === "flat" && "→"} {metric.delta}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <section className="rounded-3xl border border-white/5 bg-card/80 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Daily Memory</p>
                <h2 className="mt-2 text-2xl font-semibold">Latest Logs</h2>
              </div>
              <Link href="#" className="text-sm text-accent">Open archive →</Link>
            </div>
            <div className="mt-6 space-y-6">
              {logs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
                  No memory files found yet. Start logging today’s work to populate this view.
                </div>
              )}
              {logs.map((log) => (
                <div key={log.date} className="rounded-2xl border border-white/5 bg-muted/40 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{log.date}</p>
                      <h3 className="mt-1 text-xl font-semibold">Day Summary</h3>
                    </div>
                    <Clock className="h-4 w-4 text-zinc-500" />
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                    {log.summary.length === 0 && <li>Summary pending.</li>}
                    {log.summary.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-zinc-300">
                        <span className="text-accent/70">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {log.actions.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Key Actions</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {log.actions.map((action, idx) => (
                          <span key={idx} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-200">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-card/80 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Quick Actions</h2>
              <LayoutGrid className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="mt-6 space-y-3">
              {(quickReminders.length > 0
                ? quickReminders.map((label) => ({ label, icon: Clock }))
                : [
                    { label: "Log new memory entry", icon: NotebookPen },
                    { label: "Spin up specialist agent", icon: Activity },
                    { label: "Review tomorrow’s agenda", icon: CalendarCheck2 },
                    { label: "Sync follow-up queue", icon: Flame }
                  ]
              ).map((action) => (
                <button
                  key={action.label}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-gradient-to-r from-muted/60 to-transparent px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-white/30"
                >
                  <span>{action.label}</span>
                  <action.icon className="h-4 w-4 text-zinc-500" />
                </button>
              ))}
            </div>
            {openLoops.length > 0 && (
              <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4 text-xs text-zinc-400">
                <p className="font-semibold text-zinc-200">Open loops on radar</p>
                <ul className="mt-2 space-y-1">
                  {openLoops.map((loop, idx) => (
                    <li key={idx} className="flex gap-2 text-left text-zinc-300">
                      <span className="text-accent/60">•</span>
                      <span>{loop}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4 text-xs text-zinc-400">
              <p className="font-semibold text-zinc-200">Automation Queue</p>
              <p className="mt-1 text-zinc-400">{snapshot.systemStatus[0] ?? "No system notes"}</p>
            </div>
          </section>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/5 bg-card/80 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Agent Pipelines</p>
                <h2 className="mt-2 text-2xl font-semibold">Active Workstreams</h2>
              </div>
              <LogOutIcon className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="mt-6 space-y-4">
              {pipelineItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/5 bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{item.title}</h3>
                      <p className="text-xs text-zinc-500">Lead: {item.owner}</p>
                    </div>
                    <span className={clsx("rounded-full px-3 py-1 text-xs font-medium", statusStyles[item.status])}>{item.status}</span>
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-black/20 px-3 py-1 capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.eta && <p className="mt-2 text-xs text-zinc-500">ETA: {item.eta}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-card/80 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Agent Status</p>
                <h2 className="mt-2 text-2xl font-semibold">Four-Lane Overview</h2>
              </div>
              <Clock className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="mt-6 space-y-4">
              {agentLanes.map((lane) => (
                <div key={lane.name} className="rounded-2xl border border-white/5 bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{lane.focus}</p>
                      <h3 className="text-lg font-semibold">{lane.name}</h3>
                    </div>
                    <span
                      className={clsx(
                        "rounded-full px-3 py-1 text-xs font-medium capitalize",
                        lane.status === "online" && "bg-emerald-500/20 text-emerald-200",
                        lane.status === "syncing" && "bg-sky-500/20 text-sky-100",
                        lane.status === "research" && "bg-purple-500/20 text-purple-100",
                        lane.status === "offline" && "bg-zinc-700/50 text-zinc-300"
                      )}
                    >
                      {lane.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                    {lane.highlights.map((highlight) => (
                      <span key={highlight} className="rounded-full bg-black/20 px-3 py-1">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-3xl border border-white/5 bg-card/80 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Worklog Feed</p>
              <h2 className="mt-2 text-2xl font-semibold">Specialist Highlights</h2>
            </div>
            <p className="text-sm text-zinc-400">Pulled directly from the Micah / Grant / Nova worklogs.</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {worklogs.map((log) => (
              <div key={log.agent} className="rounded-2xl border border-white/5 bg-muted/40 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
                  <span>{log.agent}</span>
                  <span>{log.date ?? "No date"}</span>
                </div>
                {log.status && <p className="mt-2 text-sm text-zinc-300">{log.status}</p>}
                <div className="mt-4 text-xs text-zinc-400">
                  <p className="font-semibold uppercase tracking-[0.3em] text-zinc-500">Immediate</p>
                  <ul className="mt-2 space-y-2">
                    {(log.immediate.length ? log.immediate : ["No priorities logged"]).map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-zinc-300">
                        <span className="text-accent/70">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {log.next.length > 0 && (
                  <div className="mt-4 text-xs text-zinc-400">
                    <p className="font-semibold uppercase tracking-[0.3em] text-zinc-500">Next</p>
                    <ul className="mt-2 space-y-1">
                      {log.next.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-accent/60">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/5 bg-card/80 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Memory Vault</p>
              <h2 className="mt-2 text-2xl font-semibold">Searchable Daily Log</h2>
            </div>
            <p className="text-sm text-zinc-400">Every note in /memory, searchable by keyword or date.</p>
          </div>
          <div className="mt-6">
            <MemorySearchPanel entries={memoryEntries} />
          </div>
        </section>
      </div>
    </main>
  );
}
