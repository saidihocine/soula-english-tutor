import { proxyLm } from "@/lib/soula/lm-proxy";
import { normalizeLmBase } from "@/lib/soula/lm-url";
import { SOULA_SYSTEM_PROMPT, soulaContext } from "@/lib/soula/prompt";

export type StudioTurn = { role: "user" | "assistant"; content: string };

async function probeDirect(base: string): Promise<string | null> {
  try {
    const response = await fetch(`${base}/models`, {
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { data?: { id?: string }[] };
    const id = data.data?.[0]?.id;
    return typeof id === "string" ? id : "";
  } catch {
    return null;
  }
}

async function chatDirect(base: string, model: string, messages: { role: string; content: string }[]) {
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 220,
    }),
  });
  if (!response.ok) throw new Error(String(response.status));
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("empty");
  return text;
}

export async function testStudio(baseUrl: string): Promise<{ ok: boolean; detail: string }> {
  const base = normalizeLmBase(baseUrl);
  const direct = await probeDirect(base);
  if (direct !== null) {
    return { ok: true, detail: direct ? `متصل من المتصفح. النموذج: ${direct}` : "متصل من المتصفح." };
  }
  const proxied = await proxyLm({ data: { baseUrl: base, ping: true, messages: [] } });
  if (proxied.ok) return { ok: true, detail: `متصل عبر التطبيق على هذا الجهاز. النموذج: ${proxied.text}` };
  return { ok: false, detail: proxied.error };
}

export async function askStudio(options: {
  baseUrl: string;
  model: string;
  turns: StudioTurn[];
  name: string;
  lesson?: string;
}): Promise<string> {
  const base = normalizeLmBase(options.baseUrl);
  const messages = [
    { role: "system", content: `${SOULA_SYSTEM_PROMPT}\n\n${soulaContext(options.name, options.lesson)}` },
    ...options.turns.slice(-12),
  ];
  const hinted = options.model.trim();
  const direct = await probeDirect(base);
  if (direct !== null) {
    return chatDirect(base, hinted || direct || "qwen2.5-7b-instruct", messages);
  }
  const proxied = await proxyLm({
    data: { baseUrl: base, model: hinted, messages, ping: false },
  });
  if (!proxied.ok) throw new Error(proxied.error);
  return proxied.text;
}
