export type Word = {
  id: string;
  en: string;
  ar: string;
  say: string;
  example: string;
  aliases?: string[];
};

export type Lesson = {
  id: string;
  ar: string;
  en: string;
  blurb: string;
  words: Word[];
};

function w(
  lessonId: string,
  en: string,
  ar: string,
  say: string,
  example: string,
  aliases?: string[],
): Word {
  return { id: `${lessonId}:${en}`, en, ar, say, example, aliases };
}

export const lessons: Lesson[] = [
  {
    id: "hello",
    ar: "التحيات",
    en: "Hello",
    blurb: "نسلّم ونقول اسمنا.",
    words: [
      w("hello", "hello", "مرحبا", "هَلو", "Hello! I am Sam."),
      w("hello", "goodbye", "مع السلامة", "غود باي", "Goodbye. See you."),
      w("hello", "please", "من فضلك", "بليز", "Water, please."),
      w("hello", "thank you", "شكرا", "ثانك يو", "Thank you, Soula.", ["شكراً", "شكرا لك"]),
      w("hello", "sorry", "آسف", "سوري", "Sorry, I am late.", ["آسفة", "اسف"]),
      w("hello", "friend", "صديق", "فرِند", "You are my friend.", ["صديقة", "أصدقاء"]),
    ],
  },
  {
    id: "colors",
    ar: "الألوان",
    en: "Colors",
    blurb: "نسمّي اللون الذي نراه.",
    words: [
      w("colors", "red", "أحمر", "رِد", "The apple is red."),
      w("colors", "blue", "أزرق", "بلو", "The sky is blue."),
      w("colors", "green", "أخضر", "غرين", "The leaf is green."),
      w("colors", "yellow", "أصفر", "يَلو", "The sun is yellow."),
      w("colors", "black", "أسود", "بلاك", "The cat is black."),
      w("colors", "white", "أبيض", "وايت", "The milk is white."),
    ],
  },
  {
    id: "numbers",
    ar: "الأرقام",
    en: "Numbers",
    blurb: "من واحد إلى عشرة، وبسنّك أيضاً.",
    words: [
      w("numbers", "one", "واحد", "وَن", "I have one pen."),
      w("numbers", "two", "اثنان", "تو", "Two cats.", ["اثنين", "اثنتان"]),
      w("numbers", "three", "ثلاثة", "ثري", "Three books."),
      w("numbers", "five", "خمسة", "فايف", "Five fingers."),
      w("numbers", "seven", "سبعة", "سِفن", "I am seven."),
      w("numbers", "ten", "عشرة", "تِن", "Ten stars.", ["عشر"]),
    ],
  },
  {
    id: "animals",
    ar: "الحيوانات",
    en: "Animals",
    blurb: "حيوانات نحبها ونصفها.",
    words: [
      w("animals", "cat", "قطة", "كات", "The cat is small.", ["قطه", "قط", "قطط", "القطة"]),
      w("animals", "dog", "كلب", "دوغ", "The dog is big.", ["كلاب", "الكلب"]),
      w("animals", "bird", "طائر", "بِرد", "The bird can fly.", ["عصفور", "طير"]),
      w("animals", "fish", "سمكة", "فِش", "The fish is quiet.", ["سمك", "السمكة"]),
      w("animals", "horse", "حصان", "هورس", "The horse runs.", ["حصان"]),
      w("animals", "rabbit", "أرنب", "رابِت", "The rabbit is soft.", ["ارنب"]),
    ],
  },
  {
    id: "family",
    ar: "العائلة",
    en: "Family",
    blurb: "نعرّف من في البيت.",
    words: [
      w("family", "mother", "أم", "مَذَر", "This is my mother.", ["أمي", "ماما", "والدة"]),
      w("family", "father", "أب", "فاذر", "This is my father.", ["أبي", "بابا", "والد"]),
      w("family", "sister", "أخت", "سِستر", "My sister is kind.", ["أختي"]),
      w("family", "brother", "أخ", "براذر", "My brother is tall.", ["أخي"]),
      w("family", "grandmother", "جدة", "غراندماذر", "My grandmother smiles.", ["جدتي", "ستّي"]),
      w("family", "family", "عائلة", "فامِلي", "I love my family.", ["عيلة", "أسرة"]),
    ],
  },
  {
    id: "food",
    ar: "الطعام",
    en: "Food",
    blurb: "نقول ماذا نحب أن نأكل.",
    words: [
      w("food", "apple", "تفاحة", "آبُل", "I eat an apple.", ["تفاح", "تفاحه"]),
      w("food", "bread", "خبز", "برِد", "I like bread."),
      w("food", "water", "ماء", "ووتر", "I drink water.", ["موية", "المي"]),
      w("food", "milk", "حليب", "مِلك", "I drink milk."),
      w("food", "rice", "أرز", "رايس", "We eat rice.", ["رز"]),
      w("food", "banana", "موزة", "بانانا", "The banana is yellow.", ["موز", "موزه"]),
    ],
  },
  {
    id: "school",
    ar: "المدرسة",
    en: "School",
    blurb: "أدوات الدراسة وأفعالها.",
    words: [
      w("school", "book", "كتاب", "بوك", "This is my book.", ["كتب"]),
      w("school", "pen", "قلم", "بِن", "I write with a pen."),
      w("school", "teacher", "معلمة", "تيشر", "Soula is my teacher.", ["معلم", "أستاذ", "أستاذة", "معلّمة"]),
      w("school", "school", "مدرسة", "سكول", "I go to school.", ["المدرسة"]),
      w("school", "read", "أقرأ", "ريد", "I read a book.", ["اقرأ", "قراءة"]),
      w("school", "write", "أكتب", "رايت", "I write my name.", ["اكتب", "كتابة"]),
    ],
  },
  {
    id: "feelings",
    ar: "المشاعر",
    en: "Feelings",
    blurb: "نقول كيف نشعر اليوم.",
    words: [
      w("feelings", "happy", "سعيد", "هابي", "I am happy.", ["سعيدة", "فرحان", "فرحانة"]),
      w("feelings", "sad", "حزين", "ساد", "I am sad.", ["حزينة", "زعلان"]),
      w("feelings", "tired", "متعب", "تايرد", "I am tired.", ["تعبان", "متعبة"]),
      w("feelings", "hungry", "جائع", "هَنغري", "I am hungry.", ["جاع", "جائعة", "جعان"]),
      w("feelings", "thirsty", "عطشان", "ثِرستي", "I am thirsty.", ["عطشانة", "عطشانة"]),
      w("feelings", "brave", "شجاع", "بريف", "I am brave.", ["شجاعة", "شجاعة"]),
    ],
  },
];

export const extraWords: Omit<Word, "id">[] = [
  { en: "yes", ar: "نعم", say: "يِس", example: "Yes, please." },
  { en: "no", ar: "لا", say: "نو", example: "No, thank you." },
  { en: "good", ar: "جيد", say: "غود", example: "I am good.", aliases: ["منيحة", "طيب", "كويس"] },
  { en: "today", ar: "اليوم", say: "تودَي", example: "I am happy today." },
  { en: "name", ar: "اسم", say: "نَيم", example: "My name is Sam.", aliases: ["اسمي"] },
  { en: "sun", ar: "شمس", say: "سَن", example: "The sun is yellow.", aliases: ["الشمس"] },
  { en: "sky", ar: "سماء", say: "سكاي", example: "The sky is blue." },
  { en: "small", ar: "صغير", say: "سمول", example: "The cat is small.", aliases: ["صغيرة"] },
  { en: "big", ar: "كبير", say: "بِغ", example: "The dog is big.", aliases: ["كبيرة"] },
  { en: "love", ar: "أحب", say: "لَف", example: "I love my family.", aliases: ["احب", "حُب"] },
];

export function lessonById(id: string | null | undefined): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function allWords(): Word[] {
  return lessons.flatMap((lesson) => lesson.words);
}

export type QuizQ = {
  id: string;
  prompt: string;
  promptLang: "en" | "ar";
  answer: string;
  choices: string[];
};

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j] as T;
    copy[j] = swap as T;
  }
  return copy;
}

export function buildQuiz(lesson: Lesson): QuizQ[] {
  return shuffle(lesson.words)
    .slice(0, 5)
    .map((word, index) => {
      const others = shuffle(lesson.words.filter((item) => item.id !== word.id)).slice(0, 3);
      const askEnglish = index % 2 === 0;
      return {
        id: word.id,
        prompt: askEnglish ? word.en : word.ar,
        promptLang: askEnglish ? "en" : "ar",
        answer: askEnglish ? word.ar : word.en,
        choices: shuffle(
          askEnglish ? [word.ar, ...others.map((item) => item.ar)] : [word.en, ...others.map((item) => item.en)],
        ),
      };
    });
}
