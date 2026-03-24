"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KanbanColumn } from "@/components/kanban-board";

const ownerOptions = [
  { key: "atlas", label: "Atlas" },
  { key: "micah", label: "Micah · Church Ops" },
  { key: "grant", label: "Grant · BDM Sales" },
  { key: "nova", label: "Nova · Business Growth" }
];

interface CreateTaskFormProps {
  columns: KanbanColumn[];
}

export function CreateTaskForm({ columns }: CreateTaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState(ownerOptions[0].key);
  const [stage, setStage] = useState(columns[0]?.id ?? "intake");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/kanban/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, owner, stage })
      });
      if (!res.ok) {
        throw new Error("Failed to create task");
      }
      setTitle("");
      setDescription("");
      setOwner(ownerOptions[0].key);
      setStage(columns[0]?.id ?? "intake");
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not add the task. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d0f16] to-[#080910] p-6 text-sm text-white shadow-2xl shadow-black/40"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-zinc-500">New task</p>
          <h2 className="text-xl font-semibold text-white">Add something for Atlas to handle</h2>
          <p className="text-xs text-zinc-400">Give it a clear title, short brief, and the stage you want it to start in.</p>
        </div>
        <button
          type="submit"
          className="rounded-full bg-emerald-400/90 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding…" : "Add task"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Task title</label>
          <input
            className="w-full rounded-2xl border border-white/10 bg-[#05060a]/60 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g., Prep expo follow-up kit"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Owner</label>
          <select
            className="w-full rounded-2xl border border-white/10 bg-[#05060a]/60 px-4 py-2 text-sm text-white"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
          >
            {ownerOptions.map((option) => (
              <option key={option.key} value={option.key} className="bg-black text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Description</label>
        <textarea
          className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-[#05060a]/60 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What outcome do you want? Mention context, deadlines, or useful links."
          required
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Stage</label>
        <select
          className="w-full rounded-2xl border border-white/10 bg-[#05060a]/60 px-4 py-2 text-sm text-white"
          value={stage}
          onChange={(event) => setStage(event.target.value)}
        >
          {columns.map((column) => (
            <option key={column.id} value={column.id} className="bg-black text-white">
              {column.title}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && <p className="mt-4 text-xs text-rose-300">{errorMessage}</p>}
    </form>
  );
}
