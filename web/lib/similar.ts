import { FEATURES, HouseFeatures } from "./predict";
import linearJson from "./models/linear.json";
import housesJson from "@/public/data/houses.json";

const M = linearJson as any;
const houses = housesJson as any[];

export interface SimilarHouse extends Record<string, any> {
  id: number; price: number; area: number; bedrooms: number; resale: number;
  location: string; lat: number; long: number; distance: number;
}

/** k-NN over normalized numeric features, computed entirely in memory (serverless-safe). */
export function nearestHouses(f: HouseFeatures, k = 10): SimilarHouse[] {
  const means = M.means.slice(1, 1 + FEATURES.length) as number[];
  const stds = M.stds.slice(1, 1 + FEATURES.length) as number[];
  const q = FEATURES.map((kf, i) => ((f[kf] as number) - means[i]) / stds[i]);
  const dist = new Float64Array(houses.length);
  for (let r = 0; r < houses.length; r++) {
    const h = houses[r];
    let d = 0;
    for (let i = 0; i < FEATURES.length; i++) {
      const diff = (h[FEATURES[i]] - means[i]) / stds[i] - q[i];
      d += diff * diff;
    }
    dist[r] = d;
  }
  const idx = Array.from({ length: houses.length }, (_, i) => i).sort((a, b) => dist[a] - dist[b]);
  return idx.slice(0, k).map((i) => ({ ...houses[i], distance: Math.sqrt(dist[i]) }));
}
