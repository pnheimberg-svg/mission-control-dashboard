import path from "path";
import { listFiles, readJSON, readText } from "@/lib/data-store";

export type MissionMetric = {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  delta: string;
};

export type PipelineItem = {
  title: string;
  owner: string;
  status: "planning" | "active" | "blocked" | "review";
  eta?: string;
  tags?: string[];
};

export type DailyLog = {
  date: string;
  summary: string[];
  actions: string[];
};

export type MemoryEntry = {
  date: string;
  content: string;
};

export type AgentLane = {
  name: string;
  focus: string;
  highlights: string[];
  status: "online" | "syncing" | "research" | "offline";
};

export type DashboardSnapshot = {
  currentFocus: string[];
  topAgents: string[];
  openLoops: string[];
  reminders: string[];
  leadPipeline: string[];
  sermonPipeline: { title: string; url: string }[];
  agentStatus: { name: string; status: string }[];
  systemStatus: string[];
};

export type ReminderEntry = {
  title: string;
  when?: string;
  action?: string;
  status?: string;
  category: string;
};

export type WorklogSummary = {
  agent: string;
  date?: string;
  status?: string;
  immediate: string[];
  next: string[];
};

const memoryDirectory = "memory";
const dashboardDataPath = "dashboard/agent-dashboard-data.json";
const routingFilePath = "agents/shared/current-priorities.md";
const remindersQueuePath = "notes/personal/reminders-queue.md";

const worklogFiles: { agent: string; filePath: string }[] = [
  { agent: "Micah", filePath: "agents/church-ops-agent-worklog.md" },
  { agent: "Grant", filePath: "agents/bdm-sales-agent-worklog.md" },
  { agent: "Nova", filePath: "agents/business-growth-agent-worklog.md" }
];

const dashboardFallback: DashboardSnapshot = {
  currentFocus: [],
  topAgents: ["Atlas", "Micah", "Grant", "Nova"],
  openLoops: [],
  reminders: [],
  leadPipeline: [],
  sermonPipeline: [],
  agentStatus: [
    { name: "Atlas", status: "offline" },
    { name: "Micah", status: "offline" },
    { name: "Grant", status: "offline" },
    { name: "Nova", status: "offline" }
  ],
  systemStatus: []
};

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  return readJSON<DashboardSnapshot>(dashboardDataPath, dashboardFallback);
}

function pickSummaryLines(content: string, maxLines: number): string[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !!line && !line.startsWith("#"));
  return lines.slice(0, maxLines);
}

function extractActions(content: string, maxItems: number): string[] {
  const matches = content.match(/^\-\s+.+/gm);
  if (!matches) return [];
  return matches.map((line) => line.replace(/^-/u, "").trim()).slice(0, maxItems);
}

export async function getDailyLogs(limit = 3): Promise<DailyLog[]> {
  try {
    const files = (await listFiles(memoryDirectory))
      .filter((file) => file.endsWith(".md"))
      .sort((a, b) => (a > b ? -1 : 1));

    const selected = files.slice(0, limit);

    const logs: DailyLog[] = [];

    for (const file of selected) {
      const filePath = path.join(memoryDirectory, file);
      const content = await readText(filePath);
      logs.push({
        date: file.replace(".md", ""),
        summary: pickSummaryLines(content, 4),
        actions: extractActions(content, 4)
      });
    }

    return logs;
  } catch (error) {
    console.error("Failed to load memory logs", error);
    return [];
  }
}

export async function getMemoryEntries(limit = 40): Promise<MemoryEntry[]> {
  try {
    const files = (await listFiles(memoryDirectory))
      .filter((file) => file.endsWith(".md"))
      .sort((a, b) => (a > b ? -1 : 1))
      .slice(0, limit);

    const entries: MemoryEntry[] = [];

    for (const file of files) {
      const filePath = path.join(memoryDirectory, file);
      const content = await readText(filePath);
      entries.push({
        date: file.replace(".md", ""),
        content
      });
    }

    return entries;
  } catch (error) {
    console.error("Failed to load memory entries", error);
    return [];
  }
}

export async function getMissionMetrics(): Promise<MissionMetric[]> {
  const snapshot = await getDashboardSnapshot();
  const prioritiesCount = snapshot.currentFocus.length;
  const openLoopCount = snapshot.openLoops.length;
  const followupsCount = snapshot.reminders.length;

  return [
    {
      label: "Active Priorities",
      value: prioritiesCount.toString(),
      trend: "flat",
      delta: snapshot.currentFocus[0] ? `Top: ${snapshot.currentFocus[0]}` : "Add a priority"
    },
    {
      label: "Open Loops",
      value: openLoopCount.toString(),
      trend: openLoopCount > 5 ? "up" : "flat",
      delta: snapshot.openLoops[0] ?? "No loops logged"
    },
    {
      label: "Follow-ups Today",
      value: followupsCount.toString(),
      trend: followupsCount > 5 ? "up" : "down",
      delta: snapshot.reminders[0] ?? "Add reminders"
    }
  ];
}

async function parseCurrentPriorities(): Promise<PipelineItem[]> {
  try {
    const content = await readText(routingFilePath);
    const lines = content.split(/\r?\n/).filter((line) => line.trim().startsWith("- "));

    return lines.map((line) => {
      const text = line.replace(/^\-\s*/, "").trim();
      const titleMatch = text.match(/\*\*(.+?)\*\*/);
      const ownerMatch = text.match(/\((.+)\)$/);

      const title = titleMatch ? titleMatch[1].trim() : text;
      const ownerRaw = ownerMatch ? ownerMatch[1].trim() : "Atlas";
      const owner = ownerRaw.split("·")[0].trim();
      const tags = ownerRaw
        .split("·")
        .slice(1)
        .map((tag) => tag.trim())
        .filter(Boolean);

      return {
        title,
        owner,
        status: "active" as const,
        tags
      };
    });
  } catch (error) {
    console.warn("Failed to parse routing priorities", error);
    return [];
  }
}

export async function getPipelineItems(): Promise<PipelineItem[]> {
  const parsed = await parseCurrentPriorities();
  if (parsed.length > 0) return parsed;

  const snapshot = await getDashboardSnapshot();
  return snapshot.currentFocus.map((title) => ({
    title,
    owner: "Atlas",
    status: "planning" as const
  }));
}

function cleanMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/[_`]/g, "").replace(/\s+/g, " ").trim();
}

export async function getReminderEntries(): Promise<ReminderEntry[]> {
  try {
    const content = await readText(remindersQueuePath);
    const lines = content.split(/\r?\n/);
    let category = "";
    let currentTitle: string | null = null;
    let buffer: string[] = [];
    const entries: ReminderEntry[] = [];

    const pushEntry = () => {
      if (!currentTitle) return;
      const entry: ReminderEntry = { title: cleanMarkdown(currentTitle), category };
      for (const rawLine of buffer) {
        const line = rawLine.trim();
        const match = line.match(/^\-\s*([^:]+):\s*(.+)?$/);
        if (!match) continue;
        const field = match[1].toLowerCase();
        const value = cleanMarkdown(match[2] ?? "");
        if (field === "when") entry.when = value;
        if (field === "action") entry.action = value;
        if (field === "status") entry.status = value;
      }
      if (entry.when || entry.action || entry.status) {
        entries.push(entry);
      }
    };

    for (const line of lines) {
      if (line.startsWith("## ")) {
        category = cleanMarkdown(line.replace("##", ""));
        continue;
      }
      if (line.startsWith("### ")) {
        pushEntry();
        currentTitle = line.replace("###", "").trim();
        buffer = [];
        continue;
      }
      if (currentTitle) {
        buffer.push(line);
      }
    }
    pushEntry();

    return entries;
  } catch (error) {
    console.warn("Failed to read reminder queue", error);
    return [];
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMarkdownSection(content: string, heading: string): string {
  const escaped = escapeRegExp(heading);
  const regex = new RegExp(`${escaped}\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

function parseNumberedSection(section: string): string[] {
  const regex = /(\d+\.\s[\s\S]*?)(?=\n\d+\.\s|$)/g;
  const matches = section.match(regex);
  if (!matches) return [];
  return matches.map((item) => cleanMarkdown(item.replace(/^[0-9]+\.\s*/, "")));
}

async function parseWorklog(filePath: string, agent: string): Promise<WorklogSummary | null> {
  try {
    const content = await readText(filePath);
    const dateMatch = content.match(/##\s+(\d{4}-\d{2}-\d{2})/);
    const statusSection = cleanMarkdown(extractMarkdownSection(content, "### Status"));
    const immediateSection = extractMarkdownSection(content, "### Immediate priorities");
    const nextSection = extractMarkdownSection(content, "### Next experiments/deliverables");

    return {
      agent,
      date: dateMatch ? dateMatch[1] : undefined,
      status: statusSection || undefined,
      immediate: parseNumberedSection(immediateSection),
      next: parseNumberedSection(nextSection)
    };
  } catch (error) {
    console.warn(`Failed to parse worklog for ${agent}`, error);
    return null;
  }
}

export async function getWorklogSummaries(): Promise<WorklogSummary[]> {
  const summaries = await Promise.all(worklogFiles.map((item) => parseWorklog(item.filePath, item.agent)));
  return summaries.filter((summary): summary is WorklogSummary => summary !== null);
}

const agentLaneMeta: Record<
  string,
  { name: string; focus: string; highlights: string[]; lookup: string }
> = {
  atlas: {
    name: "Atlas",
    focus: "Orchestration & Command",
    highlights: ["Mission Control dashboard", "Daily memory automation"],
    lookup: "Atlas Coordinator"
  },
  micah: {
    name: "Micah",
    focus: "Church Operations",
    highlights: ["Volunteer cadences", "Weekend prep checklist"],
    lookup: "Church Operations Agent"
  },
  grant: {
    name: "Grant",
    focus: "BDM Pipeline",
    highlights: ["Prospect scoring", "Follow-up sequences"],
    lookup: "BDM Sales Agent"
  },
  nova: {
    name: "Nova",
    focus: "Business Growth",
    highlights: ["Offer packaging", "AI leverage"],
    lookup: "Business Growth Agent"
  }
};

function normalizeAgentStatus(value: string | undefined): AgentLane["status"] {
  if (!value) return "offline";
  const lower = value.toLowerCase();
  if (lower.includes("active")) return "online";
  if (lower.includes("progress") || lower.includes("sync")) return "syncing";
  if (lower.includes("research")) return "research";
  return "offline";
}

export async function getAgentLanes(): Promise<AgentLane[]> {
  const snapshot = await getDashboardSnapshot();
  const statusMap = new Map(snapshot.agentStatus.map((entry) => [entry.name.toLowerCase(), entry.status]));

  return Object.values(agentLaneMeta).map((lane) => ({
    name: lane.name,
    focus: lane.focus,
    highlights: lane.highlights,
    status: normalizeAgentStatus(statusMap.get(lane.lookup.toLowerCase()))
  }));
}
