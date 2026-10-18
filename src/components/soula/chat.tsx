import { useEffect, useRef, useState } from "react";
import { Mic, Send, Volume2 } from "lucide-react";
import { lessonById } from "@/lib/soula/lessons";
import { askStudio } from "@/lib/soula/lm";
import { canListen, listenOnce, speak } from "@/lib/soula/speech";
import { useSoula } from "@/lib/soula/store";
import { tutorReply } from "@/lib/soula/tutor";
import { Button, Field } from "@/components/soula/ui";

const CHIPS = ["Hello!", "I am happy.", "كيف أقول ماء؟", "What does book mean?"];

export function Chat() {
  const name = useSoula((state) => state.name);
  const speakOn = useSoula((state) => state.speak);
  const brain = useSoula((state) => state.brain);
  const lmUrl = useSoula((state) => state.lmUrl);
  const lmModel = useSoula((state) => state.lmModel);
  const lessonId = useSoula((state) => state.activeLessonId);
  const messages = useSoula((state) => state.messages);
  const addMessage = useSoula((state) => state.addMessage);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [link, setLink] = useState<"studio" | "tutor" | "idle">("idle");
  const [mounted, setMounted] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending]);

  async function send(text: string) {
    const child = text.trim().slice(0, 400);
    if (!child || pending) return;
    setDraft("");
    addMessage({ role: "child", text: child });
    setPending(true);
    const previous = useSoula.getState().messages;
    const lesson = lessonById(lessonId);
    let reply = "";
    try {
      if (brain !== "tutor") {
        const turns = previous
          .filter((message) => message.role === "child" || message.role === "soula")
          .map((message) => ({
            role: message.role === "child" ? ("user" as const) : ("assistant" as const),
            content: message.text,
          }));
        reply = await askStudio({
          baseUrl: lmUrl,
          model: lmModel,
          turns,
          name,
          lesson: lesson ? `${lesson.en}: ${lesson.words.map((word) => word.en).join(", ")}` : undefined,
        });
        setLink("studio");
      } else {
        reply = tutorReply(child, { name, lessonId });
        setLink("tutor");
      }
    } catch {
      if (brain === "studio") {
        reply = "ما وصلت إلى LM Studio. شغّل الخادم على المنفذ 1234، أو اختر الوضع التلقائي من صفحة الأهل.";
        setLink("tutor");
      } else {
        reply = tutorReply(child, { name, lessonId });
        setLink("tutor");
      }
    }
    addMessage({ role: "soula", text: reply });
    if (useSoula.getState().speak) speak(reply);
    setPending(false);
  }

  async function dictate() {
    setListening(true);
    try {
      const said = await listenOnce();
      setDraft(said);
    } catch {
      setDraft((value) => value);
    } finally {
      setListening(false);
    }
  }

  const status = link === "studio" ? "متصلة بجهازك" : link === "tutor" ? "سولا المدمجة" : "جاهزة للحديث";

  return (
    <div className="flex min-h-[70dvh] flex-col gap-4">
      <header className="flex items-center gap-3">
        <img src="/soula/portrait.jpg?v=2" alt="" className="size-12 rounded-full object-cover" />
        <div>
          <h1 className="font-display text-3xl leading-none">حديث مع سولا</h1>
          <p className="text-sm text-muted">{status}</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {messages.map((message) => (
          <div key={message.id} className={message.role === "child" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 ${
                message.role === "child" ? "bg-terra text-cream" : "border border-line bg-cream text-ink"
              }`}
            >
              <p className="whitespace-pre-wrap break-words" dir="auto">
                {message.text}
              </p>
              {message.role === "soula" ? (
                <button
                  type="button"
                  className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-terra"
                  onClick={() => speak(message.text)}
                >
                  <Volume2 className="size-4" aria-hidden="true" />
                  اسمع
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {pending ? (
          <p className="text-sm text-muted">
            سولا تكتب
            <span className="soula-dot"> …</span>
          </p>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={pending}
            onClick={() => send(chip)}
            className="shrink-0 rounded-full border border-line bg-cream px-4 py-2 text-sm font-semibold"
            dir="auto"
          >
            {chip}
          </button>
        ))}
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        {mounted && canListen() ? (
          <Button variant="quiet" className="px-3" disabled={pending || listening} onClick={dictate} aria-label="تحدّث">
            <Mic className="size-5" aria-hidden="true" />
          </Button>
        ) : null}
        <Field
          value={draft}
          dir="auto"
          placeholder={listening ? "أسمعك…" : "اكتب بالإنجليزي أو اسأل بالعربية"}
          onChange={(event) => setDraft(event.target.value)}
          disabled={pending}
          aria-label="رسالتك إلى سولا"
        />
        <Button type="submit" className="px-4" disabled={pending || !draft.trim()} aria-label="إرسال">
          <Send className="size-5" aria-hidden="true" />
        </Button>
      </form>
      {!speakOn ? <p className="text-sm text-muted">صوت سولا متوقف من صفحة الأهل.</p> : null}
    </div>
  );
}
