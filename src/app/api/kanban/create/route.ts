import path from "path";
import { NextResponse } from "next/server";
import { appendText, readJSON, writeJSON } from "@/lib/data-store";

const boardPath = "dashboard/kanban-board.json";
const eventsLogPath = "dashboard/kanban-events.log";
const kanbanInboxDir = "notes/kanban-inbox";

const ownerMap: Record<string, { label: string; inboxFile: string }> = {
  micah: { label: "Micah · Church Ops", inboxFile: "micah.md" },
  grant: { label: "Grant · BDM Sales", inboxFile: "grant.md" },
  nova: { label: "Nova · Business Growth", inboxFile: "nova.md" },
  atlas: { label: "Atlas", inboxFile: "atlas.md" }
};

type KanbanBoard = {
  columns: unknown[];
  tasks: any[];
};

export async function POST(request: Request) {
  try {
    const { title, description, owner, stage } = await request.json();
    if (!title || !description || !owner) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ownerInfo = ownerMap[owner];
    if (!ownerInfo) {
      return NextResponse.json({ error: "Unknown owner" }, { status: 400 });
    }

    const board = await readJSON<KanbanBoard>(boardPath, { columns: [], tasks: [] });
    const taskId = `task-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newTask = {
      id: taskId,
      title,
      owner: ownerInfo.label,
      ownerKey: owner,
      stage: stage || "intake",
      description,
      needsApproval: false,
      createdAt: timestamp,
      lastMovedAt: timestamp
    };

    board.tasks.push(newTask);
    await writeJSON(boardPath, board, `Kanban create: ${taskId}`);

    const logTimestamp = new Date().toISOString();
    const logEntry = `${logTimestamp} | NEW_TASK | ${taskId} | ${ownerInfo.label} | ${title}\n`;
    await appendText(eventsLogPath, logEntry, `Kanban log: ${taskId}`);

    const message = `### ${timestamp}\n- ${title} (${ownerInfo.label}) — Stage: ${newTask.stage}\n  ${description}\n\n`;
    const atlasInbox = path.join(kanbanInboxDir, "atlas.md");
    await appendText(atlasInbox, message, `Kanban inbox (Atlas): ${taskId}`);
    const agentInbox = path.join(kanbanInboxDir, ownerInfo.inboxFile);
    await appendText(agentInbox, message, `Kanban inbox (${ownerInfo.label}): ${taskId}`);

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Kanban create error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
