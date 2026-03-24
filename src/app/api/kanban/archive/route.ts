import { NextResponse } from "next/server";
import { appendText, readJSON, writeJSON } from "@/lib/data-store";

const boardPath = "dashboard/kanban-board.json";
const eventsLogPath = "dashboard/kanban-events.log";

type KanbanBoard = {
  tasks: any[];
};

export async function POST(request: Request) {
  try {
    const { taskId, archived } = await request.json();
    if (!taskId || archived === undefined) {
      return NextResponse.json({ error: "taskId and archived flag required" }, { status: 400 });
    }

    const board = await readJSON<KanbanBoard>(boardPath, { tasks: [] });
    const task = board.tasks.find((item: any) => item.id === taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const timestamp = new Date().toISOString();

    if (archived) {
      task.prevStage = task.stage;
      task.stage = "archived";
      task.archived = true;
      task.archivedAt = timestamp;
    } else {
      task.archived = false;
      task.stage = task.prevStage || "intake";
      task.archivedAt = undefined;
    }
    task.lastMovedAt = timestamp;

    await writeJSON(boardPath, board, `Kanban ${archived ? "archive" : "restore"}: ${taskId}`);

    const logEntry = `${timestamp} | ${archived ? "ARCHIVE" : "RESTORE"} | ${taskId}\n`;
    await appendText(eventsLogPath, logEntry, `Kanban log: ${taskId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kanban archive error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
