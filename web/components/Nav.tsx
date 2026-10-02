"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/config";
import { useTheme } from "./theme";

const primary = [
  { href: "/simulator", label: "Simulator" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/map", label: "Map" },
  { href: "/explore", label: "Insights" },
];

const all = [
  { href: "/", label: "Home" },
  { href: "/simulator", label: "Simulator" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/map", label: "Map" },
  { href: "/explore", label: "Explore" },
  { href: "/correlation", label: "Correlation" },
  { href: "/regression", label: "Regression" },
  { href: "/report", label: "Report" },
  { href: "/team", label: "Team" },
];

export default function Nav() {
  const path = usePathname();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[var(--bg)]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grad-bg flex h-9 w-9 items-center justify-center rounded-xl text-[15px] shadow-[0_6px_20px_-6px_var(--glow)]">
            🏠
          </span>
          <span className="text-[15px] font-bold tracking-tight">
            Price<span className="grad-text">Sim</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {primary.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors " +
                (path === l.href
                  ? "bg-[var(--panel2)] text-[var(--text)] border border-[var(--border)]"
                  : "text-[var(--muted)] hover:bg-[var(--panel2)] hover:text-[var(--text)]")
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Switch theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="btn-icon"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <Link href="/simulator" className="btn-primary btn-sm hidden sm:inline-flex">
            🚀 Get an estimate
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="btn-icon md:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border-soft)] bg-[var(--bg)]/95 px-5 py-3 backdrop-blur-xl md:hidden">
          <div className="grid grid-cols-2 gap-1">
            {all.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={
                  "rounded-lg px-3 py-2 text-[13px] " +
                  (path === l.href ? "bg-[var(--panel2)] text-[var(--text)] font-semibold" : "text-[var(--muted)]")
                }
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
