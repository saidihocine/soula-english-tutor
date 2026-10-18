import { extraWords, lessonById, lessons, type Word } from "@/lib/soula/lessons";

export type TutorContext = {
  name: string;
  lessonId?: string | null;
};

type Entry = {
  en: string;
  ar: string;
  say?: string;
  example: string;
};

const byEn = new Map<string, Entry>();
const byAr = new Map<string, Entry>();

function normEn(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normAr(value: string) {
  return value
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\u0600-\u06FF\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function add(entry: Entry, aliases?: string[]) {
  byEn.set(normEn(entry.en), entry);
  byAr.set(normAr(entry.ar), entry);
  for (const alias of aliases ?? []) {
    const key = normAr(alias);
    if (key) byAr.set(key, entry);
  }
}

for (const lesson of lessons) {
  for (const word of lesson.words) add(word, word.aliases);
}
for (const word of extraWords) add(word as Word, word.aliases);

function lookup(query: string): Entry | undefined {
  const english = normEn(query);
  if (english && byEn.has(english)) return byEn.get(english);
  let arabic = normAr(query);
  if (arabic && byAr.has(arabic)) return byAr.get(arabic);
  if (arabic.startsWith("ال")) {
    const stripped = arabic.slice(2).trim();
    if (byAr.has(stripped)) return byAr.get(stripped);
  }
  return undefined;
}

function cleanQuery(value: string) {
  return value.replace(/[؟?.!,،]/g, " ").replace(/\s+/g, " ").trim();
}

function teach(entry: Entry) {
  const say = entry.say ? ` نقولها: ${entry.say}.` : "";
  return `"${entry.en}" يعني ${entry.ar}.${say} جرّب: ${entry.example}`;
}

function followUp(lessonId?: string | null) {
  switch (lessonId) {
    case "colors":
      return "What color do you like?";
    case "animals":
      return "What animal do you like?";
    case "family":
      return "Who is in your family?";
    case "food":
      return "What food do you like?";
    case "school":
      return "What is in your bag?";
    case "feelings":
      return "How are you today?";
    case "numbers":
      return "How old are you?";
    default:
      return "How are you today?";
  }
}

function modelSentence(lessonId?: string | null) {
  return lessonById(lessonId)?.words[0]?.example ?? "Hello, I am happy.";
}

function cap(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function tutorReply(raw: string, ctx: TutorContext): string {
  const text = raw.replace(/\s+/g, " ").trim().slice(0, 400);
  const name = ctx.name.trim() || "friend";
  if (!text) return "اكتب كلمة أو جملة صغيرة.";

  const howAr = text.match(/كيف\s+(?:أقول|اقول|نقول)\s+(.+)$/);
  if (howAr?.[1]) return answerLookup(cleanQuery(howAr[1]), name);

  const howEn = text.match(/how do (?:you|i) say\s+(.+?)\s*\??$/i);
  if (howEn?.[1]) return answerLookup(cleanQuery(howEn[1]), name);

  const meanEn = text.match(/what does\s+(.+?)\s+mean\s*\??$/i);
  if (meanEn?.[1]) return answerLookup(cleanQuery(meanEn[1]), name);

  const meanAr = text.match(/(?:ما\s+معنى|ماذا تعني|ماذا يعني|معنى)\s+(.+)$/);
  if (meanAr?.[1]) return answerLookup(cleanQuery(meanAr[1]), name);

  if (/what is your name|who are you/i.test(text)) {
    return `My name is Soula. I am your English teacher. What is your name?`;
  }

  if (/how are you/i.test(text)) {
    return `I am good, thank you, ${name}. How are you?`;
  }

  if (/^(hi|hello|hey|good morning)\b[.! ]*$/i.test(text) || /^(مرحبا|اهلا|أهلا|السلام)/.test(text)) {
    return `Hello, ${name}! I am Soula. How are you?`;
  }

  if (/^(goodbye|bye)\b/i.test(text) || text.includes("مع السلامة")) {
    return `Goodbye, ${name}. See you soon.`;
  }

  if (/thank you|thanks/i.test(text) || /شكر/.test(normAr(text))) {
    return `You are welcome, ${name}. Say: "Thank you."`;
  }

  const age = text.match(/^i am (\d+|six|seven|eight|nine|ten|eleven|twelve)\b/i);
  if (age?.[1]) {
    return `Nice, ${name}. Say: "I am ${age[1]}." How are you today?`;
  }

  const feel = text.match(/^i am (happy|sad|tired|hungry|thirsty|brave)\b/i);
  if (feel?.[1]) return feelingReply(feel[1].toLowerCase(), name);

  const like = text.match(/^i like\s+(.+?)\s*[.!?]?$/i);
  if (like?.[1]) {
    const thing = cleanQuery(like[1]);
    const entry = lookup(thing);
    if (entry) return `Nice. I like ${entry.en} too. "${entry.en}" يعني ${entry.ar}. What else do you like?`;
    return `Nice, ${name}. Say: "I like ${thing}." What else do you like?`;
  }

  const going = text.match(/^i am go to (.+)$/i);
  if (going?.[1]) {
    return `محاولة حلوة يا ${name}. قولها كذا: "I am going to ${cleanQuery(going[1])}." بعد am نقول going.`;
  }

  const verb = text.match(/^(he|she|it)\s+(go|eat|like|play|want|read)\b(.*)$/i);
  if (verb?.[1] && verb[2]) {
    const rest = (verb[3] ?? "").replace(/\s+/g, " ").trim();
    const better = `${cap(verb[1].toLowerCase())} ${verb[2].toLowerCase()}s${rest ? ` ${rest}` : ""}.`;
    return `قريبة يا ${name}. قول: "${better}" مع ${verb[1].toLowerCase()} نزيد s على الفعل.`;
  }

  if (/^i has\b/i.test(text)) {
    return `قريبة. مع I نقول have. قول: "${text.replace(/^i has/i, "I have")}."`;
  }

  if (/^i (are|is)\b/i.test(text)) {
    return `مع I نقول am. جرّب: "I am happy."`;
  }

  const known = lookup(text);
  if (known && normEn(text).split(" ").length <= 3) return teach(known);

  const latin = text.match(/[A-Za-z]/g)?.length ?? 0;
  const arabic = text.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  const words = normEn(text).split(" ").filter(Boolean);

  if (latin > arabic && words.length >= 2) {
    return `Nice, ${name}! I heard you. ${followUp(ctx.lessonId)}`;
  }

  if (arabic > 0) {
    const knownInside = findInsideArabic(text);
    if (knownInside) {
      return `لقيت كلمة. ${teach(knownInside)} قُلها بصوت عالٍ.`;
    }
    return `حاضر يا ${name}. نجرب جملة إنجليزية: "${modelSentence(ctx.lessonId)}" أو اسأل: كيف أقول قطة؟`;
  }

  return `لم أفهم جيداً. جرّب: Hello, I am ${name}. أو اسأل: كيف أقول ماء؟`;
}

function answerLookup(query: string, name: string) {
  const entry = lookup(query);
  if (!entry) {
    return `ما لقيتها في الدفتر يا ${name}. جرّب كلمة من الدروس، مثل: قطة، ماء، مدرسة.`;
  }
  return teach(entry);
}

function feelingReply(word: string, name: string) {
  switch (word) {
    case "sad":
      return `أنا معك يا ${name}. قول: "I am sad." تريد كلمة فرح؟ happy يعني سعيد.`;
    case "tired":
      return `ارتَح قليلاً يا ${name}. قول: "I am tired."`;
    case "hungry":
      return `قول: "I am hungry." What food do you like?`;
    case "thirsty":
      return `قول: "I am thirsty." Water, please.`;
    case "brave":
      return `نعم يا ${name}. You are brave. قول: "I am brave."`;
    default:
      return `Nice, ${name}! I am happy too. Why are you happy?`;
  }
}

function findInsideArabic(text: string): Entry | undefined {
  const normalized = normAr(text);
  const parts = normalized.split(" ").filter((part) => part.length > 1);
  for (const part of parts) {
    const hit = lookup(part);
    if (hit) return hit;
  }
  return undefined;
}
