import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const boardPath = path.resolve(process.cwd(), "../dashboard/kanban-board.json");
const eventsLogPath = path.resolve(process.cwd(), "../dashboard/kanban-events.log");
const kanbanInboxDir = path.resolve(process.cwd(), "../notes/kanban-inbox");

const ownerMap: Record<string, { label: string; inboxFile: string }> = {
  micah: { label: "Micah · Church Ops", inboxFile: "micah.md" },
  grant: { label: "Grant · BDM Sales", inboxFile: "grant.md" },
  nova: { label: "Nova · Business Growth", inboxFile: "nova.md" },
  atlas: { label: "Atlas", inboxFile: "atlas.md" }
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

    const boardRaw = await fs.readFile(boardPath, "utf-8");
    const board = JSON.parse(boardRaw);
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
    await fs.writeFile(boardPath, JSON.stringify(board, null, 2), "utf-8");

    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | NEW_TASK | ${taskId} | ${ownerInfo.label} | ${title}\n`;
    await fs.appendFile(eventsLogPath, logEntry, "utf-8");

    await fs.mkdir(kanbanInboxDir, { recursive: true });
    const message = `### ${timestamp}\n- ${title} (${ownerInfo.label}) — Stage: ${newTask.stage}\n  ${description}\n\n`;
    const atlasInbox = path.join(kanbanInboxDir, "atlas.md");
    await fs.appendFile(atlasInbox, message, "utf-8");
    const agentInbox = path.join(kanbanInboxDir, ownerInfo.inboxFile);
    await fs.appendFile(agentInbox, message, "utf-8");

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Kanban create error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
