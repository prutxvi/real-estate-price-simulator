"use client";
import { useEffect, useState } from "react";
import { SectionTitle, Card } from "@/components/ui";
import { site } from "@/lib/config";

export default function Report() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  if (!data) return <div className="muted">Loading…</div>;
  const { coefTable, stats, lin10, models } = data;
  const rows = coefTable.filter((r: any) => r.term !== "const");

  return (
    <div className="space-y-6">
      <div className="no-print">
        <SectionTitle
          kicker="Submission"
          title="Project report"
          desc="The full written report for submission. Charts below are rendered server-side quality — use the print button and “Save as PDF” for the hard copy."
        />
        <button onClick={() => window.print()} className="rounded-xl bg-gradient-to-r from-[var(--accent1)] to-[var(--accent2)] px-5 py-2.5 text-sm font-bold text-[var(--accent1-ink)]">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div className="space-y-5 print:text-[var(--accent1-ink)]">
        <Card>
          <h1 className="text-3xl font-extrabold text-[var(--text)] print:text-[var(--accent1-ink)]">{site.name}</h1>
          <p className="mt-1 text-[14px] muted">
            Area, location, rooms and price — correlation &amp; multiple regression
          </p>
          <p className="mt-4 text-[12.5px]">
            <b>{site.student}</b> · Reg. no: {site.regNo} · {site.college} · {site.department} · {site.year}
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold text-[var(--text)] print:text-[var(--accent1-ink)]">1. Abstract</h2>
          <p className="text-[13px] leading-relaxed muted print:text-gray-700">
            This project investigates how house prices depend on area, rooms and location, using 2,518 real Hyderabad
            (Telangana, India) property listings. We compute Pearson correlations, fit multiple linear regression models,
            and compare them with a neural-network model. Carpet area is the strongest single driver (r = 0.829), but
            locality proves decisive overall: adding 48 locality dummy variables raises R² from 0.709 to 0.775.
            The fitted models are deployed as an interactive web application — the Real Estate Price Simulator — with
            an AI assistant that answers natural-language pricing queries in Indian rupees.
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold text-[var(--text)] print:text-[var(--accent1-ink)]">2. Data</h2>
          <p className="text-[13px] leading-relaxed muted print:text-gray-700">
            2,518 residential property listings in Hyderabad (asking prices from public listing sites). Fields:
            price, carpet area, bedrooms (BHK), new/resale, 9 amenity flags and locality. Price range ₹20 L – ₹16.5 Cr;
            median ₹77.5 L. 49 localities (48 named + other areas).
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold text-[var(--text)] print:text-[var(--accent1-ink)]">3. Correlation analysis</h2>
          <img src="/figures/corr_heatmap.png" alt="Correlation heatmap" className="mx-auto max-h-[420px] rounded-xl border border-[var(--border)]" />
          <p className="mt-3 text-[13px] leading-relaxed muted print:text-gray-700">
            Carpet area (r = 0.829) is by far the strongest correlate of price; bedrooms follow at r = 0.614.
            Amenities (swimming pool r = 0.294, gymnasium r = 0.269, club house r = 0.250) are real but modest
            on their own — motivating multiple regression, which controls for several variables at once.
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold text-[var(--text)] print:text-[var(--accent1-ink)]">4. Multiple regression</h2>
          <p className="text-[13px] leading-relaxed muted print:text-gray-700">
            Model: price = β₀ + Σ βⱼ xⱼ + Σ γ_l·1(locality = l), fitted by ordinary least squares .
            R² = {lin10.r2.toFixed(3)} → {models.linearZip.r2.toFixed(3)} with locality; adjusted R² = {lin10.adj_r2.toFixed(3)};
            F-statistic {(lin10.fvalue as number).toFixed(1)}, p &lt; 0.0001.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wider muted">
                  <th className="pb-2 pr-4">Variable</th>
                  <th className="pb-2 pr-4 text-right">β</th>
                  <th className="pb-2 text-right">p-value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.term} className="border-b border-[var(--border-soft)]">
                    <td className="py-1.5 pr-4 font-mono">{r.term}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{Math.round(r.coef * 1e6).toLocaleString("en-IN")}</td>
                    <td className="py-1.5 text-right tabular-nums">{Number(r.pvalue).toExponential(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold text-[var(--text)] print:text-[var(--accent1-ink)]">5. Results</h2>
          <img src="/figures/residuals.png" alt="Residual diagnostics" className="mx-auto max-h-[340px] rounded-xl border border-[var(--border)]" />
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed muted print:text-gray-700">
            <li>Simple regression (area): R² = 0.693, RMSE = ₹43.99 L.</li>
            <li>Multiple regression (11 features): R² = 0.709, RMSE = ₹42.86 L.</li>
            <li>Multiple regression + 48 localities: R² = 0.775, RMSE = ₹37.68 L.</li>
            <li>Neural net (same 11 features, holdout): R² = 0.714, RMSE = ₹42.46 L — beats plain linear but loses to linear-with-location.</li>
            <li>Conclusion: locality is the dominant price driver; multiple regression with categorical location variables gives the best interpretable model.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold text-[var(--text)] print:text-[var(--accent1-ink)]">6. The application</h2>
          <img src="/figures/scatter_top3.png" alt="Scatter plots" className="mx-auto max-h-[300px] rounded-xl border border-[var(--border)]" />
          <p className="mt-3 text-[13px] leading-relaxed muted print:text-gray-700">
            The fitted models power a Next.js web app: an interactive simulator (sliders + location → live predicted
            price with confidence band and per-feature contribution breakdown), a k-NN “similar sales” benchmark,
            an AI assistant built on the OpenCode Go language API, an on-road cost card (stamp duty + registration),
            and an interactive map of all 2,518 listings.
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold text-[var(--text)] print:text-[var(--accent1-ink)]">7. References &amp; tools</h2>
          <p className="text-[12.5px] leading-relaxed muted print:text-gray-700">
            Dataset: Hyderabad residential listings (public listing-site scrape). Analysis: Python, pandas, NumPy, SciPy, statsmodels, scikit-learn, Jupyter.
            App: Next.js, TypeScript, Tailwind CSS, Recharts, React-Leaflet, Vercel. LLM: OpenCode Go.
          </p>
        </Card>
      </div>
    </div>
  );
}
