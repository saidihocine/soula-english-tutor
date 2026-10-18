import { useState } from "react";
import { SOULA_SYSTEM_PROMPT } from "@/lib/soula/prompt";
import { testStudio } from "@/lib/soula/lm";
import type { BrainMode } from "@/lib/soula/store";
import { useSoula } from "@/lib/soula/store";
import { Button, Field } from "@/components/soula/ui";

const MODES: { id: BrainMode; label: string; hint: string }[] = [
  { id: "auto", label: "تلقائي", hint: "يجرّب LM Studio، وإن ما كان شغّالاً تكمل سولا المدمجة." },
  { id: "studio", label: "النموذج المحلي فقط", hint: "لا جواب إلا إذا ردّ LM Studio." },
  { id: "tutor", label: "سولا المدمجة", hint: "دروس ومحادثة جاهزة بلا أي نموذج." },
];

export function Grownups({ onBack }: { onBack: () => void }) {
  const [gate, setGate] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [checking, setChecking] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const lmUrl = useSoula((state) => state.lmUrl);
  const lmModel = useSoula((state) => state.lmModel);
  const brain = useSoula((state) => state.brain);
  const speak = useSoula((state) => state.speak);
  const setLmUrl = useSoula((state) => state.setLmUrl);
  const setLmModel = useSoula((state) => state.setLmModel);
  const setBrain = useSoula((state) => state.setBrain);
  const setSpeak = useSoula((state) => state.setSpeak);
  const resetProgress = useSoula((state) => state.resetProgress);

  if (!open) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-4xl">للأهل</h1>
        <p>هذه الصفحة فيها عنوان النموذج المحلي. اكتب الجملة الإنجليزية لفتحها.</p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (gate.trim().toLowerCase() === "i am the parent") setOpen(true);
            else setStatus("الجملة المطلوبة: I am the parent");
          }}
        >
          <Field
            dir="ltr"
            value={gate}
            onChange={(event) => setGate(event.target.value)}
            placeholder="I am the parent"
            aria-label="جملة الأهل"
          />
          <Button type="submit">افتح</Button>
        </form>
        {status ? <p className="text-sm text-muted">{status}</p> : null}
        <Button variant="quiet" onClick={onBack}>
          رجوع
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-semibold text-terra">إعدادات الكبار</p>
        <h1 className="font-display text-4xl">LM Studio</h1>
      </header>
      <p>
        النموذج المقترح: Qwen2.5-7B-Instruct. شغّل Local Server في LM Studio على المنفذ 1234. إذا فتحت سولا من
        متصفح على عنوان آخر، فعّل CORS. الكلام يُرسل فقط إلى العنوان الذي تكتبه هنا.
      </p>

      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="lm-url">
        عنوان الواجهة
        <Field id="lm-url" dir="ltr" value={lmUrl} onChange={(event) => setLmUrl(event.target.value)} />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="lm-model">
        اسم النموذج، أو اتركه فارغاً ليُختار المفتوح
        <Field
          id="lm-model"
          dir="ltr"
          value={lmModel}
          placeholder="qwen2.5-7b-instruct"
          onChange={(event) => setLmModel(event.target.value)}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">طريقة الجواب</legend>
        {MODES.map((mode) => (
          <label key={mode.id} className="flex items-start gap-3 rounded-2xl border border-line bg-cream p-3">
            <input
              type="radio"
              name="brain"
              className="mt-1"
              checked={brain === mode.id}
              onChange={() => setBrain(mode.id)}
            />
            <span>
              <span className="block font-semibold">{mode.label}</span>
              <span className="text-sm text-muted">{mode.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="flex items-center gap-3 font-semibold">
        <input type="checkbox" checked={speak} onChange={(event) => setSpeak(event.target.checked)} />
        سولا تنطق الجواب الإنجليزي
      </label>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={checking}
          onClick={() => {
            setChecking(true);
            setStatus("أجرب الاتصال…");
            void testStudio(lmUrl).then((result) => {
              setStatus(result.detail);
              setChecking(false);
            });
          }}
        >
          جرّب الاتصال
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            void navigator.clipboard?.writeText(SOULA_SYSTEM_PROMPT);
            setStatus("نُسخ أمر سولا.");
          }}
        >
          انسخ أمر النظام
        </Button>
      </div>
      {status ? <p className="text-sm">{status}</p> : null}

      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-line bg-cream p-4 text-sm" dir="ltr">
        {SOULA_SYSTEM_PROMPT}
      </pre>

      {confirmReset ? (
        <div className="rounded-2xl border border-line bg-terra-soft p-4">
          <p>ينمسح الاسم والنجوم والحديث. إعداد النموذج يبقى.</p>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => {
                resetProgress();
                onBack();
              }}
            >
              امسح التقدّم
            </Button>
            <Button variant="quiet" onClick={() => setConfirmReset(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="quiet" onClick={() => setConfirmReset(true)}>
          مسح تقدّم الطفل
        </Button>
      )}
      <Button variant="ghost" onClick={onBack}>
        رجوع
      </Button>
    </div>
  );
}
