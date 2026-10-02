import { NextResponse } from "next/server";
import { DEFAULT_FEATURES, HouseFeatures, predictLinear, predictMlp, breakdown } from "@/lib/predict";
import linearJson from "@/lib/models/linear.json";
import mlpJson from "@/lib/models/mlp.json";

const L = linearJson as any;
const M = mlpJson as any;

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const f: HouseFeatures = { ...DEFAULT_FEATURES, ...(body.features || {}) };
  const lin = predictLinear(f);
  const mlp = predictMlp(f);
  const rmse = L.rmse_holdout as number;
  return NextResponse.json({
    linear: { price: Math.round(lin.price), rmse: Math.round(rmse), r2: L.r2_holdout, band: [Math.round(lin.price - rmse), Math.round(lin.price + rmse)] },
    mlp: { price: Math.round(mlp), rmse: Math.round(M.rmse_holdout), r2: M.r2_holdout, band: [Math.round(mlp - M.rmse_holdout), Math.round(mlp + M.rmse_holdout)] },
    breakdown: breakdown(f),
  });
}
