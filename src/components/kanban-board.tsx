"use client";

import clsx from "clsx";
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

function getLinkLabel(link: string) {
  try {
    const parts = link.split("/");
    return parts[parts.length - 1] || link;
  } catch {
    return link;
  }
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
  const [ownerFilter, setOwnerFilter] = useState<string>("atlas");
  const [showArchived, setShowArchived] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropColumn, setDropColumn] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const ownerFilterOptions = [
    { key: "atlas", label: "Atlas" },
    { key: "micah", label: "Micah" },
    { key: "grant", label: "Grant" },
    { key: "nova", label: "Nova" },
    { key: "all", label: "All" }
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
    <div className="space-y-6">
      {errorMessage && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{errorMessage}</p>}

      <div className="rounded-3xl border border-white/10 bg-[#080a11] p-4 shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {ownerFilterOptions.map((option) => (
              <button
                key={option.key}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                  ownerFilter === option.key
                    ? "bg-white text-black shadow-lg shadow-white/30"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10"
                )}
                onClick={() => setOwnerFilter(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white/5 disabled:opacity-40"
            onClick={() => setShowArchived((prev) => !prev)}
            disabled={!showArchived && archivedTasks.length === 0}
          >
            {showArchived ? "Hide archived" : `Show archived (${archivedTasks.length})`}
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {columns.map((column) => {
            const columnTasks = visibleTasks.filter((task) => task.stage === column.id);
            const isActiveDropZone = dropColumn === column.id;
            return (
              <div
                key={column.id}
                className={clsx(
                  "rounded-3xl border border-white/10 bg-gradient-to-b from-[#111424] to-[#090b12] p-4 shadow-inner shadow-black/60",
                  isActiveDropZone && "ring-2 ring-sky-400/70"
                )}
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={() => setDropColumn(column.id)}
                onDrop={() => onDrop(column.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">{column.id.replace(/-/g, " ")}</p>
                    <h3 className="text-lg font-semibold text-white">{column.title}</h3>
                  </div>
                  <span className="text-xs text-zinc-500">{columnTasks.length}</span>
                </div>

                <div className="mt-4 space-y-4">
                  {columnTasks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-xs text-zinc-500">
                      Nothing here yet.
                    </div>
                  )}
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => onDragStart(task.id)}
                      onDragEnd={onDragEnd}
                      className={clsx(
                        "rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-200 shadow-lg shadow-black/40 transition",
                        draggingId === task.id && "opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">{task.stage.replace(/-/g, " ")}</p>
                          <p className="text-base font-semibold text-white">{task.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={clsx("text-xs font-semibold", getOwnerClass(task.owner))}>{getOwnerName(task.owner)}</span>
                          <button
                            className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-200"
                            onClick={() => handleArchive(task.id, true)}
                            disabled={archivingId === task.id}
                          >
                            {archivingId === task.id ? "…" : "Archive"}
                          </button>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-zinc-400">{task.description}</p>

                      {task.links && task.links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-200">
                          {task.links.map((link) => (
                            <span key={link} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                              {getLinkLabel(link)}
                            </span>
                          ))}
                        </div>
                      )}

                      {task.ownerKey && ownerStatuses?.[task.ownerKey] && (
                        <p className="mt-2 text-[11px] text-zinc-500">Worklog: {ownerStatuses[task.ownerKey]}</p>
                      )}

                      {(() => {
                        const sla = getSlaMeta(task);
                        return sla ? <p className={clsx("mt-1 text-[11px]", sla.className)}>{sla.label}</p> : null;
                      })()}

                      {task.needsApproval && (
                        <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3">
                          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-200">Approval needed</p>
                          {task.approvalSummary && <p className="mt-2 text-xs text-amber-50">{task.approvalSummary}</p>}
                          <button
                            className="mt-3 w-full rounded-xl bg-amber-300 px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"
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
      </div>

      {showArchived && (
        <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Archived tasks</h3>
            <span className="text-xs text-zinc-500">{archivedTasks.length}</span>
          </div>
          {archivedTasks.length === 0 ? (
            <p className="mt-4 text-xs text-zinc-500">No archived tasks.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {archivedTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-200">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">{task.prevStage || "intake"}</p>
                      <p className="text-base font-semibold text-white">{task.title}</p>
                    </div>
                    <button
                      className="text-[10px] text-emerald-300 underline"
                      onClick={() => handleArchive(task.id, false)}
                      disabled={archivingId === task.id}
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
