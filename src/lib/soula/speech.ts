type SpeechResult = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type Listener = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechResult) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

function recognitionCtor(): (new () => Listener) | null {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: new () => Listener;
    webkitSpeechRecognition?: new () => Listener;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

export function canListen() {
  return recognitionCtor() !== null;
}

function voiceStyle() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { voice: null as SpeechSynthesisVoice | null, rate: 0.92, pitch: 1.08 };
  }
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = 0;
  for (const voice of voices) {
    const name = voice.name.toLowerCase();
    let score = 1;
    if (/natural|neural|premium|enhanced/.test(name)) score += 8;
    if (/\bana\b|child|girl|kid/.test(name)) score += 4;
    if (name.includes("female") || name.includes("woman")) score += 3;
    if (/samantha|victoria|karen|moira|fiona|tessa|serena|zira|aria|jenny|libby|sonia|hazel/.test(name)) score += 2;
    if (name.includes("male") || /\bdavid\b|\bdaniel\b|\balex\b|\bfred\b|\brishi\b/.test(name)) score -= 6;
    if (voice.localService) score += 1;
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  const name = best?.name.toLowerCase() ?? "";
  const natural = /natural|neural|premium|enhanced|\bana\b|child|girl/.test(name);
  return {
    voice: best,
    rate: 0.92,
    pitch: natural ? 1.04 : 1.12,
  };
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const english = text
    .split(/\n+/)
    .map((line) => line.trim())
    .find((line) => /[A-Za-z]/.test(line));
  const line = (english ?? text).slice(0, 180);
  const say = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(line);
    const style = voiceStyle();
    utterance.lang = style.voice?.lang || "en-US";
    utterance.rate = style.rate;
    utterance.pitch = style.pitch;
    if (style.voice) utterance.voice = style.voice;
    window.speechSynthesis.speak(utterance);
  };
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", say, { once: true });
    return;
  }
  say();
}

export function listenOnce(): Promise<string> {
  const Ctor = recognitionCtor();
  if (!Ctor) return Promise.reject(new Error("no-mic"));
  return new Promise((resolve, reject) => {
    const rec = new Ctor();
    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      if (value && value.trim()) resolve(value.trim());
      else reject(new Error("empty"));
    };
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => finish(event.results[0]?.[0]?.transcript ?? "");
    rec.onerror = () => finish(null);
    rec.onend = () => finish(null);
    rec.start();
  });
}

export function heardWord(expected: string, heard: string) {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const target = normalize(expected);
  const said = normalize(heard);
  return said === target || said.includes(target);
}
