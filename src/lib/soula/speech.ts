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

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const english = text
    .split(/\n+/)
    .map((line) => line.trim())
    .find((line) => /[A-Za-z]/.test(line));
  const line = (english ?? text).slice(0, 180);
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
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
