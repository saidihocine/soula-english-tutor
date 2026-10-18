import { useEffect, useState } from "react";
import { ArrowRight, Check, Mic, Volume2 } from "lucide-react";
import { buildQuiz, lessonById, type QuizQ } from "@/lib/soula/lessons";
import { canListen, heardWord, listenOnce, speak } from "@/lib/soula/speech";
import { useSoula } from "@/lib/soula/store";
import { Button } from "@/components/soula/ui";

export function Lesson({
  id,
  onBack,
  onTalk,
}: {
  id: string;
  onBack: () => void;
  onTalk: () => void;
}) {
  const lesson = lessonById(id);
  const name = useSoula((state) => state.name);
  const markLearned = useSoula((state) => state.markLearned);
  const markDone = useSoula((state) => state.markDone);
  const addMessage = useSoula((state) => state.addMessage);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"cards" | "quiz" | "done">("cards");
  const [quiz, setQuiz] = useState<QuizQ[]>([]);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [hearing, setHearing] = useState(false);
  const [heard, setHeard] = useState("");

  useEffect(() => setMounted(true), []);

  if (!lesson) {
    return (
      <div className="flex flex-col gap-4">
        <p>ما لقيت هذا الدرس.</p>
        <Button variant="quiet" onClick={onBack}>
          رجوع
        </Button>
      </div>
    );
  }

  const word = lesson.words[index] ?? lesson.words[0];
  const question = quiz[step];
  const current = lesson;

  function startQuiz() {
    setQuiz(buildQuiz(current));
    setStep(0);
    setPicked(null);
    setScore(0);
    setPhase("quiz");
  }

  function choose(choice: string) {
    if (!question || picked) return;
    setPicked(choice);
    if (choice === question.answer) {
      setScore((value) => value + 1);
      markLearned(question.id);
    }
  }

  function finish(finalScore: number) {
    if (finalScore >= 4) markDone(current.id);
    setPhase("done");
  }

  async function practiceSaying() {
    if (!word) return;
    setHearing(true);
    setHeard("");
    try {
      const said = await listenOnce();
      setHeard(said);
      if (heardWord(word.en, said)) markLearned(word.id);
    } catch {
      setHeard("");
    } finally {
      setHearing(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="px-3" onClick={onBack}>
          <ArrowRight className="size-5" aria-hidden="true" />
          الدروس
        </Button>
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl">{lesson.ar}</h1>
          <p className="text-sm text-muted" dir="ltr">
            {lesson.en}
          </p>
        </div>
      </div>

      {phase === "cards" && word ? (
        <article className="rounded-3xl border border-line bg-cream p-6">
          <p className="text-sm tabular-nums text-muted">
            {index + 1} / {lesson.words.length}
          </p>
          <h2 className="mt-3 break-words font-display text-5xl leading-none" dir="ltr">
            {word.en}
          </h2>
          <p className="mt-4 text-2xl">{word.ar}</p>
          <p className="mt-2 text-muted">نقولها: {word.say}</p>
          <p className="mt-4 text-lg" dir="ltr">
            {word.example}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="quiet"
              onClick={() => {
                speak(`${word.en}. ${word.example}`);
              }}
            >
              <Volume2 className="size-5" aria-hidden="true" />
              اسمع
            </Button>
            {mounted && canListen() ? (
              <Button variant="quiet" onClick={practiceSaying} disabled={hearing}>
                <Mic className="size-5" aria-hidden="true" />
                {hearing ? "أسمعك…" : "قلها"}
              </Button>
            ) : null}
            <Button
              variant="leaf"
              onClick={() => {
                markLearned(word.id);
                if (index + 1 >= lesson.words.length) startQuiz();
                else {
                  setHeard("");
                  setIndex(index + 1);
                }
              }}
            >
              <Check className="size-5" aria-hidden="true" />
              عرفتها
            </Button>
          </div>
          {heard ? (
            <p className="mt-4 text-sm text-muted" dir="ltr">
              {heardWord(word.en, heard) ? "Nice. I heard you." : `I heard: ${heard}`}
            </p>
          ) : null}
        </article>
      ) : null}

      {phase === "quiz" && question ? (
        <article className="rounded-3xl border border-line bg-cream p-6">
          <p className="text-sm tabular-nums text-muted">
            سؤال {step + 1} / {quiz.length}
          </p>
          <h2 className="mt-3 font-display text-4xl" dir={question.promptLang === "en" ? "ltr" : "rtl"}>
            {question.prompt}
          </h2>
          <p className="mt-2 text-muted">{question.promptLang === "en" ? "ماذا تعني؟" : "كيف نقولها؟"}</p>
          <div className="mt-5 grid gap-2">
            {question.choices.map((choice) => {
              const correct = picked && choice === question.answer;
              const wrong = picked === choice && choice !== question.answer;
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={Boolean(picked)}
                  onClick={() => choose(choice)}
                  dir={question.promptLang === "en" ? "rtl" : "ltr"}
                  className={`min-h-12 rounded-2xl border px-4 text-lg font-semibold ${
                    correct
                      ? "border-leaf bg-leaf-soft text-leaf"
                      : wrong
                        ? "border-terra bg-terra-soft text-terra"
                        : "border-line bg-sand text-ink"
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {picked ? (
            <Button
              className="mt-4"
              onClick={() => {
                if (step + 1 >= quiz.length) finish(score);
                else {
                  setStep(step + 1);
                  setPicked(null);
                }
              }}
            >
              التالي
            </Button>
          ) : null}
        </article>
      ) : null}

      {phase === "done" ? (
        <article className="rounded-3xl border border-line bg-cream p-6">
          <p className="text-sm font-semibold text-terra">النتيجة</p>
          <h2 className="mt-2 font-display text-5xl tabular-nums">
            {score} / {quiz.length}
          </h2>
          <p className="mt-3 text-lg">
            {score >= 4 ? `أحسنت يا ${name}. صارت عندك نجمة هذا الدرس.` : "قريبة جداً. نعيد الأسئلة بهدوء؟"}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {score >= 4 ? (
              <Button
                onClick={() => {
                  addMessage({
                    role: "soula",
                    text: `Let's talk about ${lesson.en}, ${name}. Can you say one sentence?`,
                  });
                  onTalk();
                }}
              >
                احكِ مع سولا
              </Button>
            ) : (
              <Button onClick={startQuiz}>إعادة الأسئلة</Button>
            )}
            <Button variant="quiet" onClick={onBack}>
              رجوع للدروس
            </Button>
          </div>
        </article>
      ) : null}
    </div>
  );
}
