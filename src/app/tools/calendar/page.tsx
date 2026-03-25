import { readJSON } from "@/lib/data-store";

interface CronJobSchedule {
  kind: "cron" | "at";
  expr?: string;
  at?: string;
  tz: string;
}

interface CronJobRecord {
  id: string;
  name: string;
  description: string;
  schedule: CronJobSchedule;
  nextRun: string;
  lastRun?: string;
  status: "ok" | "pending" | "error";
}

function formatDateTime(value: string, tz = "America/Los_Angeles") {
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  } catch {
    return value;
  }
}

function formatSchedule(job: CronJobRecord) {
  if (job.schedule.kind === "cron" && job.schedule.expr) {
    return `${job.schedule.expr} (${job.schedule.tz})`;
  }
  if (job.schedule.kind === "at" && job.schedule.at) {
    return `${formatDateTime(job.schedule.at, job.schedule.tz)} (${job.schedule.tz})`;
  }
  return "Custom schedule";
}

function buildUpcomingBuckets(jobs: CronJobRecord[], days = 14) {
  const today = new Date();
  const buckets = Array.from({ length: days }, (_, index) => {
    const bucketDate = new Date(today);
    bucketDate.setHours(0, 0, 0, 0);
    bucketDate.setDate(bucketDate.getDate() + index);
    return {
      dateKey: bucketDate.toISOString().split("T")[0],
      date: bucketDate,
      jobs: [] as CronJobRecord[]
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.dateKey, bucket]));

  jobs.forEach((job) => {
    const dateKey = job.nextRun.split("T")[0];
    const bucket = bucketMap.get(dateKey);
    if (bucket) {
      bucket.jobs.push(job);
    }
  });

  return buckets;
}

export default async function CronCalendarPage() {
  const jobs = await readJSON<CronJobRecord[]>("dashboard/cron-jobs.json", []);
  const recurringJobs = jobs.filter((job) => job.schedule.kind === "cron");
  const oneTimeJobs = jobs.filter((job) => job.schedule.kind === "at");
  const buckets = buildUpcomingBuckets(jobs);
  const sortedJobs = [...jobs].sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime());

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Tools</p>
          <h1 className="text-3xl font-semibold text-white">Automation Calendar</h1>
          <p className="text-sm text-zinc-400">
            Quick overview of every cron/at job Atlas is running. Use this to confirm what reminders, briefings, and compliance
            tasks are already automated.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-zinc-500">Total jobs</p>
            <p className="mt-2 text-2xl font-semibold text-white">{jobs.length}</p>
            <p className="text-xs text-zinc-500">Active reminders + automations</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-zinc-500">Recurring</p>
            <p className="mt-2 text-2xl font-semibold text-white">{recurringJobs.length}</p>
            <p className="text-xs text-zinc-500">Cron-based jobs (loop forever)</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-zinc-500">One-offs queued</p>
            <p className="mt-2 text-2xl font-semibold text-white">{oneTimeJobs.length}</p>
            <p className="text-xs text-zinc-500">Single reminders already on deck</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-gradient-to-b from-[#0d101a] to-[#05060a] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Next 14 days</p>
              <h2 className="text-xl font-semibold text-white">Calendar strip</h2>
            </div>
            <p className="text-xs text-zinc-500">Times shown in Pacific</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {buckets.map((bucket) => (
              <div key={bucket.dateKey} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {bucket.date.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p className="text-lg font-semibold text-white">
                  {bucket.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                {bucket.jobs.length === 0 ? (
                  <p className="mt-3 text-xs text-zinc-500">No jobs</p>
                ) : (
                  <div className="mt-3 space-y-2 text-xs text-zinc-300">
                    {bucket.jobs.map((job) => (
                      <div key={job.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <p className="font-medium text-white">{job.name}</p>
                        <p className="text-[0.65rem] text-zinc-500">{formatDateTime(job.nextRun)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-black/20 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Job ledger</h2>
            <p className="text-xs text-zinc-500">Sorted by next run time</p>
          </div>
          <div className="mt-4 divide-y divide-white/5 text-sm text-zinc-200">
            {sortedJobs.map((job) => (
              <div key={job.id} className="py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{job.name}</p>
                    <p className="text-xs text-zinc-500">{job.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      job.schedule.kind === "cron" ? "bg-emerald-500/20 text-emerald-200" : "bg-sky-500/20 text-sky-200"
                    }`}
                  >
                    {job.schedule.kind === "cron" ? "Recurring" : "One-time"}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 text-xs text-zinc-400 md:grid-cols-3">
                  <div>
                    <p className="text-zinc-500">Schedule</p>
                    <p className="text-zinc-200">{formatSchedule(job)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Next run</p>
                    <p className="text-zinc-200">{formatDateTime(job.nextRun, job.schedule.tz)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Status</p>
                    <p className="text-zinc-200 capitalize">{job.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
