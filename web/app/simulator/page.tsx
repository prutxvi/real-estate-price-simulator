"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionTitle, Card, Chip, RSlider } from "@/components/ui";
import cityMapJson from "@/lib/data/city_map.json";
import { DEFAULT_FEATURES, HouseFeatures, fmtINR, fmtNum, fmtPerSqft } from "@/lib/predict";
import { taxes } from "@/lib/config";

const CM = cityMapJson as unknown as Record<string, { location: string; city: string; median_price: number; n: number; lat: number; long: number }>;
const localities = Object.values(CM).sort((a, b) => a.city.localeCompare(b.city) || b.n - a.n);

const TOGGLES: { key: keyof HouseFeatures; label: string; icon: string }[] = [
  { key: "resale", label: "Resale property", icon: "🔑" },
  { key: "pool", label: "Swimming pool", icon: "🏊" },
  { key: "gym", label: "Gymnasium", icon: "🏋️" },
  { key: "clubhouse", label: "Club house", icon: "🏛️" },
  { key: "security", label: "24×7 security", icon: "🛡️" },
  { key: "backup", label: "Power backup", icon: "🔋" },
  { key: "car_parking", label: "Covered parking", icon: "🅿️" },
  { key: "lift", label: "Lift", icon: "🛗" },
  { key: "vaastu", label: "Vaastu-compliant", icon: "🧭" },
];

export default function Simulator() {
  const [f, setF] = useState<HouseFeatures>({ ...DEFAULT_FEATURES });
  const [result, setResult] = useState<any>(null);
  const [sims, setSims] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const set = useCallback(
    (patch: Partial<HouseFeatures>) => setF((prev) => ({ ...prev, ...patch })),
    []
  );

  useEffect(() => {
    let dead = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const [pr, sr] = await Promise.all([
          fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ features: f }) }).then((r) => r.json()),
          fetch("/api/similar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ features: f, k: 10 }) }).then((r) => r.json()),
        ]);
        if (!dead) { setResult(pr); setSims(sr.similar); setBusy(false); }
      } catch { if (!dead) setBusy(false); }
    }, 120);
    return () => { dead = true; clearTimeout(t); };
  }, [f]);

  const loc = CM[f.location];
  const taxPct = taxes.stampDutyPct + taxes.registrationPct;
  const maxContrib = useMemo(() => {
    if (!result) return 1;
    return Math.max(...result.breakdown.map((b: any) => Math.abs(b.amount))) || 1;
  }, [result]);

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="The simulator"
        title="Hyderabad Price Simulator"
        desc="Drag the sliders and pick a locality — the price updates instantly from a multiple-regression model fitted to 2,518 real Hyderabad listings (11 features + 48 locality dummies, R² = 0.775). The neural net gives a second opinion, and the closest real sales benchmark the estimate against reality."
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* controls */}
        <Card className="lg:col-span-2">
          <h3 className="mb-1 flex items-center gap-2 text-[15px] font-bold">🎛️ Property details</h3>
          <p className="mb-4 text-[12px] text-[var(--muted)]">Move anything — the estimate recalculates instantly.</p>
          <RSlider label="Carpet area (sq ft)" value={f.area} min={300} max={10000} step={10} onChange={(v) => set({ area: v })} fmt={(v) => v.toLocaleString("en-IN")} />
          <RSlider label="Bedrooms (BHK)" value={f.bedrooms} min={1} max={8} step={1} onChange={(v) => set({ bedrooms: v })} fmt={(v) => `${Math.round(v)} BHK`} />

          <div className="mb-3 grid grid-cols-2 gap-2">
            {TOGGLES.map((t) => (
              <button
                key={t.key}
                onClick={() => set({ [t.key]: (f[t.key] as number) === 1 ? 0 : 1 } as any)}
                className={`rounded-xl border px-3 py-2 text-left text-[12.5px] font-medium transition ${
                  (f[t.key] as number) === 1
                    ? "border-[var(--accent1)]/50 bg-[var(--accent1)]/15 text-[var(--accent1)]"
                    : "border-[var(--border)] bg-[var(--panel2)] text-[var(--text2)] hover:bg-[var(--panel2)]"
                }`}
              >
                {t.icon} {t.label}
                {(f[t.key] as number) === 1 ? " ✓" : ""}
              </button>
            ))}
          </div>

          <label className="mb-1 block text-[12px] text-[var(--text2)]">Locality (46 areas of Hyderabad)</label>
          <select value={f.location} onChange={(e) => set({ location: e.target.value })} className="w-full">
            {localities.map((z) => (
              <option key={z.city} value={z.city}>
                {z.city} — median {fmtINR(z.median_price)}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[11px] text-[var(--muted)]">
            Median is the middle sale price of {loc ? loc.n.toLocaleString("en-IN") : "0"} listings in this locality.
          </p>
        </Card>

        {/* outputs */}
        <div className="space-y-4 lg:col-span-3">
          {result ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="grad-ring relative overflow-hidden p-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                      <span className="mr-1.5">📈</span> Regression + locality
                    </div>
                    <span className="floaty">🏠</span>
                  </div>
                  <div className="mt-3 text-[34px] font-extrabold leading-none tracking-tight">{fmtINR(result.linear.price)}</div>
                  <div className="mt-2 text-[12px] text-[var(--muted)]">
                    {fmtPerSqft(result.linear.price / f.area)} · R² = {result.linear.r2.toFixed(3)}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Chip tone="emerald">±{fmtINR(result.linear.rmse)} (1 RMSE)</Chip>
                    <Chip tone="cyan">{fmtINR(result.linear.band[0])} – {fmtINR(result.linear.band[1])}</Chip>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--panel2)]">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-[var(--accent1)] to-[var(--accent2)]" />
                  </div>
                </Card>
                <Card className="relative overflow-hidden p-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                      <span className="mr-1.5">🧠</span> Neural net (AI)
                    </div>
                    <span className="floaty">🤖</span>
                  </div>
                  <div className="mt-3 text-[34px] font-extrabold leading-none tracking-tight">{fmtINR(result.mlp.price)}</div>
                  <div className="mt-2 text-[12px] text-[var(--muted)]">R² = {result.mlp.r2.toFixed(3)} on holdout</div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Chip tone="cyan">±{fmtINR(result.mlp.rmse)} (1 RMSE)</Chip>
                    <Chip>No locality input — pure maths</Chip>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--panel2)]">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-[var(--accent2)] to-blue-500" />
                  </div>
                </Card>
              </div>

              <Card className="grad-ring relative overflow-hidden p-lg">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-[15px] font-bold">🧾 All-in cost with taxes</h3>
                  <span className="text-[10.5px] uppercase tracking-wider text-[var(--muted)]">Telangana · approx</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Estimated price</div>
                    <div className="mt-0.5 text-lg font-bold">{fmtINR(result.linear.price)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Stamp duty ({taxes.stampDutyPct}%)</div>
                    <div className="mt-0.5 text-lg font-bold text-amber-500">{fmtINR(result.linear.price * taxes.stampDutyPct / 100)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Registration ({taxes.registrationPct}%)</div>
                    <div className="mt-0.5 text-lg font-bold text-amber-500">{fmtINR(result.linear.price * taxes.registrationPct / 100)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[var(--accent1)]">Total with taxes</div>
                    <div className="mt-0.5 text-2xl font-extrabold text-[var(--accent1)]">
                      {fmtINR(result.linear.price * (1 + taxPct / 100))}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11.5px] text-[var(--muted)]">
                  {taxPct}% loading on the estimated price ({taxes.note}). Exact duty can differ by property value and buyer category.
                </p>
              </Card>

              <Card>
                <h3 className="mb-1 font-semibold text-[var(--text)]">Where the price comes from</h3>
                <p className="mb-4 text-[12px] text-[var(--muted)]">
                  Exact linear decomposition — each feature&apos;s contribution = coefficient × (value − average). In {f.location}.
                </p>
                <div className="space-y-2.5">
                  {result.breakdown.map((b: any) => {
                    const pct = Math.min(100, (Math.abs(b.amount) / maxContrib) * 100);
                    const pos = b.amount >= 0;
                    return (
                      <div key={b.key} className="flex items-center gap-3 text-[12.5px]">
                        <div className="w-44 shrink-0 truncate text-[var(--text2)]">{b.label}</div>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--panel2)]">
                          <div className={`h-full rounded-full ${pos ? "bg-[var(--accent1)]" : "bg-rose-400"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className={`w-28 shrink-0 text-right tabular-nums ${pos ? "text-[var(--accent1)]" : "text-rose-400"}`}>
                          {pos ? "+" : ""}{fmtINR(b.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[12px] text-[var(--muted)]">
                  Sum of all contributions + baseline average home = predicted price. Rose bars drag the price down, green bars push it up.
                </p>
              </Card>

              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-[var(--text)]">10 most similar real listings</h3>
                  {busy && <span className="text-[11px] text-[var(--muted)]">updating…</span>}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                        <th className="pb-2 pr-3">Price</th>
                        <th className="pb-2 pr-3">Area</th>
                        <th className="pb-2 pr-3">BHK</th>
                        <th className="pb-2 pr-3">Resale</th>
                        <th className="pb-2 pr-3">Locality</th>
                        <th className="pb-2">Similarity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sims.map((s) => (
                        <tr key={s.id} className="border-b border-[var(--border-soft)]">
                          <td className="py-2 pr-3 font-semibold text-[var(--accent1)]">{fmtINR(s.price)}</td>
                          <td className="py-2 pr-3">{s.area.toLocaleString("en-IN")} sq ft</td>
                          <td className="py-2 pr-3">{s.bedrooms}</td>
                          <td className="py-2 pr-3">{s.resale ? "Yes" : "New"}</td>
                          <td className="py-2 pr-3">{s.city || s.location}</td>
                          <td className="py-2 text-[var(--muted)]">{(s.distance).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-[12px] text-[var(--muted)]">
                  k-NN over the same standardized features the model uses. Lower similarity score = closer match. These are actual asking prices from the dataset.
                </p>
              </Card>
            </>
          ) : (
            <Card className="flex h-64 items-center justify-center text-[var(--muted)]">Computing prediction…</Card>
          )}
        </div>
      </div>
    </div>
  );
}
