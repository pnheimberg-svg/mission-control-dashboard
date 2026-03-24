"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type KanbanColumn = {
  id: string;
  title: string;
};

export type KanbanTask = {
  id: string;
  title: string;
  owner: string;
  ownerKey?: string;
  stage: string;
  description: string;
  needsApproval: boolean;
  approvalSummary?: string;
  nextStageAfterApproval?: string;
  links?: string[];
  createdAt?: string;
  lastMovedAt?: string;
  archived?: boolean;
  archivedAt?: string;
  prevStage?: string;
};

const ownerColorMap: Record<string, string> = {
  micah: "text-rose-300",
  grant: "text-blue-300",
  nova: "text-purple-300",
  atlas: "text-emerald-300"
};

function getOwnerClass(owner: string) {
  const key = owner.toLowerCase();
  if (key.includes("micah")) return ownerColorMap.micah;
  if (key.includes("grant")) return ownerColorMap.grant;
  if (key.includes("nova")) return ownerColorMap.nova;
  if (key.includes("atlas")) return ownerColorMap.atlas;
  return "text-zinc-300";
}

function getOwnerName(owner: string) {
  const [name] = owner.split("·");
  return name.trim();
}

const SLA_THRESHOLDS: Record<string, number> = {
  intake: 48,
  "in-progress": 72,
  "awaiting-approval": 12,
  blocked: 24
};

function getSlaMeta(task: KanbanTask) {
  if (!task.lastMovedAt) return null;
  const limitHours = SLA_THRESHOLDS[task.stage];
  if (!limitHours) return null;
  const diffMs = Date.now() - new Date(task.lastMovedAt).getTime();
  const hours = Math.max(diffMs / 36e5, 0);
  const label = `${hours.toFixed(1)}h in stage`;
  if (hours >= limitHours) return { label, className: "text-rose-300" };
  if (hours >= limitHours * 0.5) return { label, className: "text-amber-300" };
  return { label, className: "text-zinc-500" };
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  ownerStatuses?: Record<string, string>;
}

export function KanbanBoard({ columns, tasks, ownerStatuses }: KanbanBoardProps) {
  const router = useRouter();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropColumn, setDropColumn] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const ownerFilterOptions = [
    { key: "all", label: "All" },
    { key: "micah", label: "Micah" },
    { key: "grant", label: "Grant" },
    { key: "nova", label: "Nova" },
    { key: "atlas", label: "Atlas" }
  ];

  const activeTasks = tasks.filter((task) => !task.archived);
  const archivedTasks = tasks.filter((task) => task.archived);
  const visibleTasks = ownerFilter === "all" ? activeTasks : activeTasks.filter((task) => task.ownerKey === ownerFilter);

  const handleApprove = async (task: KanbanTask) => {
    setApprovingId(task.id);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/kanban/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, nextStage: task.nextStageAfterApproval })
      });
      if (!res.ok) throw new Error("Approval failed");
      startTransition(() => router.refresh());
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not record approval. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleMove = async (taskId: string, targetStage: string) => {
    setErrorMessage(null);
    try {
      const res = await fetch("/api/kanban/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, stage: targetStage })
      });
      if (!res.ok) throw new Error("Move failed");
      startTransition(() => router.refresh());
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not move the task. Try again.");
    }
  };

  const handleArchive = async (taskId: string, archived: boolean) => {
    setArchivingId(taskId);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/kanban/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, archived })
      });
      if (!res.ok) throw new Error("Archive failed");
      startTransition(() => router.refresh());
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not update archive status.");
    } finally {
      setArchivingId(null);
    }
  };

  const onDragStart = (taskId: string) => {
    setDraggingId(taskId);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setDropColumn(null);
  };

  const onDrop = (columnId: string) => {
    if (draggingId) {
      handleMove(draggingId, columnId);
    }
    onDragEnd();
  };

  return (
    <div className="space-y-4">
      {errorMessage && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{errorMessage}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {ownerFilterOptions.map((option) => (
            <button
              key={option.key}
              className={`rounded-full px-3 py-1 text-xs ${ownerFilter === option.key ? "bg-white/80 text-black" : "bg-white/5 text-zinc-300"}`}
              onClick={() => setOwnerFilter(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200"
          onClick={() => setShowArchived((prev) => !prev)}
          disabled={!showArchived && archivedTasks.length === 0}
        >
          {showArchived ? "Hide archived" : `Show archived (${archivedTasks.length})`}
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        {columns.map((column) => {
          const columnTasks = visibleTasks.filter((task) => task.stage === column.id);
          const isActiveDropZone = dropColumn === column.id;
          return (
            <div
              key={column.id}
              className={`rounded-3xl border border-white/5 bg-card/80 p-4 transition ${isActiveDropZone ? "ring-2 ring-sky-400" : ""}`}
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={() => setDropColumn(column.id)}
              onDrop={() => onDrop(column.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{column.title}</h3>
                <span className="text-xs text-zinc-500">{columnTasks.length}</span>
              </div>
              <div className="mt-4 space-y-4">
                {columnTasks.length === 0 && <p className="text-xs text-zinc-500">No tasks here yet.</p>}
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStart(task.id)}
                    onDragEnd={onDragEnd}
                    className={`rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-zinc-200 ${draggingId === task.id ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-semibold text-white">{task.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${getOwnerClass(task.owner)}`}>{getOwnerName(task.owner)}</span>
                        <button
                          className="text-[10px] uppercase tracking-[0.3em] text-zinc-500"
                          onClick={() => handleArchive(task.id, true)}
                          disabled={archivingId === task.id}
                        >
                          {archivingId === task.id ? "…" : "Archive"}
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{task.description}</p>
                    {task.ownerKey && ownerStatuses?.[task.ownerKey] && (
                      <p className="mt-2 text-[11px] text-zinc-500">Worklog: {ownerStatuses[task.ownerKey]}</p>
                    )}
                    {(() => {
                      const sla = getSlaMeta(task);
                      return sla ? <p className={`mt-1 text-[11px] ${sla.className}`}>{sla.label}</p> : null;
                    })()}
                    {task.needsApproval && (
                      <div className="mt-3 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-200">Approval needed</p>
                        {task.approvalSummary && <p className="mt-2 text-xs text-yellow-50">{task.approvalSummary}</p>}
                        <button
                          className="mt-3 w-full rounded-xl bg-yellow-400/80 px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"
                          onClick={() => handleApprove(task)}
                          disabled={approvingId === task.id || isPending}
                        >
                          {approvingId === task.id ? "Recording…" : "Approve & Notify"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {showArchived && (
        <div className="rounded-3xl border border-white/5 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Archived tasks</h3>
            <span className="text-xs text-zinc-500">{archivedTasks.length}</span>
          </div>
          {archivedTasks.length === 0 ? (
            <p className="mt-4 text-xs text-zinc-500">No archived tasks.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {archivedTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-white/5 bg-black/40 p-4 text-sm text-zinc-200">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-semibold text-white">{task.title}</p>
                    <button
                      className="text-[10px] text-emerald-300 underline"
                      onClick={() => handleArchive(task.id, false)}
                      disabled={archivingId === task.id}
                    >
                      Restore
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">Last stage: {task.prevStage || "intake"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
