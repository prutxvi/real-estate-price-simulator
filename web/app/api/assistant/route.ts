import { NextResponse } from "next/server";
import { answerQuery } from "@/lib/assistant";
import { predictLinear, predictMlp, cityMap } from "@/lib/predict";

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const message: string = String(body?.message || "").slice(0, 500);
  if (!message.trim()) return NextResponse.json({ error: "empty message" }, { status: 400 });
  const { parsed, narrative, mode } = await answerQuery(message);
  const lin = predictLinear(parsed.features);
  const mlp = predictMlp(parsed.features);
  const locInfo = cityMap[parsed.features.location];
  return NextResponse.json({
    narrative, mode,
    parsed: {
      features: parsed.features,
      found: parsed.found,
      location: locInfo ? locInfo.city : parsed.features.location,
      priceLinear: Math.round(lin.price),
      priceMlp: Math.round(mlp),
    },
  });
}
