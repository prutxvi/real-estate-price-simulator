"use client";
import { useRef, useState } from "react";
import { SectionTitle, Card, Chip } from "@/components/ui";
import { fmtINR } from "@/lib/predict";
import { IconBot, IconUser, IconRocket } from "@/components/icons";

interface Msg {
  role: "user" | "assistant";
  text: string;
  data?: any;
}

const EXAMPLES = [
  "3 BHK, 1800 sq ft in Gachibowli, newly built",
  "2 BHK, 1200 sq ft resale flat in Kukatpally",
  "4 BHK luxury villa, 3500 sq ft, with club house, in Kokapet",
  "3 BHK, 2200 square feet, with gym and 24x7 security, in Madhapur",
];

const FEAT_LABEL: Record<string, string> = {
  area: "Area", bedrooms: "BHK", resale: "Resale", pool: "Pool", gym: "Gym",
  clubhouse: "Club house", security: "Security", backup: "Power backup",
  car_parking: "Parking", lift: "Lift", vaastu: "Vaastu", location: "Locality",
};

export default function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi! Describe any home in plain English — size, rooms, location, extras — and I'll price it using the project's regression model and explain the result.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const d = await res.json();
      setMsgs((m) => [...m, { role: "assistant", text: d.narrative, data: d }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Sorry — I couldn't reach the engine. Try again." }]);
    }
    setBusy(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="AI"
        title="AI Price Assistant"
        desc="Natural language in, explained price out. The engine parses your message, maps localities and amenities, runs the same regression + neural net from the simulator, and explains the numbers. If an OpenCode Go API key is configured, a large language model writes the answer instead of the template."
      />

      <Card className="mx-auto max-w-3xl overflow-hidden">
        <div className="flex h-[62vh] flex-col">
          <div className="border-b border-[var(--border-soft)] bg-[var(--panel2)]/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="grad-bg flex h-9 w-9 items-center justify-center rounded-xl"><IconBot className="h-5 w-5 text-[var(--accent1-ink)]" /></div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold leading-tight">AI Price Assistant</div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent1)]" />
                  {busy ? "thinking…" : "online — parses plain English into model inputs"}
                </div>
              </div>
              <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--muted)]">
                regression + AI
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => (
              <div key={i} className={"flex items-end gap-2 " + (m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" ? (
                  <div className="grad-bg flex h-7 w-7 shrink-0 items-center justify-center rounded-full"><IconBot className="h-4 w-4 text-[var(--accent1-ink)]" /></div>
                ) : null}
                <div
                  className={
                    "max-w-[82%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed " +
                    (m.role === "user"
                      ? "rounded-br-sm bg-gradient-to-r from-emerald-500 to-emerald-400 text-[var(--accent1-ink)]"
                      : "rounded-bl-sm border border-[var(--border)] bg-[var(--panel2)] text-[var(--text2)]")
                  }
                >
                  {m.text}
                  {m.data ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(m.data.parsed.features)
                          .filter(([, v]) => v !== undefined)
                          .map(([k, v]) => (
                            <Chip key={k} tone={m.data.parsed.found.includes(k) ? "emerald" : "slate"}>
                              {FEAT_LABEL[k] ?? k}: {String(v)}{m.data.parsed.found.includes(k) ? " ✓" : ""}
                            </Chip>
                          ))}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[12px]">
                        <div className="rounded-xl border border-emerald-400/30 bg-[var(--accent1)]/10 px-3 py-2">
                          Regression: <b className="text-[var(--accent1)]">{fmtINR(m.data.parsed.priceLinear)}</b>
                        </div>
                        <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2">
                          Neural net: <b className="text-[var(--accent2)]">{fmtINR(m.data.parsed.priceMlp)}</b>
                        </div>
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel2)] px-3 py-2 muted">
                          {m.data.mode === "llm" ? "✨ LLM-enhanced answer" : "⚙️ Offline engine answer"}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {m.role === "user" ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--panel2)] text-[var(--muted)]"><IconUser className="h-4 w-4" /></div>
                ) : null}
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 pl-9 text-[12px] text-[var(--muted)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent1)]" /> thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => send(e)}
                className="rounded-full border border-[var(--border)] bg-[var(--panel2)] px-3 py-1 text-[11px] text-[var(--text2)] transition hover:border-emerald-400/40 hover:text-[var(--text)]"
              >
                {e}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder='e.g. "3 BHK, 1800 sq ft near the lake, max 15 years old"'
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--panel2)] px-4 py-2.5 text-[13.5px] text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent1)]/50"
            />
            <button
              onClick={() => send(input)}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-[var(--accent1)] to-[var(--accent2)] px-5 py-2.5 text-sm font-bold text-[var(--accent1-ink)] transition hover:opacity-90 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
