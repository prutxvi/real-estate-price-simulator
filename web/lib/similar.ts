import fs from "fs";
import path from "path";
import { FEATURES, HouseFeatures } from "./predict";
import linearJson from "./models/linear.json";
import metaJson from "../public/data/norm_matrix.meta.json";

const M = linearJson as any;
const NF = (metaJson as any).n_features as number;

let cache: { mat: Float32Array; houses: any[] } | null = null;
function load() {
  if (cache) return cache;
  const base = process.cwd();
  const b64 = fs.readFileSync(path.join(base, "public/data/norm_matrix.b64"), "utf8");
  const buf = Buffer.from(b64, "base64");
  const mat = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
  const houses = JSON.parse(fs.readFileSync(path.join(base, "public/data/houses.json"), "utf8"));
  cache = { mat, houses };
  return cache;
}

export interface SimilarHouse extends Record<string, any> {
  id: number; price: number; area: number; bedrooms: number; resale: number;
  location: string; lat: number; long: number; distance: number;
}

export function nearestHouses(f: HouseFeatures, k = 10): SimilarHouse[] {
  const { mat, houses } = load();
  const means = M.means.slice(1, 1 + NF) as number[];
  const stds = M.stds.slice(1, 1 + NF) as number[];
  const q = FEATURES.map((kf, i) => ((f[kf] as number) - means[i]) / stds[i]);
  const dist = new Float32Array(houses.length);
  for (let r = 0; r < houses.length; r++) {
    let d = 0;
    for (let c = 0; c < NF; c++) {
      const diff = mat[r * NF + c] - q[c];
      d += diff * diff;
    }
    dist[r] = d;
  }
  const idx = Array.from({ length: houses.length }, (_, i) => i);
  idx.sort((a, b) => dist[a] - dist[b]);
  return idx.slice(0, k).map((i) => ({
    ...houses[i],
    distance: Math.sqrt(dist[i]),
  }));
}
