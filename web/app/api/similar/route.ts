import { NextResponse } from "next/server";
import { DEFAULT_FEATURES, HouseFeatures, cityMap } from "@/lib/predict";
import { nearestHouses } from "@/lib/similar";

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const f: HouseFeatures = { ...DEFAULT_FEATURES, ...(body.features || {}) };
  const k = Math.min(20, Math.max(1, Number(body.k) || 10));
  const sims = nearestHouses(f, k).map((h) => ({
    id: h.id, price: h.price, area: h.area, bedrooms: h.bedrooms,
    resale: h.resale, location: h.location,
    city: cityMap[h.location]?.city ?? h.location,
    distance: Number(h.distance.toFixed(3)),
  }));
  return NextResponse.json({ similar: sims });
}
