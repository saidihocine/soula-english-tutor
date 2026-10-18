import { createServerFn } from "@tanstack/react-start";
import { assertLoopbackBase } from "@/lib/soula/lm-url";

type ChatMessage = { role: string; content: string };

export type LmProxyResult = { ok: true; text: string } | { ok: false; error: string };

const ROLES = new Set(["system", "user", "assistant"]);

function cleanMessages(input: ChatMessage[]): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 16) return null;
  const messages: ChatMessage[] = [];
  for (const message of input) {
    if (!message || !ROLES.has(message.role) || typeof message.content !== "string") return null;
    const limit = message.role === "system" ? 6000 : 800;
    if (message.content.length === 0 || message.content.length > limit) return null;
    messages.push({ role: message.role, content: message.content });
  }
  return messages;
}

async function readModelId(base: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(`${base}/models`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(String(response.status));
  const data = (await response.json()) as { data?: { id?: string }[] };
  const id = data.data?.[0]?.id;
  return typeof id === "string" && id.trim() ? id.trim() : "qwen2.5-7b-instruct";
}

export const proxyLm = createServerFn({ method: "POST" })
  .validator((data: { baseUrl?: string; model?: string; messages?: ChatMessage[]; ping?: boolean }) => data)
  .handler(async ({ data }): Promise<LmProxyResult> => {
    let base = "";
    try {
      base = assertLoopbackBase(data?.baseUrl ?? "");
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "عنوان غير صالح." };
    }

    try {
      if (data?.ping) {
        const id = await readModelId(base, AbortSignal.timeout(4000));
        return { ok: true, text: id };
      }

      const messages = cleanMessages(data?.messages ?? []);
      if (!messages) return { ok: false, error: "الرسالة طويلة أو غير مكتملة." };

      const hinted = typeof data?.model === "string" ? data.model.trim().slice(0, 120) : "";
      const model = hinted || (await readModelId(base, AbortSignal.timeout(4000)));
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
      if (!response.ok) return { ok: false, error: `LM Studio ردّ برمز ${response.status}.` };
      const payload = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = payload.choices?.[0]?.message?.content?.trim();
      if (!text) return { ok: false, error: "النموذج ما رجّع جواباً." };
      return { ok: true, text };
    } catch {
      return {
        ok: false,
        error: "ما لقيت LM Studio على هذا الجهاز. شغّل الخادم المحلي على المنفذ 1234.",
      };
    }
  });
