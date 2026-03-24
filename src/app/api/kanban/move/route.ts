import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const boardPath = path.resolve(process.cwd(), "../dashboard/kanban-board.json");
const eventsLogPath = path.resolve(process.cwd(), "../dashboard/kanban-events.log");

export async function POST(request: Request) {
  try {
    const { taskId, stage } = await request.json();
    if (!taskId || !stage) {
      return NextResponse.json({ error: "taskId and stage are required" }, { status: 400 });
    }

    const raw = await fs.readFile(boardPath, "utf-8");
    const board = JSON.parse(raw);
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

    await fs.writeFile(boardPath, JSON.stringify(board, null, 2), "utf-8");

    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | MOVE | ${taskId} -> ${stage}\n`;
    await fs.appendFile(eventsLogPath, logEntry, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kanban move error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
