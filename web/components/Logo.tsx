import { IconLogo } from "./icons";

export function Logo({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`grad-bg inline-flex shrink-0 items-center justify-center rounded-xl shadow-[0_6px_20px_-6px_var(--glow)] ${className}`}
      style={{ width: size, height: size }}
    >
      <IconLogo className="text-[var(--accent1-ink)]" strokeWidth={2.4} />
    </span>
  );
}
