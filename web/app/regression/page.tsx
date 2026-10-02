"use client";
import { useEffect, useState } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar, Cell } from "recharts";
import { SectionTitle, Card, Chip } from "@/components/ui";
import { fmtINR } from "@/lib/predict";

const FEAT_NAME: Record<string, string> = {
  const: "Intercept (β₀)", area: "Carpet area (sq ft)", bedrooms: "Bedrooms (BHK)", resale: "Resale",
  pool: "Swimming pool", gym: "Gymnasium", clubhouse: "Club house", security: "24×7 security",
  backup: "Power backup", car_parking: "Covered parking", lift: "Lift", vaastu: "Vaastu-compliant",
};

function stars(p: number) {
  if (p < 0.001) return "***";
  if (p < 0.01) return "**";
  if (p < 0.05) return "*";
  return "";
}

const TICK = { fill: "#8ea0b8", fontSize: 11 };
const TOOLTIP = { background: "#0b1220", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 };

export default function Regression() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  if (!data) return <div className="muted">Loading…</div>;

  const { coefTable, residuals, lin10, models, stats } = data;
  const rows = coefTable.map((r: any) => ({ ...r, coefINR: r.coef * 1e6 }));
  const compare = stats.model_comparison.map((m: any) => ({ name: m.name, R2: Number(Number(m.r2).toFixed(3)), rmse: m.rmse }));
  const resid = residuals.sample;
  const qq = residuals.qq;
  const nLoc = (stats.price.localities ?? 46) - 1;

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="Maths · Regression"
        title="Multiple linear regression"
        desc="The engine behind the simulator. Price is modelled as a linear combination of area, rooms, amenities and locality (48 locality dummy variables), fitted by Ordinary Least Squares on 2,518 Hyderabad listings."
      />

      <Card>
        <h3 className="mb-1 font-semibold text-[var(--text)]">The model</h3>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-black/40 p-4 text-[12.5px] leading-relaxed text-emerald-200">
{`price = β₀ + β₁·area + β₂·bedrooms + β₃·resale + β₄·pool + β₅·gym + β₆·clubhouse
      + β₇·security + β₈·backup + β₉·parking + β₁₀·lift + β₁₁·vaastu
      + Σ_l γ_l·1(locality = l)      (48 locality dummies)`}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip>R² = {lin10.r2.toFixed(4)}</Chip>
          <Chip tone="cyan">adj R² = {lin10.adj_r2.toFixed(4)}</Chip>
          <Chip tone="amber">F = {Number(lin10.fvalue).toFixed(1)}</Chip>
          <Chip>p(F) &lt; 0.0001</Chip>
          <Chip tone="slate">n = {lin10.nobs.toLocaleString("en-IN")}</Chip>
        </div>
        <p className="mt-3 text-[12.5px] muted">
          Adding locality raises R² to <b className="text-[var(--text)]">{models.linearZip.r2.toFixed(3)}</b> and holdout error falls to
          <b className="text-[var(--text)]"> ±{fmtINR(models.linearZip.rmse)}</b>. Every coefficient below is statistically
          significant (p &lt; 0.001) — denoted ***.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">Coefficients (11-feature model, ₹ per unit)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wider muted">
                  <th className="pb-2 pr-4">Term</th>
                  <th className="pb-2 pr-4 text-right">β</th>
                  <th className="pb-2 pr-4 text-right">p-value</th>
                  <th className="pb-2 text-right">Signif.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.term} className="border-b border-[var(--border-soft)]">
                    <td className="py-2 pr-4 font-mono text-[var(--text2)]">{FEAT_NAME[r.term] ?? r.term}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-[var(--accent1)]">
                      {r.coefINR >= 0 ? "+" : ""}{Math.round(r.coefINR).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums muted">{Number(r.pvalue).toExponential(2)}</td>
                    <td className="py-2 text-right text-amber-300">{stars(r.pvalue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] muted">*** p&lt;0.001 · Coefficients are per raw unit (e.g. +₹X per extra sq ft); p-values test H₀: β = 0.</p>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">R²: simple → multiple → + locality</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={compare}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={TICK} />
              <YAxis domain={[0, 1]} tick={TICK} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v: any, n: any) => [n === "R2" ? Number(v).toFixed(3) : v, n]} />
              <Bar dataKey="R2" radius={[6, 6, 0, 0]}>
                {compare.map((_: any, i: number) => (
                  <Cell key={i} fill={["#64748b", "#22d3ee", "#34d399", "#a78bfa"][i] ?? "#34d399"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-[12.5px] muted">
            Each variable group adds explanatory power: area alone explains 69% of price variance; adding BHK, resale and amenities reaches 71%;
            and knowing the locality pushes it to <b className="text-[var(--text)]">77%</b>. That is why a simulator needs location.
          </p>
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--panel2)] p-3 text-[12.5px] muted">
            <b className="text-[var(--text)]">Holdout (20% unseen listings):</b>{" "}
            {stats.holdout.map((m: any, i: number) => (
              <span key={i}>
                {i > 0 ? " · " : ""}{m.name} R² = {Number(m.r2).toFixed(3)}, ±{fmtINR(m.rmse)}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">Residuals vs fitted</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="fitted" tick={TICK} tickFormatter={(v) => fmtINR(Number(v))} />
              <YAxis dataKey="resid" tick={TICK} tickFormatter={(v) => fmtINR(Number(v))} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v: any, n: any) => [fmtINR(Number(v)), n]} />
              <Scatter data={resid} fill="#818cf8" fillOpacity={0.35} />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="mt-2 text-[12px] muted">Fan shape = variance grows with price (heteroscedasticity) — expected for raw-rupee housing data.</p>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">Q–Q plot of residuals</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={qq}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="x" tick={TICK} />
              <YAxis dataKey="y" tick={TICK} tickFormatter={(v) => fmtINR(Number(v))} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v: any, n: any) => [fmtINR(Number(v)), n]} />
              <Line type="monotone" dataKey="y" stroke="#34d399" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-2 text-[12px] muted">Points bend at the top = fat right tail (a few premium ₹10 Cr+ listings) — mild non-normality, acceptable at n = 2,518.</p>
        </Card>
      </div>
    </div>
  );
}
