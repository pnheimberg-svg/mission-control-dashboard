import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const boardPath = path.resolve(process.cwd(), "../dashboard/kanban-board.json");
const logPath = path.resolve(process.cwd(), "../dashboard/kanban-approvals.log");

export async function POST(request: Request) {
  try {
    const { taskId, nextStage } = await request.json();
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const rawBoard = await fs.readFile(boardPath, "utf-8");
    const board = JSON.parse(rawBoard);
    const task = board.tasks.find((item: any) => item.id === taskId);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    task.needsApproval = false;
    if (nextStage && typeof nextStage === "string") {
      task.stage = nextStage;
    }
    task.lastMovedAt = new Date().toISOString();

    await fs.writeFile(boardPath, JSON.stringify(board, null, 2), "utf-8");

    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | ${taskId} approved -> stage: ${task.stage}\n`;
    await fs.appendFile(logPath, logEntry, "utf-8");

    return NextResponse.json({ success: true, stage: task.stage });
  } catch (error) {
    console.error("Kanban approval error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
