import Link from "next/link";
import { Card, SectionTitle, Stat, Kicker } from "@/components/ui";
import { fmtINR } from "@/lib/predict";
import { IconChart, IconSigma, IconSliders, IconChat, IconPin, IconBrain, IconFile, IconSpark, IconRocket, IconHome, IconTarget, IconTrend, IconReceipt } from "@/components/icons";
import { site } from "@/lib/config";
import statsJson from "@/public/data/stats.json";
import linearJson from "@/lib/models/linear.json";

const L = linearJson as any;
const S = statsJson as any;

const features = [
  { icon: <IconChart className="h-5 w-5" />, title: "Correlation analysis", desc: "Pearson r between price, area, rooms & amenities — with annotated heatmaps.", href: "/correlation" },
  { icon: <IconSigma className="h-5 w-5" />, title: "Multiple regression", desc: "Full equation, coefficients, R², F-test and residuals for 2,518 real listings.", href: "/regression" },
  { icon: <IconSliders className="h-5 w-5" />, title: "Price simulator", desc: "Drag area, BHK and amenities, pick a locality — live ₹ prediction with a confidence band.", href: "/simulator" },
  { icon: <IconChat className="h-5 w-5" />, title: "AI assistant", desc: "Type a query in plain English (“3 BHK, 1800 sq ft in Gachibowli with pool”) — get the price explained in ₹.", href: "/assistant" },
  { icon: <IconPin className="h-5 w-5" />, title: "Interactive map", desc: "46 Hyderabad localities colored by price. Click any listing for details.", href: "/map" },
  { icon: <IconBrain className="h-5 w-5" />, title: "Linear vs neural net", desc: "Classical regression vs an ML model — R² 0.709 vs 0.714 on the same features.", href: "/regression" },
];

const steps = [
  { n: "01", icon: <IconFile className="h-7 w-7" />, title: "Real listing data", desc: "2,518 real Hyderabad listings — area, BHK, amenities and 46 localities." },
  { n: "02", icon: <IconSigma className="h-7 w-7" />, title: "The maths model", desc: "Pearson correlations, then multiple regression over 11 features + 48 localities (R² = 0.775)." },
  { n: "03", icon: <IconSpark className="h-7 w-7" />, title: "AI-powered explainer", desc: "Ask for any home in plain English — the model prices it and the AI explains why." },
];

export default function Home() {
  const holdout = S.holdout as any[];
  return (
    <div className="space-y-14 sm:space-y-16">
      {/* ---------- hero ---------- */}
      <section className="relative pt-6 text-center sm:pt-12">
        <div className="fade-up">
          <Kicker>Mathematics Project · {site.department}</Kicker>
        </div>
        <h1 className="fade-up-1 mx-auto mt-5 max-w-4xl text-[42px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Real Estate Price
          <br />
          <span className="grad-text">Simulator</span>
        </h1>
        <p className="fade-up-2 mx-auto mt-5 max-w-2xl text-[15.5px] leading-relaxed muted">
          {site.subtitle}
        </p>
        <div className="fade-up-3 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/simulator" className="btn-primary btn-lg">
            <IconRocket className="h-4 w-4" /> Start pricing homes
          </Link>
          <Link href="/assistant" className="btn-ghost btn-lg">
            💬 Talk to the AI assistant
          </Link>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<IconHome className="h-4 w-4" />} label="Real listings" value="2,518" sub="Hyderabad, live data" />
          <Stat icon={<IconPin className="h-4 w-4" />} label="Localities" value="49" sub="area dropdowns" />
          <Stat icon={<IconTrend className="h-4 w-4" />} label="Best model R²" value={Number(L.r2_holdout).toFixed(3)} sub="regression + location" />
          <Stat icon={<IconTarget className="h-4 w-4" />} label="Error band" value={fmtINR(L.rmse_holdout)} sub="1 RMSE on holdout" />
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section>
        <div className="mb-8 text-center">
          <Kicker>How it works</Kicker>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            From raw sales to a <span className="grad-text">live prediction</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="panel panel-hover relative p-6">
              <div className="text-[13px] font-bold tracking-[0.3em] text-[var(--muted)]">{s.n}</div>
              <div className="mt-3 text-3xl">{s.icon}</div>
              <h3 className="mt-3 text-[16px] font-bold">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed muted">{s.desc}</p>
              {i < 2 ? (
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-xl text-[var(--accent2)] sm:block">→</div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section>
        <div className="mb-8 text-center">
          <Kicker>Explore the story</Kicker>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Everything the project proves</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link key={f.title} href={f.href} className="group block h-full">
              <Card className="flex h-full flex-col p-lg">
                <div className="grad-ring flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--panel2)] text-[var(--accent1)]">
                  {f.icon}
                </div>
                <h3 className="mt-4 flex items-center gap-2 font-bold">
                  {f.title}
                  <span className="text-[var(--accent2)] opacity-0 transition-opacity group-hover:opacity-100">→</span>
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed muted">{f.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- model comparison ---------- */}
      <section className="grad-ring panel p-6 sm:p-8">
        <h2 className="text-xl font-extrabold tracking-tight">The maths behind the app</h2>
        <p className="mt-1.5 text-[13.5px] muted">Holdout performance on 2,518 Hyderabad listings — more features and locality data win, and the neural net beats plain linear regression on the same inputs.</p>
        <div className="mt-6 space-y-4">
          {holdout.map((m: any, i: number) => (
            <div key={m.name + i} className="flex items-center gap-3 text-[13px]">
              <div className="w-56 shrink-0 truncate text-[var(--text2)] sm:w-72">{m.name}</div>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--panel2)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent1)] to-[var(--accent2)] transition-all duration-700"
                  style={{ width: `${Math.max(6, m.r2 * 100)}%` }}
                />
              </div>
              <div className="w-32 shrink-0 text-right tabular-nums">
                R² {Number(m.r2).toFixed(3)} <span className="muted">· ±{fmtINR(Number(m.rmse))}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section className="grad-ring panel relative overflow-hidden p-10 text-center sm:p-14">
        <IconRocket className="floaty pointer-events-none absolute -right-8 -top-8 h-40 w-40 opacity-[0.06]" strokeWidth={1.2} />
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Your home, <span className="grad-text">priced in seconds</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[14px] muted">
          The same model powers the maths report page, in ₹ — then ask the AI why the price is what it is.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/simulator" className="btn-primary btn-lg">
            <IconRocket className="h-4 w-4" /> Launch the simulator
          </Link>
          <Link href="/report" className="btn-ghost btn-lg">
            📄 View the report
          </Link>
        </div>
      </section>
    </div>
  );
}
