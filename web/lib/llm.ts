import { llm } from "./config";

const OPENCODE_SESSION = "45f1c9a2-7b3e-4d88-9c6a-simulator-2025";

export interface ChatMsg { role: "system" | "user" | "assistant"; content: string; }

/** Call OpenCode Go (OpenAI-compatible). Returns null when key/mode unavailable so the app never breaks. */
export async function llmChat(messages: ChatMsg[]): Promise<string | null> {
  if (!llm.apiKey) return null;
  try {
    const res = await fetch(`${llm.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${llm.apiKey}`,
        "User-Agent": "real-estate-price-simulator/1.0 (maths-project)",
        "x-opencode-session": OPENCODE_SESSION,
      },
      body: JSON.stringify({
        model: llm.model,
        messages,
        temperature: 0.4,
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    // Some reasoning models stream the final answer into reasoning_content with empty content.
    const content: string = msg?.content?.trim() || msg?.reasoning_content?.trim() || "";
    return content || null;
  } catch {
    return null;
  }
}
