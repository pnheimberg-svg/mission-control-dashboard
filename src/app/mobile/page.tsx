import {
  getAgentLanes,
  getDailyLogs,
  getDashboardSnapshot,
  getMissionMetrics,
  getPipelineItems,
  getReminderEntries,
  getWorklogSummaries
} from "@/lib/data";
import Link from "next/link";
import { Activity, ArrowUpRight, Clock, MapPin, PhoneCall } from "lucide-react";

export default async function MobileMissionControl() {
  const [logs, agentLanes, metrics, pipelineItems, snapshot, reminders, worklogs] = await Promise.all([
    getDailyLogs(2),
    getAgentLanes(),
    getMissionMetrics(),
    getPipelineItems(),
    getDashboardSnapshot(),
    getReminderEntries(),
    getWorklogSummaries()
  ]);

  const reminderList = reminders.length
    ? reminders.map((entry) => entry.action ? `${entry.title}: ${entry.action}` : entry.title)
    : snapshot.reminders;
  const phoneReminders = reminderList.slice(0, 3);
  const phoneLoops = snapshot.openLoops.slice(0, 3);

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-sm text-zinc-100">
      <header className="space-y-2">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-zinc-500">Atlas Ops</p>
        <h1 className="text-2xl font-semibold">Mission Control · Mobile</h1>
        <p className="text-xs text-zinc-400">Quick-status view optimized for phones. Tap into the full dashboard anytime you need deeper context.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-accent transition hover:text-accent/80"
        >
          Open full dashboard <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/5 bg-card/80 p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
            <p className="text-xs text-zinc-400">{metric.delta}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-white/5 bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">Agents</p>
            <h2 className="text-lg font-semibold">Four-lane snapshot</h2>
          </div>
          <Activity className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="mt-4 space-y-3">
          {agentLanes.map((lane) => (
            <div key={lane.name} className="rounded-xl border border-white/5 bg-black/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-100">{lane.name}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-zinc-200">{lane.status}</span>
              </div>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">{lane.focus}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-[0.7rem] text-zinc-300">
                {lane.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full bg-white/5 px-2 py-0.5">{highlight}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/5 bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">Pipeline</p>
            <h2 className="text-lg font-semibold">Next up</h2>
          </div>
          <Clock className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="mt-4 space-y-3">
          {pipelineItems.slice(0, 3).map((item) => (
            <div key={item.title} className="rounded-xl border border-white/5 bg-black/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-100">{item.title}</span>
                <span className="text-[0.7rem] text-zinc-400">{item.status}</span>
              </div>
              <p className="mt-1 text-[0.7rem] text-zinc-500">Lead: {item.owner}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-[0.65rem] text-zinc-300">
                {item.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 capitalize">{tag}</span>
                ))}
              </div>
              {item.eta && <p className="mt-2 text-[0.7rem] text-zinc-500">ETA: {item.eta}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/5 bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">Memory</p>
            <h2 className="text-lg font-semibold">Latest log</h2>
          </div>
          <MapPin className="h-4 w-4 text-zinc-500" />
        </div>
        {logs.length === 0 && (
          <p className="mt-4 text-xs text-zinc-400">No memory files were found. Log today’s work to populate this view.</p>
        )}
        {logs.map((log) => (
          <div key={log.date} className="mt-4 rounded-xl border border-white/5 bg-black/15 p-3">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">{log.date}</p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-200">
              {log.summary.slice(0, 3).map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {log.actions.length > 0 && (
              <div className="mt-3 text-[0.7rem] text-zinc-400">
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500">Key actions</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {log.actions.slice(0, 3).map((action, idx) => (
                    <span key={idx} className="rounded-full bg-white/5 px-2 py-0.5 text-[0.65rem] text-zinc-200">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-white/5 bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">Worklogs</p>
            <h2 className="text-lg font-semibold">Agent highlights</h2>
          </div>
          <Activity className="h-4 w-4 text-zinc-500" />
        </div>
        {worklogs.slice(0, 3).map((log) => (
          <div key={log.agent} className="mt-4 rounded-xl border border-white/5 bg-black/15 p-3">
            <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">
              <span>{log.agent}</span>
              <span>{log.date ?? "—"}</span>
            </div>
            {log.status && <p className="mt-2 text-xs text-zinc-300">{log.status}</p>}
            <ul className="mt-3 space-y-1 text-[0.7rem] text-zinc-200">
              {(log.immediate.length ? log.immediate : ["No priorities logged"]).slice(0, 2).map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-accent/70">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer className="mt-8 space-y-3 rounded-2xl border border-white/5 bg-black/40 p-4 text-[0.7rem] text-zinc-400">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Need to act?</p>
        <div className="flex flex-col gap-2">
          {(phoneReminders.length > 0 ? phoneReminders : phoneLoops).map((item) => (
            <button
              key={item}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-left text-xs text-zinc-100"
            >
              {item} <PhoneCall className="h-4 w-4 text-zinc-400" />
            </button>
          ))}
          {phoneLoops.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-black/50 p-3 text-left">
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-zinc-500">Open loops</p>
              <ul className="mt-1 space-y-1 text-[0.7rem] text-zinc-300">
                {phoneLoops.map((loop) => (
                  <li key={loop} className="flex gap-2">
                    <span className="text-accent/70">•</span>
                    <span>{loop}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </footer>
    </main>
  );
}
