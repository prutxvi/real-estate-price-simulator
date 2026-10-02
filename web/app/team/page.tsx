import { SectionTitle, Card } from "@/components/ui";
import { site } from "@/lib/config";

function AvatarSlot({ photo, name }: { photo: string; name: string }) {
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo} alt={name} className="h-24 w-24 rounded-2xl border border-white/15 object-cover" />
  ) : (
    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-white/20 text-[10px] text-[var(--muted)]">
      photo<br />pending
    </div>
  );
}

export default function Team() {
  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="Team"
        title="Project team"
        desc="Fill names, registration numbers and photos in app/lib/config.ts — the page updates everywhere instantly (site header, footer and report cover)."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="mb-3 font-semibold text-[var(--text)]">Project guide</h3>
          <div className="flex items-center gap-4">
            <AvatarSlot photo={site.guide.photo} name={site.guide.name} />
            <div>
              <div className="font-semibold text-[var(--text)]">{site.guide.name}</div>
              <div className="text-[12px] muted">{site.guide.role}</div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-3 font-semibold text-[var(--text)]">Group members</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {site.members.map((m, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--panel2)] p-3 text-center">
                <div className="mb-2 flex justify-center"><AvatarSlot photo={m.photo} name={m.name} /></div>
                <div className="text-[13px] font-semibold text-[var(--text)]">{m.name}</div>
                <div className="text-[11.5px] muted">{m.regNo}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
