export const DEFAULT_LM_BASE = "http://127.0.0.1:1234/v1";

export function normalizeLmBase(input: string): string {
  let raw = input.trim();
  if (!raw) return DEFAULT_LM_BASE;
  if (!/^https?:\/\//i.test(raw)) raw = `http://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return DEFAULT_LM_BASE;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return DEFAULT_LM_BASE;
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  let path = url.pathname.replace(/\/+$/, "");
  if (!path || path === "/") path = "/v1";
  else if (!/\/v1$/i.test(path)) path = `${path}/v1`;
  url.pathname = path;
  return url.toString().replace(/\/$/, "");
}

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1"]);

export function assertLoopbackBase(input: string): string {
  const base = normalizeLmBase(input);
  const host = new URL(base).hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!LOOPBACK.has(host)) {
    throw new Error("الممر الداخلي يسمح فقط بـ localhost على نفس الجهاز.");
  }
  return base;
}
