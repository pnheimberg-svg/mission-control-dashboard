import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { SidebarNav } from "@/components/sidebar-nav";
import Link from "next/link";
import { NAV_ITEMS } from "@/config/nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Atlas Mission Control",
  description: "A Linear-inspired command center for Paul & Atlas"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} bg-background text-foreground`}>
        <div className="flex min-h-screen">
          <aside className="hidden w-72 flex-none border-r border-white/5 px-5 py-8 xl:flex">
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Atlas</p>
                <h1 className="mt-2 text-xl font-semibold">Mission Control</h1>
                <p className="text-sm text-zinc-500">Tools & automation launchpad</p>
              </div>
              <SidebarNav />
            </div>
          </aside>
          <div className="flex min-h-screen flex-1 flex-col">
            <header className="border-b border-white/5 px-4 py-4 xl:hidden">
              <div className="text-xs uppercase tracking-[0.4em] text-zinc-500">Atlas</div>
              <h1 className="text-lg font-semibold text-white">Mission Control</h1>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
