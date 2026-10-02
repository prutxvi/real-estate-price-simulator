import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { ThemeProvider } from "@/components/theme";
import { site } from "@/lib/config";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.subtitle,
};

const footerLinks = [
  { href: "/simulator", label: "Simulator" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/map", label: "Map" },
  { href: "/explore", label: "Explore" },
  { href: "/correlation", label: "Correlation" },
  { href: "/regression", label: "Regression" },
  { href: "/report", label: "Report" },
  { href: "/team", label: "Team" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <Nav />
          <main className="fade-up mx-auto max-w-7xl px-5 pb-16 pt-8 sm:pt-10">{children}</main>
          <footer className="no-print border-t border-[var(--border-soft)] bg-[var(--panel)]/40">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <span className="grad-bg flex h-6 w-6 items-center justify-center rounded-lg text-[11px]">🏠</span>
                  <span className="text-[13px] font-semibold">{site.name}</span>
                </div>
                <p className="mt-1 text-[11.5px] text-[var(--muted)]">
                  {site.student} · {site.college} · {site.department} · {site.year}
                </p>
              </div>
              <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-[var(--muted)]">
                {footerLinks.map((l) => (
                  <a key={l.href} href={l.href} className="transition-colors hover:text-[var(--text)]">
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="border-t border-[var(--border-soft)] py-3 text-center text-[11px] text-[var(--muted)]">
              Built with Next.js · Python · statsmodels · OpenCode Go — Correlation &amp; Multiple Regression, 2,518 real Hyderabad listings
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
