import { CreateTaskForm } from "@/components/create-task-form";
import { KanbanBoard, KanbanColumn, KanbanTask } from "@/components/kanban-board";
import { readJSON, readText } from "@/lib/data-store";

const boardPath = "dashboard/kanban-board.json";
const micahWorklogPath = "agents/church-ops-agent-worklog.md";
const grantWorklogPath = "agents/bdm-sales-agent-worklog.md";
const novaWorklogPath = "agents/business-growth-agent-worklog.md";

async function getKanbanData(): Promise<{ columns: KanbanColumn[]; tasks: KanbanTask[] }> {
  const parsed = await readJSON<{ columns?: KanbanColumn[]; tasks?: KanbanTask[] }>(boardPath, {
    columns: [],
    tasks: []
  });
  return {
    columns: parsed.columns ?? [],
    tasks: parsed.tasks ?? []
  };
}

async function extractImmediatePriority(relativePath: string) {
  try {
    const content = await readText(relativePath);
    const match = content.match(/### Immediate priorities([\s\S]*?)(?:\n### |\n## |$)/i);
    if (!match) return "";
    const lines = match[1]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("1.") || line.startsWith("-"));
    return lines[0]?.replace(/^(\d+\.\s+|-\s+)/, "") ?? "";
  } catch (error) {
    console.warn("Failed to parse worklog", relativePath, error);
    return "";
  }
}

async function getOwnerStatuses() {
  return {
    micah: await extractImmediatePriority(micahWorklogPath),
    grant: await extractImmediatePriority(grantWorklogPath),
    nova: await extractImmediatePriority(novaWorklogPath),
    atlas: ""
  };
}

function getStartOfWeek(date: Date) {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as start
  clone.setDate(clone.getDate() + diff);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function getTaskStats(tasks: KanbanTask[]) {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const activeTasks = tasks.filter((task) => !task.archived);
  const createdThisWeek = activeTasks.filter((task) => {
    if (!task.createdAt) return false;
    const created = new Date(task.createdAt);
    return created >= startOfWeek;
  }).length;
  const inProgress = activeTasks.filter((task) => task.stage === "in-progress").length;
  const done = activeTasks.filter((task) => task.stage === "done").length;
  const completionRate = activeTasks.length ? Math.round((done / activeTasks.length) * 100) : 0;

  return {
    createdThisWeek,
    inProgress,
    active: activeTasks.length,
    completionRate
  };
}

export default async function TasksToolPage() {
  const data = await getKanbanData();
  const ownerStatuses = await getOwnerStatuses();
  const stats = getTaskStats(data.tasks);

  const statBlocks = [
    { label: "New this week", value: stats.createdThisWeek.toString() },
    { label: "In progress", value: stats.inProgress.toString() },
    { label: "Active tasks", value: stats.active.toString() },
    { label: "Completion", value: `${stats.completionRate}%` }
  ];

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Tools</p>
              <h1 className="text-3xl font-semibold text-white">Tasks</h1>
              <p className="text-sm text-zinc-400">
                Atlas-only task board for anything you assign. Capture a request, drag it through the stages, and approve
                handoffs without leaving Mission Control.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-zinc-300">
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-zinc-500">Live owner signals</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {Object.entries(ownerStatuses)
                  .filter(([, status]) => Boolean(status))
                  .map(([owner, status]) => (
                    <div key={owner} className="max-w-xs text-zinc-300">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-zinc-500">{owner}</p>
                      <p className="text-sm text-zinc-100">{status}</p>
                    </div>
                  ))}
                {!Object.values(ownerStatuses).some(Boolean) && (
                  <p className="text-sm text-zinc-500">No delegated agent updates right now.</p>
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statBlocks.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#10101a] to-[#0b0b12] px-4 py-3 shadow-lg shadow-black/40"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <CreateTaskForm columns={data.columns} />

        <KanbanBoard columns={data.columns} tasks={data.tasks} ownerStatuses={ownerStatuses} />
      </div>
    </div>
  );
}
