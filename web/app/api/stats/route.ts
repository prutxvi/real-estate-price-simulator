import { NextResponse } from "next/server";
import statsJson from "@/public/data/stats.json";
import residualsJson from "@/public/data/residuals.json";
import cityMapJson from "@/lib/data/city_map.json";
import linearJson from "@/lib/models/linear.json";
import mlpJson from "@/lib/models/mlp.json";

const L = linearJson as any;
const M = mlpJson as any;
const cm = cityMapJson as any;

export async function GET() {
  const zipList = Object.values(cm)
    .map((z: any) => z)
    .sort((a: any, b: any) => b.n - a.n);
  const lin10 = Object.fromEntries(
    Object.entries(L.lin10.params as Record<string, number>).map(([k, v]) => [k, Number(v)])
  );
  const pvals = Object.fromEntries(
    Object.entries(L.lin10.pvalues as Record<string, number>).map(([k, v]) => [k, Number(v)])
  );
  const coefTable = ["const", ...L.features].map((k: string) => ({
    term: k,
    coef: lin10[k] ?? 0,
    pvalue: pvals[k] ?? 0,
  }));
  return NextResponse.json({
    stats: statsJson,
    residuals: residualsJson,
    zipList,
    coefTable,
    lin10: { fvalue: L.lin10.fvalue, f_pvalue: L.lin10.f_pvalue, adj_r2: L.lin10.adj_r2, r2: L.lin10.r2, nobs: L.lin10.nobs },
    models: {
      linearZip: { r2: L.r2_holdout, rmse: L.rmse_holdout, r2Train: L.r2_train },
      mlp: { r2: M.r2_holdout, rmse: M.rmse_holdout },
    },
  });
}
