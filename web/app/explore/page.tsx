"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ScatterChart, Scatter,
} from "recharts";
import { SectionTitle, Card, Stat } from "@/components/ui";
import { fmtINR } from "@/lib/predict";
import { IconHome, IconRuler, IconTrend, IconPin } from "@/components/icons";

const TICK = { fill: "#8ea0b8", fontSize: 11 };
const TOOLTIP = { background: "#0b1220", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 };

export default function Explore() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="muted">Loading dataset…</div>;
  const { stats } = data;
  const hist = stats.hist_price.map((b: any) => ({ label: `₹${Math.round(b.lower / 1e5)}L`, count: b.count }));
  const locBar = stats.loc_price.map((z: any) => ({ name: z.city, price: z.median_price, n: z.n })).reverse();
  const scat = stats.scatter;

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="Data"
        title="Explore the dataset"
        desc="2,518 real Hyderabad property listings (asking prices from listing sites). Each row: price, carpet area, bedrooms (BHK), new/resale status, 9 amenity flags and the locality."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<IconHome className="h-4 w-4" />} label="Mean price" value={fmtINR(stats.price.mean)} />
        <Stat icon={<IconRuler className="h-4 w-4" />} label="Median price" value={fmtINR(stats.price.median)} />
        <Stat icon={<IconTrend className="h-4 w-4" />} label="Range" value={fmtINR(stats.price.min) + " – " + fmtINR(stats.price.max)} />
        <Stat icon={<IconPin className="h-4 w-4" />} label="Localities" value={stats.price.localities} sub={`${stats.price.n.toLocaleString("en-IN")} listings`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">Price distribution (₹10L bins)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hist}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={TICK} interval={3} />
              <YAxis tick={TICK} />
              <Tooltip contentStyle={TOOLTIP} />
              <Bar dataKey="count" fill="url(#g1)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-[12px] muted">Right-skewed: most listings cluster ₹40L–₹1.2 Cr, with a long premium tail to ₹16.5 Cr.</p>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text)]">Carpet area vs price</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" dataKey="area" name="sq ft" tick={TICK} />
              <YAxis type="number" dataKey="price" name="price" tick={TICK} tickFormatter={(v) => fmtINR(Number(v))} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v: any, n: any) => [n === "price" ? fmtINR(v) : v, n]} />
              <Scatter data={scat} fill="#22d3ee" fillOpacity={0.45} />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="mt-2 text-[12px] muted">A strong upward trend (r = 0.83) — but the band widens with size: bigger homes vary a lot in price.</p>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold text-[var(--text)]">Top 20 localities by median price</h3>
        <ResponsiveContainer width="100%" height={440}>
          <BarChart data={locBar} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis type="number" tick={TICK} tickFormatter={(v) => fmtINR(Number(v))} />
            <YAxis type="category" dataKey="name" width={170} tick={TICK} />
            <Tooltip contentStyle={TOOLTIP} formatter={(v: any) => fmtINR(Number(v))} />
            <Bar dataKey="price" fill="url(#g2)" radius={[0, 4, 4, 0]} />
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-[12px] muted">Banjara Hills (~₹3 Cr median) vs Kukatpally (~₹60L): locality shifts the median by about 5×.</p>
      </Card>
    </div>
  );
}
