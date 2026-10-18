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

function girlVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = 0;
  for (const voice of english) {
    const name = voice.name.toLowerCase();
    let score = 1;
    if (name.includes("child") || name.includes("girl") || name.includes("kid")) score += 6;
    if (name.includes("female") || name.includes("woman")) score += 3;
    if (/samantha|victoria|karen|moira|fiona|tessa|serena|zira|aria|jenny|libby|sonia|hazel|susan/.test(name)) {
      score += 2;
    }
    if (name.includes("male") || /david|daniel|alex|fred|rishi|guy/.test(name)) score -= 5;
    if (voice.lang === "en-US" || voice.lang === "en_US") score += 1;
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
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
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 1.45;
    const voice = girlVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
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
