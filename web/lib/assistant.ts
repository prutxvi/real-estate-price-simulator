import { cityMap, DEFAULT_FEATURES, HouseFeatures, LABELS, predictLinear, predictMlp, breakdown, fmtINR, fmtNum, normLoc, locKey } from "./predict";
import { llmChat } from "./llm";
import { taxes } from "./config";
import linearJson from "./models/linear.json";

const LINEAR = linearJson as any;
const RMSE_INR = LINEAR.rmse_holdout as number;

export interface ParsedQuery {
  features: HouseFeatures;
  found: string[]; // which fields were detected from text
}

const AREA_RE = /(\d[\d,]*\.?\d*)\s*(?:sq\s*\.?\s*ft|sqft|square\s*feet|sft|sq\s*\.?\s*ft\.?)/i;
const SQM_RE = /(\d[\d,]*\.?\d*)\s*(?:sqm|sq\s*m|square\s*meters?)/i;
const SQYD_RE = /(\d[\d,]*\.?\d*)\s*(?:sq\s*yd|sq\s*yards?|square\s*yards?)/i;
const BED_RE = /(\d)\s*(?:bhk|bedroom|bed\s*rooms?|bed)/i;

const AMEN = [
  ["pool", /(swimming\s*pool|pool|swim)/i],
  ["gym", /(gymnasium|gym|fitness\s*center|workout)/i],
  ["clubhouse", /(club\s*house|clubhouse|community\s*hall|club)/i],
  ["security", /(24\s*[x×]?\s*7\s*security|gated\s*community|security|guarded)/i],
  ["backup", /(power\s*backup|generator|inverter)/i],
  ["car_parking", /(car\s*parking|parking|garage|covered\s*parking)/i],
  ["lift", /(lift|elevator)/i],
  ["vaastu", /(vaastu|vastu)/i],
] as const;

export function parseQuery(text: string): ParsedQuery {
  const t = text.toLowerCase();
  const f: HouseFeatures = { ...DEFAULT_FEATURES };
  const found: string[] = [];

  const mArea = t.match(AREA_RE); const mSqm = t.match(SQM_RE); const mSqyd = t.match(SQYD_RE);
  const sq = mArea || mSqm || mSqyd;
  if (sq) {
    const raw = parseFloat(sq[1].replace(/,/g, ""));
    const area = mArea ? raw : mSqm ? Math.round(raw * 10.7639) : Math.round(raw * 9);
    f.area = Math.max(300, Math.min(15000, Math.round(area)));
    found.push("area");
  }
  const bed = t.match(BED_RE);
  if (bed) { f.bedrooms = Math.max(1, Math.min(8, parseInt(bed[1]))); found.push("bedrooms"); }

  if (/resale|pre[ -]?owned|second[ -]?hand|old\s*(?:house|home|property)|existing\s*house/.test(t)) {
    f.resale = 1; found.push("resale");
  } else if (/new|newly|under[ -]?construction|brand[ -]?new|fresh/.test(t)) {
    f.resale = 0; found.push("resale");
  }

  for (const [key, re] of AMEN) {
    if (re.test(t)) {
      if (!found.includes(key)) found.push(key);
      (f as any)[key] = 1;
    }
  }
  if (/without|no\s*(?:swimming|gym|club|security|backup|parking|lift|vaastu)/i.test(t)) {
    // a negation mostly refers to price-sensitive queries; keep simple: don't force-off
  }

  // locality: longest pretty-name match wins (cityMap keys)
  let best: { key: string; len: number; n: number } | null = null;
  for (const key of Object.keys(cityMap)) {
    const k = key.toLowerCase();
    if (t.includes(k) || t.includes(normLoc(key))) {
      const len = k.length;
      if (!best || len > best.len || (len === best.len && cityMap[key].n > best.n)) {
        best = { key, len, n: cityMap[key].n };
      }
    }
  }
  if (best) { f.location = best.key; found.push("location"); }

  return { features: f, found };
}

function topDrivers(f: HouseFeatures): string {
  const b = breakdown(f).slice(0, 3);
  return b.map((x) => `${x.label} ${x.amount >= 0 ? "+" : ""}${fmtINR(x.amount)}`).join(", ");
}

const TAX_PCT = (taxes.stampDutyPct + taxes.registrationPct);

export function templateNarrative(parsed: ParsedQuery): string {
  const f = parsed.features;
  const lin = predictLinear(f);
  const mlp = predictMlp(f);
  const ci = cityMap[f.location];
  const where = ci ? `${ci.city}` : f.location;
  return (
    `Based on multiple regression over 2,518 real Hyderabad listings, a ${f.bedrooms}-BHK, ` +
    `${fmtNum(f.area)} sq ft home in ${where} is predicted at ` +
    `${fmtINR(lin.price)} (regression with locality, R² = 0.774; the neural-net model says ` +
    `${fmtINR(mlp)}). Biggest price drivers for this home: ${topDrivers(f)}. ` +
    `With stamp duty + registration (≈${TAX_PCT}%, Telangana), the all-in cost would be ` +
    `${fmtINR(lin.price * (1 + TAX_PCT / 100))}. The prediction carries a typical error band of ` +
    `±${fmtINR(RMSE_INR)} (one RMSE).`
  );
}

const SYSTEM_PROMPT = (parsed: ParsedQuery): string => {
  const f = parsed.features;
  const lin = predictLinear(f);
  const mlp = predictMlp(f);
  const ci = cityMap[f.location];
  const where = ci ? `${ci.city}` : f.location;
  const b = breakdown(f);
  const amens = ["pool","gym","clubhouse","security","backup","car_parking","lift","vaastu"]
    .filter((k) => (f as any)[k] === 1).map((k) => LABELS[k]);
  return (
    `You are the explainer for a mathematics project called "Real Estate Price Simulator". ` +
    `The project fits correlation and multiple regression to 2,518 real Hyderabad (Telangana, India) property listings. ` +
    `A user queried a home: ${f.bedrooms} BHK, ${fmtNum(f.area)} sq ft carpet area, ` +
    `resale=${f.resale === 1 ? "yes" : "no (new)"}, amenities: ${amens.length ? amens.join(", ") : "none"}, ` +
    `locality ${where}. ` +
    `Model output: multiple-regression predicted price ${fmtINR(lin.price)} (R²=0.774, RMSE ${fmtINR(RMSE_INR)}); ` +
    `neural-net predicted price ${fmtINR(mlp)} (R²=0.714). Feature contributions: ` +
    b.slice(0, 4).map((x) => `${LABELS[x.key]}: ${x.amount >= 0 ? "+" : ""}${fmtINR(x.amount)}`).join("; ") + `. ` +
    `All prices are in Indian rupees (₹). Write 3-4 friendly sentences explaining this price to a home buyer, ` +
    `using the actual numbers, mentioning the top contributors, and ending with the confidence band ` +
    `(±${fmtINR(RMSE_INR)}). Mention that stamp duty + registration add about ${TAX_PCT}% in Telangana. ` +
    `Do not invent other data.`
  );
};

export async function answerQuery(text: string): Promise<{
  parsed: ParsedQuery;
  narrative: string;
  mode: "engine" | "llm";
}> {
  const parsed = parseQuery(text);
  let narrative: string | null = null;
  try {
    narrative = await llmChat([
      { role: "system", content: SYSTEM_PROMPT(parsed) },
      { role: "user", content: text },
    ]);
  } catch {
    narrative = null;
  }
  return {
    parsed,
    narrative: narrative ?? templateNarrative(parsed),
    mode: narrative ? "llm" : "engine",
  };
}
