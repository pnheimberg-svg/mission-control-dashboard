import { NextResponse } from "next/server";
import { appendText, readJSON, writeJSON } from "@/lib/data-store";

const boardPath = "dashboard/kanban-board.json";
const logPath = "dashboard/kanban-approvals.log";

type KanbanBoard = {
  tasks: any[];
};

export async function POST(request: Request) {
  try {
    const { taskId, nextStage } = await request.json();
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const board = await readJSON<KanbanBoard>(boardPath, { tasks: [] });
    const task = board.tasks.find((item: any) => item.id === taskId);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    task.needsApproval = false;
    if (nextStage && typeof nextStage === "string") {
      task.stage = nextStage;
    }
    task.lastMovedAt = new Date().toISOString();

    await writeJSON(boardPath, board, `Kanban approval: ${taskId}`);

    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | ${taskId} approved -> stage: ${task.stage}\n`;
    await appendText(logPath, logEntry, `Kanban approval log: ${taskId}`);

    return NextResponse.json({ success: true, stage: task.stage });
  } catch (error) {
    console.error("Kanban approval error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
