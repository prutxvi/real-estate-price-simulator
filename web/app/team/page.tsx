import { SectionTitle, Card, Kicker } from "@/components/ui";
import { site } from "@/lib/config";
import { IconCap, IconPlus } from "@/components/icons";

const AVATAR_GRADS = [
  "from-emerald-400 to-teal-500",
  "from-cyan-400 to-blue-500",
  "from-amber-400 to-orange-500",
  "from-fuchsia-400 to-purple-500",
  "from-rose-400 to-pink-500",
];

function Avatar({ photo, name, grad, mono, size = "lg" }: { photo: string; name: string; grad?: string; mono?: string; size?: "lg" | "xl" }) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={name} className={`${size === "lg" ? "h-20 w-20" : "h-28 w-28"} rounded-2xl border border-[var(--border)] object-cover shadow-lg`} />;
  }
  const initial = (mono || name.split(" ").map((w) => w[0]).join("").slice(0, 2)).toUpperCase();
  return (
    <div className={`flex ${size === "lg" ? "h-20 w-20 text-xl" : "h-28 w-28 text-3xl"} items-center justify-center rounded-2xl bg-gradient-to-br ${grad || "from-slate-500 to-slate-700"} font-extrabold text-white shadow-lg`}>
      {initial}
    </div>
  );
}

function MemberCard({ m, i }: { m: { name: string; regNo: string; photo: string }; i: number }) {
  return (
    <div
      className="panel panel-hover group fade-up relative overflow-hidden p-5"
      style={{ animationDelay: `${0.08 + i * 0.09}s` }}
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--accent1)] to-[var(--accent2)] opacity-70 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center gap-4">
        <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
          <Avatar photo={m.photo} name={m.name} grad={AVATAR_GRADS[i % AVATAR_GRADS.length]} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[16px] font-bold">{m.name}</div>
          <div className="mt-1 font-mono text-[13px] tracking-wide text-[var(--accent1)]">Reg. No. {m.regNo}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--panel2)] px-2 py-0.5 text-[10.5px] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent1)]" /> Member · Class {site.className}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <div className="space-y-8">
      <SectionTitle
        kicker="Team"
        title="The project team"
        desc={`Group {site.className} · {site.department} · Guided by {site.guide.name}. Photos go in web/public/team/ and are picked up from lib/config.ts automatically.`}
      />

      {/* guide spotlight */}
      <div className="fade-up grad-ring panel relative overflow-hidden p-6 sm:p-8">
        <IconCap className="floaty pointer-events-none absolute -right-6 -top-6 h-32 w-32 opacity-[0.07]" strokeWidth={1.2} />
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="shrink-0">
            <Avatar photo={site.guide.photo} name={site.guide.name} mono="LG" grad="from-emerald-400 to-cyan-500" size="xl" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent1)]">Project guide</div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight">{site.guide.name}</div>
            <div className="mt-1 text-[13.5px] text-[var(--muted)]">
              {site.guide.role} · Department of Mathematics · Class {site.className}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel2)] px-4 py-2 text-center">
              <div className="text-xl font-extrabold text-[var(--accent1)]">{site.members.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Members</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel2)] px-4 py-2 text-center">
              <div className="text-xl font-extrabold text-[var(--accent2)]">{site.className}</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Class</div>
            </div>
          </div>
        </div>
      </div>

      {/* members */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {site.members.map((m, i) => (
          <MemberCard key={m.name} m={m} i={i} />
        ))}

        {/* open slot for a 6th member if the group grows */}
        <div className="panel fade-up flex min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] p-5 text-center"
             style={{ animationDelay: `${0.08 + site.members.length * 0.09}s` }}>
          <div>
            <IconPlus className="mx-auto h-6 w-6 opacity-60" />
            <div className="mt-1 text-[12px] text-[var(--muted)]">Slot for a 6th member (optional)</div>
          </div>
        </div>
      </div>

      <Card className="fade-up">
        <h3 className="font-semibold text-[var(--text)]">Where this shows up</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
          The same names and registration numbers flow into the site header, footer and the print-ready
          <b className="text-[var(--text)]"> /report</b> cover. Drop {`photo`} files into <code className="rounded bg-[var(--panel2)] px-1.5 py-0.5 font-mono text-[12px]">web/public/team/</code> (guide.jpg, member0.jpg …) and this page updates automatically.
        </p>
      </Card>
    </div>
  );
}
