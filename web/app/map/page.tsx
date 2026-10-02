"use client";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { SectionTitle, Card, Chip } from "@/components/ui";
import { cityMap, fmtINR } from "@/lib/predict";
import "leaflet/dist/leaflet.css";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

const MAX = 165_000_000; // ₹16.5 Cr — priciest listing in the dataset

function priceColor(price: number) {
  const t = Math.min(1, Math.max(0, Math.log(price) / Math.log(MAX)));
  const r = Math.round(52 + (251 - 52) * t);
  const g = Math.round(211 - (211 - 146) * t);
  const b = Math.round(153 - (153 - 135) * t);
  return `rgb(${r},${g},${b})`;
}

export default function MapPage() {
  const [houses, setHouses] = useState<any[]>([]);
  const [maxPrice, setMaxPrice] = useState(25_000_000); // ₹2.5 Cr — covers ~94% of listings; drag up to see premium belts
  const [sel, setSel] = useState<any>(null);

  useEffect(() => {
    fetch("/data/houses.json").then((r) => r.json()).then(setHouses).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const pool = houses.filter((h) => h.price <= maxPrice);
    // cap total markers for browser performance
    const step = Math.max(1, Math.floor(pool.length / 1800));
    return pool.filter((_, i) => i % step === 0);
  }, [houses, maxPrice]);

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="Geography"
        title="Hyderabad price map"
        desc="Every dot is a real Hyderabad listing, colored by price (green = affordable → red = premium). Drag the filter to focus a budget, hover a dot for details, click for the full record."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="font-semibold text-[var(--text)]">Hyderabad · {filtered.length.toLocaleString("en-IN")} listings shown</h3>
            <div className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
              Max price
              <input type="range" min={2000000} max={165000000} step={100000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-36" />
              {fmtINR(maxPrice)}
            </div>
          </div>
          <div className="h-[560px] overflow-hidden rounded-xl border border-[var(--border)]">
            <LeafletMap houses={filtered} onSelect={setSel} colorFn={priceColor} />
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <h3 className="mb-2 font-semibold text-[var(--text)]">{sel ? "Selected listing" : "Click a listing"}</h3>
            {sel ? (
              <div className="space-y-2 text-[13px]">
                <div className="text-2xl font-extrabold text-[var(--accent1)]">{fmtINR(sel.price)}</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[var(--muted)]">
                  <span>Area</span><span className="text-right text-[var(--text2)]">{sel.area.toLocaleString("en-IN")} sq ft</span>
                  <span>Bedrooms</span><span className="text-right text-[var(--text2)]">{sel.bedrooms} BHK</span>
                  <span>Resale</span><span className="text-right text-[var(--text2)]">{sel.resale ? "Yes" : "New"}</span>
                  <span>Pool / Gym</span><span className="text-right text-[var(--text2)]">{sel.pool ? "✓" : "—"} / {sel.gym ? "✓" : "—"}</span>
                  <span>Club house</span><span className="text-right text-[var(--text2)]">{sel.clubhouse ? "Yes" : "No"}</span>
                  <span>Security</span><span className="text-right text-[var(--text2)]">{sel.security ? "24×7" : "No"}</span>
                  <span>Power backup</span><span className="text-right text-[var(--text2)]">{sel.backup ? "Yes" : "No"}</span>
                  <span>Parking</span><span className="text-right text-[var(--text2)]">{sel.car_parking ? "Covered" : "No"}</span>
                  <span>Vaastu</span><span className="text-right text-[var(--text2)]">{sel.vaastu ? "Compliant" : "No"}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Chip>{sel.location}</Chip>
                </div>
              </div>
            ) : (
              <p className="text-[12.5px] text-[var(--muted)]">Banjara Hills and Jubilee Hills glow red at ₹2+ Cr, while budget belts stay green — locality is the single biggest price driver in the data.</p>
            )}
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold text-[var(--text)]">How it reads</h3>
            <div className="space-y-1.5 text-[12px] text-[var(--muted)]">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: priceColor(500000) }} /> ~₹50 L — budget homes</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: priceColor(7750000) }} /> ₹77 L — median listing</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: priceColor(30000000) }} /> ₹3 Cr+ — premium areas</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
