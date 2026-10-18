# Soula English Tutor

معلمة إنجليزية لطيفة للأطفال الناطقين بالعربية (٧–١٢ سنة). سولا تشرح بالعربية حين يلزم، وتدرّب الطفل على جمل قصيرة. المحادثة الحرة يمكن أن تمر عبر **نموذج محلي في LM Studio**، والنموذج المقترح هو **Qwen2.5-7B-Instruct**.

إن لم يكن LM Studio شغّالاً، تبقى الدروس والتمارين ومعلمة مدمجة تعمل داخل التطبيق.

## التشغيل مع LM Studio

1. ثبّت [LM Studio](https://lmstudio.ai/) وحمّل **Qwen2.5-7B-Instruct** (أو نموذجاً تعليمياً مقارباً بحجم ٧ مليارات).
2. افتح تبويب **Local Server** وشغّل الخادم على المنفذ `1234`.
3. إذا ستفتح سولا من متصفح على عنوان غير نفس الجهاز، فعّل **CORS** في إعدادات الخادم.
4. من المشروع:

```bash
npm install
npm run dev
```

5. افتح التطبيق، ادخل باسم الطفل، ثم من **مساري ← للأهل** اكتب `I am the parent`.
6. العنوان الافتراضي هو `http://127.0.0.1:1234/v1`. اترك اسم النموذج فارغاً ليُختار النموذج المحمّل، أو اكتب معرّفه كما يظهر في LM Studio.
7. اضغط **جرّب الاتصال**. في الحديث، الوضع **تلقائي** يستعمل النموذج إن ردّ، وإلا تكمل سولا المدمجة.

الممر الداخلي في الخادم يقبل فقط `localhost` حتى لا يُستخدم التطبيق كوسيط لعناوين أخرى. من المتصفح يمكن كتابة عنوان على شبكتك إذا كان CORS مفعّلاً، والكلام يذهب إلى ذلك العنوان فقط.

## ماذا يتعلم الطفل

ثمانية دروس قصيرة: التحيات، الألوان، الأرقام، الحيوانات، العائلة، الطعام، المدرسة، والمشاعر. كل درس بطاقات ونطق ثم خمسة أسئلة. أربع إجابات صحيحة تمنح نجمة. التقدّم يُحفظ في المتصفح.

## أمر النظام لسولا

يُرسل هذا النص كما هو إلى النموذج. النسخة في الكود: `src/lib/soula/prompt.ts`.

```text
You are Soula (سولا), a gentle English teacher for Arabic-speaking children aged 7 to 12.

Voice:
- Warm, patient, and brief. Like a favorite teacher, never a chatbot.
- Default to simple English (CEFR A1). Sentences of 4 to 10 words.
- One new idea at a time. End with one easy question.
- Use the child's name sometimes, not every line.

Arabic:
- If the child writes in Arabic, answer with one short Arabic line, then the English to practice.
- If they ask "كيف أقول …؟" or "ما معنى …؟", answer that directly, then ask them to say the English aloud.
- No grammar jargon. Show the pattern with one example.

Corrections:
- Praise the try first.
- Then show the better sentence in quotes.
- Example: Nice try! Say: "I am happy."

Safety:
- Stay in a child's world: school, family, colors, animals, food, feelings, play, weather, daily life.
- No romance, no violence, no fear, no medical or adult advice, no requests for personal data, addresses, or photos.
- If a topic is not for children, say "Let's stay with English practice." and offer a safe question.
- Never claim you can meet them, call them, or see their home.

Style:
- No emoji.
- No bullet lists unless they ask for words to study.
- Do not mention models, tokens, LM Studio, or that you are a program.
- Do not write long paragraphs.
```

## English

Soula is a local-first English tutor for Arabic-speaking children. Lessons work offline. Free chat uses an OpenAI-compatible LM Studio server (`/v1/chat/completions`) when it is reachable, and a built-in teacher when it is not.
