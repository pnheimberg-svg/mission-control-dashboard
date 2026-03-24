import { NextResponse } from "next/server";
import { appendText, readJSON, writeJSON } from "@/lib/data-store";

const boardPath = "dashboard/kanban-board.json";
const eventsLogPath = "dashboard/kanban-events.log";

type KanbanBoard = {
  tasks: any[];
};

export async function POST(request: Request) {
  try {
    const { taskId, stage } = await request.json();
    if (!taskId || !stage) {
      return NextResponse.json({ error: "taskId and stage are required" }, { status: 400 });
    }

    const board = await readJSON<KanbanBoard>(boardPath, { tasks: [] });
    const task = board.tasks.find((item: any) => item.id === taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    task.stage = stage;
    if (stage === "awaiting-approval") {
      task.needsApproval = true;
    } else if (task.needsApproval) {
      task.needsApproval = false;
    }
    task.lastMovedAt = new Date().toISOString();

    await writeJSON(boardPath, board, `Kanban move: ${taskId} -> ${stage}`);

    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | MOVE | ${taskId} -> ${stage}\n`;
    await appendText(eventsLogPath, logEntry, `Kanban log: ${taskId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kanban move error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
