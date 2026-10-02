import linearJson from "./models/linear.json";
import mlpJson from "./models/mlp.json";
import cityMapJson from "./data/city_map.json";

export const FEATURES = [
  "area", "bedrooms", "resale", "pool", "gym", "clubhouse",
  "security", "backup", "car_parking", "lift", "vaastu",
] as const;
export type Feature = (typeof FEATURES)[number];
export interface HouseFeatures {
  area: number; bedrooms: number; resale: 0 | 1;
  pool: 0 | 1; gym: 0 | 1; clubhouse: 0 | 1; security: 0 | 1;
  backup: 0 | 1; car_parking: 0 | 1; lift: 0 | 1; vaastu: 0 | 1;
  location: string;
}
export interface CityInfo {
  location: string; city: string; key: string;
  median_price: number; n: number; lat: number; long: number;
}

const L = linearJson as any;
const M = mlpJson as any;
export const cityMap = cityMapJson as unknown as Record<string, CityInfo>;

export const DEFAULT_FEATURES: HouseFeatures = {
  area: 1500, bedrooms: 3, resale: 0,
  pool: 0, gym: 1, clubhouse: 1, security: 1,
  backup: 1, car_parking: 1, lift: 1, vaastu: 0,
  location: "Gachibowli",
};

export const LABELS: Record<string, string> = {
  area: "Carpet area (sq ft)",
  bedrooms: "Bedrooms (BHK)",
  resale: "Resale property",
  pool: "Swimming pool",
  gym: "Gymnasium",
  clubhouse: "Club house",
  security: "24×7 security",
  backup: "Power backup",
  car_parking: "Covered parking",
  lift: "Lift",
  vaastu: "Vaastu-compliant",
  location: "Locality",
};

export function normLoc(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Model key for a locality (must match the dummy column names in linear.json). */
export function locKey(f: HouseFeatures): string {
  const ci = cityMap[f.location];
  return ci?.key ?? "Other";
}

/** Location + feature contribution using the exact linear decomposition: c_i = b_i (x_i - mean_i). */
export function predictLinear(f: HouseFeatures) {
  const names: string[] = L.names;
  const pre: string = L.zip_prefix;
  // Mean-centered intercept = prediction at the training means (= L.intercept + Σ coef_i·mean_i).
  let pred = L.intercept as number;
  FEATURES.forEach((k, i) => {
    pred += (L.coefs[i + 1] as number) * (L.means[i + 1] as number);
  });
  names.forEach((z, i) => {
    if (!z.startsWith(pre)) return;
    pred += (L.coefs[i] as number) * (L.means[i] as number);
  });
  const contrib: Record<string, number> = {};
  FEATURES.forEach((k, i) => {
    const x = f[k] as number;
    const m = L.means[i + 1] as number;
    const c = (L.coefs[i + 1] as number) * (x - m);
    pred += c;
    contrib[k] = c;
  });
  const zi = `${pre}${locKey(f)}`;
  let locSum = 0;
  names.forEach((z, i) => {
    if (!z.startsWith(pre)) return;
    const m = L.means[i] as number;
    const x = z === zi ? 1 : 0;
    locSum += (L.coefs[i] as number) * (x - m);
  });
  pred += locSum;
  contrib.location = locSum;
  return { price: pred * (L.price_scale as number), contrib };
}

/** MLP forward pass (relu hidden layers) — sklearn weights stored as (n_in, n_out). */
export function predictMlp(f: HouseFeatures): number {
  const x = FEATURES.map((k, i) => {
    const v = f[k] as number;
    return (v - (M.means as number[])[i]) / (M.stds as number[])[i];
  });
  let h = x;
  const coefs: number[][][] = M.coefs;
  const intercepts: number[][] = M.intercepts;
  for (let l = 0; l < coefs.length; l++) {
    const W = coefs[l], b = intercepts[l];
    const nOut = W[0].length;
    const raw = Array.from({ length: nOut }, (_, j) =>
      b[j] + h.reduce((s, v, k) => s + v * W[k][j], 0)
    );
    h = l === coefs.length - 1 ? raw : raw.map((v) => Math.max(0, v));
  }
  return h[0] * (M.price_scale as number);
}

export interface BreakdownItem { key: string; label: string; amount: number; }
export function breakdown(f: HouseFeatures): BreakdownItem[] {
  const { contrib } = predictLinear(f);
  return [
    ...FEATURES.map((k) => ({ key: k, label: LABELS[k], amount: contrib[k] })),
    { key: "location", label: LABELS["location"], amount: contrib.location },
  ].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}

/** ₹ formatting: Cr / Lakh / plain, Indian digit grouping. */
export function fmtINR(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return "—";
  const a = Math.abs(v);
  if (a >= 1e7) return `₹${(v / 1e7).toFixed(digits)} Cr`;
  if (a >= 1e5) return `₹${(v / 1e5).toFixed(1)} L`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}
export function fmtNum(v: number) {
  return Math.round(v).toLocaleString("en-IN");
}
export function fmtPerSqft(v: number) {
  if (!Number.isFinite(v)) return "—";
  return `₹${Math.round(v).toLocaleString("en-IN")}/sqft`;
}
