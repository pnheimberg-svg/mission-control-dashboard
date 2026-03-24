import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const boardPath = path.resolve(process.cwd(), "../dashboard/kanban-board.json");
const eventsLogPath = path.resolve(process.cwd(), "../dashboard/kanban-events.log");

export async function POST(request: Request) {
  try {
    const { taskId, archived } = await request.json();
    if (!taskId || archived === undefined) {
      return NextResponse.json({ error: "taskId and archived flag required" }, { status: 400 });
    }

    const raw = await fs.readFile(boardPath, "utf-8");
    const board = JSON.parse(raw);
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

    await fs.writeFile(boardPath, JSON.stringify(board, null, 2), "utf-8");

    const logEntry = `${timestamp} | ${archived ? "ARCHIVE" : "RESTORE"} | ${taskId}\n`;
    await fs.appendFile(eventsLogPath, logEntry, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kanban archive error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
