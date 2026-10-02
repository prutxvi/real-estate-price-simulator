"use client";
import { useEffect, useState } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { SectionTitle, Card } from "@/components/ui";
import { fmtINR } from "@/lib/predict";

const LABEL: Record<string, string> = {
  area: "Carpet area", bedrooms: "Bedrooms", resale: "Resale", pool: "Swimming pool",
  gym: "Gymnasium", clubhouse: "Club house", security: "24×7 security",
  backup: "Power backup", car_parking: "Parking", lift: "Lift", vaastu: "Vaastu",
  price: "Price",
};

const TICK = { fill: "#8ea0b8", fontSize: 11 };
const TOOLTIP = { background: "#0b1220", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 };

function strength(r: number): string {
  const a = Math.abs(r);
  if (a >= 0.7) return "strong";
  if (a >= 0.4) return "moderate";
  if (a >= 0.2) return "weak";
  return "very weak / none";
}

function heatColor(r: number) {
  const t = Math.abs(r);
  if (r >= 0) return `rgba(52, 211, 153, ${0.12 + t * 0.75})`;
  return `rgba(251, 113, 133, ${0.12 + t * 0.75})`;
}

export default function Correlation() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  if (!data) return <div className="muted">Loading…</div>;
  const cm = data.stats.corr_matrix as Record<string, Record<string, number>>;
  const cols = Object.keys(cm);
  const rows = Object.keys(cm);
  const withPrice = Object.entries(data.stats.corr as Record<string, number>).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const scat1 = data.stats.scatter;
  const scat2 = data.stats.scatter.map((s: any) => ({ bedrooms: s.bedrooms ?? 3, price: s.price }));

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="Maths · Correlation"
        title="Correlation analysis"
        desc="Pearson’s correlation coefficient r measures the strength and direction of a linear relationship between two variables, from −1 (perfect inverse) to +1 (perfect positive). r = 0 means no linear relationship. Computed on 2,518 Hyderabad listings."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">Correlation heatmap (12 variables)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-separate" style={{ borderSpacing: 2 }}>
              <tbody>
                {rows.map((r) => (
                  <tr key={r}>
                    {cols.map((c) => {
                      const v = cm[r][c];
                      return (
                        <td
                          key={c}
                          title={`${LABEL[r]} × ${LABEL[c]} = ${v}`}
                          className="text-center text-[10px] font-medium tabular-nums text-[var(--text)]"
                          style={{ background: heatColor(v), minWidth: 30, height: 26, borderRadius: 4, color: Math.abs(v) > 0.55 ? "#fff" : "rgba(230,237,247,0.75)" }}
                        >
                          {Math.abs(v) < 0.005 ? "·" : v.toFixed(2).replace(/^0/, "")}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] muted">
            Green = positive correlation, red = negative. The last row/column is correlation with <b className="text-[var(--text)]">price</b>.
          </p>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">Correlation with price</h3>
          <div className="space-y-2">
            {withPrice.map(([feat, r]) => (
              <div key={feat} className="flex items-center gap-3 text-[13px]">
                <div className="w-36 shrink-0 text-[var(--text2)]">{LABEL[feat] ?? feat}</div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--panel2)]">
                  <div
                    className={`h-full rounded-full ${r >= 0 ? "bg-gradient-to-r from-emerald-500 to-emerald-300" : "bg-gradient-to-r from-rose-500 to-rose-300"}`}
                    style={{ width: `${Math.abs(r) * 100}%` }}
                  />
                </div>
                <div className="w-14 shrink-0 text-right tabular-nums text-[var(--text)]">{r.toFixed(3)}</div>
                <div className="w-28 shrink-0 text-right text-[11px] muted">{strength(r)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">Carpet area vs price — r = 0.829</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="area" name="sq ft" tick={TICK} />
              <YAxis dataKey="price" name="price" tick={TICK} tickFormatter={(v) => fmtINR(Number(v))} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v: any, n: any) => [n === "price" ? fmtINR(Number(v)) : v, n]} />
              <Scatter data={scat1} fill="#34d399" fillOpacity={0.4} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">Bedrooms vs price — r = 0.614</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="bedrooms" type="number" tick={TICK} />
              <YAxis dataKey="price" type="number" tick={TICK} tickFormatter={(v) => fmtINR(Number(v))} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v: any, n: any) => [n === "price" ? fmtINR(Number(v)) : v, n]} />
              <Scatter data={scat2} fill="#22d3ee" fillOpacity={0.4} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold text-[var(--text)]">Reading the correlations</h3>
        <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed muted">
          <li><b className="text-[var(--accent1)]">Carpet area (0.83)</b> is by far the strongest single predictor of price in Hyderabad.</li>
          <li><b className="text-[var(--accent1)]">Bedrooms (0.61)</b> matter, but far less than area — a 3 BHK in Banjara Hills costs more than a 5 BHK in a budget belt.</li>
          <li>Amenities (pool, gym, club house, security) each correlate 0.15–0.29 — real, but they mostly travel with the area and locality.</li>
          <li>Correlation measures each variable <em>alone</em>. In multiple regression, the same variables work together and can flip signs — that is why correlation alone is not enough.</li>
        </ul>
      </Card>
    </div>
  );
}
