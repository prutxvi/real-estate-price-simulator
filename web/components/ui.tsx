import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`panel panel-hover p-5 ${className}`}>{children}</div>;
}

export function Stat({ label, value, sub, icon }: { label: string; value: React.ReactNode; sub?: string; icon?: string }) {
  return (
    <div className="panel panel-hover group p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider muted">
        {icon ? <span className="text-[13px]">{icon}</span> : null}
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-extrabold tracking-tight">{value}</div>
      {sub ? <div className="mt-0.5 text-[11.5px] muted">{sub}</div> : null}
    </div>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return <span className="kicker">{children}</span>;
}

export function SectionTitle({ kicker, title, desc }: { kicker?: string; title: string; desc?: string }) {
  return (
    <div className="mb-6">
      {kicker ? <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent1)]">{kicker}</div> : null}
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      {desc ? <p className="mt-3 max-w-3xl text-[14px] leading-relaxed muted">{desc}</p> : null}
    </div>
  );
}

export function Chip({ children, tone = "emerald" }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    emerald: "border-[color:var(--border)] bg-[var(--panel2)] text-[var(--accent1)]",
    cyan: "border-[color:var(--border)] bg-[var(--panel2)] text-[var(--accent2)]",
    amber: "border-[color:var(--border)] bg-[var(--panel2)] text-amber-500",
    rose: "border-[color:var(--border)] bg-[var(--panel2)] text-rose-400",
    slate: "border-[color:var(--border)] bg-[var(--panel2)] text-[var(--muted)]",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[tone] ?? tones.emerald}`}>
      {children}
    </span>
  );
}

export function Bar({ label, value, max, invert = false }: { label: string; value: number; max: number; invert?: boolean }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  const pos = value >= 0 === !invert;
  const color = pos ? "bg-[var(--accent1)]" : "bg-rose-400";
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <div className="w-40 shrink-0 truncate text-[var(--text2)]">{label}</div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--panel2)]">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-28 shrink-0 text-right tabular-nums text-[var(--text2)]">
        {value >= 0 ? "+" : ""}
        {("₹" + Math.round(value).toLocaleString("en-IN"))}
      </div>
    </div>
  );
}

export function RSlider({
  label, value, min, max, step, onChange, fmt,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; fmt: (v: number) => string;
}) {
  return (
    <div className="mb-3.5">
      <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
        <span className="text-[var(--text2)]">{label}</span>
        <span className="font-bold tabular-nums text-[var(--accent1)]">{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function fmtPct(v: number) { return v.toFixed(2) + "%"; }
export function fmtMoney(v: number) {
  const a = Math.abs(v);
  if (a >= 1e7) return "₹" + (v / 1e7).toFixed(2) + " Cr";
  if (a >= 1e5) return "₹" + (v / 1e5).toFixed(1) + " L";
  return "₹" + Math.round(v).toLocaleString("en-IN");
}
