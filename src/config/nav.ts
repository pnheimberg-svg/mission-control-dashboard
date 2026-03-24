import { BookOpenCheck, KanbanSquare, LayoutDashboard, Sparkles } from "lucide-react";

export const NAV_ITEMS = [
  {
    title: "Mission Control",
    description: "Overview & widgets",
    href: "/",
    icon: LayoutDashboard
  },
  {
    title: "Memory Logs",
    description: "Full-screen searchable daily memory",
    href: "/tools/memory",
    icon: BookOpenCheck
  },
  {
    title: "Morning Momentum",
    description: "Daily report + export links",
    href: "/tools/morning-momentum",
    icon: Sparkles
  },
  {
    title: "Kanban Board",
    description: "Task owner + approval tracking",
    href: "/tools/kanban",
    icon: KanbanSquare
  }
];
