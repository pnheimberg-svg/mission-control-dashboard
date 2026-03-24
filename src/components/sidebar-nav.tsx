"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { NAV_ITEMS } from "@/config/nav";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition",
              isActive
                ? "border-white/20 bg-white/5 text-white"
                : "border-transparent text-zinc-400 hover:border-white/10 hover:text-white"
            )}
          >
            <Icon className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-zinc-500">{item.description}</p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
