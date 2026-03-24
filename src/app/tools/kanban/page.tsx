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

export default async function KanbanToolPage() {
  const data = await getKanbanData();
  const ownerStatuses = await getOwnerStatuses();

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Tools</p>
        <h1 className="text-3xl font-semibold">Kanban Board</h1>
        <p className="text-sm text-zinc-400">Unified task board for Atlas + agents. Approve work items directly and keep everyone moving.</p>
      </div>
      <div className="mt-6 space-y-6">
        <CreateTaskForm columns={data.columns} />
        <KanbanBoard columns={data.columns} tasks={data.tasks} ownerStatuses={ownerStatuses} />
      </div>
    </div>
  );
}
