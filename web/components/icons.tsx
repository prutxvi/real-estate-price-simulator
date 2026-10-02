import React from "react";

type P = { className?: string; strokeWidth?: number };

const base = (strokeWidth = 2): React.SVGProps<SVGSVGElement> => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export function IconHome({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function IconLogo({ className = "", strokeWidth = 2.2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v11h14V10" />
      <path d="m7 17 3.6-3.6 2.4 2.4L19 9" />
      <path d="M19 9v3.3M19 9h-3.3" />
    </svg>
  );
}

export function IconBot({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <rect x="4" y="8" width="16" height="12" rx="2.5" />
      <circle cx="9.5" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 8V5" /><path d="M9 3h6" />
    </svg>
  );
}

export function IconRocket({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export function IconChart({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
    </svg>
  );
}

export function IconSigma({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M18 7V4H6l6 8-6 8h12v-3" />
      <circle cx="19.5" cy="5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSliders({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" />
      <line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" />
      <line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" />
      <line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" />
    </svg>
  );
}

export function IconPin({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconChat({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconFile({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export function IconSpark({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z" />
      <path d="M19 3v3M20.5 4.5h-3" />
    </svg>
  );
}

export function IconBrain({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <circle cx="5" cy="12" r="2.4" /><circle cx="12" cy="6" r="2.4" /><circle cx="19" cy="12" r="2.4" />
      <path d="M5 12v2a4 4 0 0 0 3 3.9V19" />
      <path d="M12 6v2a4 4 0 0 0 3 3.9V19" />
      <path d="M19 12v2a4 4 0 0 1-3 3.9V19" />
    </svg>
  );
}

export function IconUsers({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconCap({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="m22 10-10-5L2 10l10 5z" />
      <path d="M6 12.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
      <path d="M22 10v6" />
    </svg>
  );
}

export function IconTarget({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function IconPrint({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}

export function IconPlus({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconUser({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconReceipt({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function IconRuler({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <rect x="2.7" y="8.9" width="18.6" height="6.2" rx="1.2" transform="rotate(-45 12 12)" />
      <path d="m9.5 9.5 1.4 1.4" /><path d="m12 7 1.4 1.4" /><path d="m14.5 11.5 1.4 1.4" /><path d="m12.5 14.5 1.4 1.4" />
    </svg>
  );
}

export function IconTrend({ className = "", strokeWidth = 2 }: P) {
  return (
    <svg {...base(strokeWidth)} className={className}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}
