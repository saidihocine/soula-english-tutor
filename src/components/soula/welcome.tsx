import { useState } from "react";
import { cleanName, useSoula } from "@/lib/soula/store";
import { Button, Field } from "@/components/soula/ui";

export function Welcome({ ready }: { ready: boolean }) {
  const setName = useSoula((state) => state.setName);
  const [value, setValue] = useState("");
  const name = cleanName(value);

  return (
    <main className="grid min-h-dvh md:grid-cols-2">
      <div className="relative min-h-40 md:order-2 md:min-h-dvh">
        <img
          src="/soula/classroom.jpg"
          alt="ركن دراسة دافئ بشباك مستدير وأقلام"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <section className="flex flex-col justify-center gap-5 px-6 py-8 md:order-1 md:px-12">
        <div className="flex items-center gap-4">
          <img
            src="/soula/portrait.jpg"
            alt="سولا، المعلمة"
            className="size-20 rounded-full border-4 border-cream object-cover shadow-sm"
          />
          <div>
            <p className="text-sm font-semibold tracking-wide text-terra">Soula</p>
            <h1 className="font-display text-5xl leading-none text-ink">سولا</h1>
          </div>
        </div>
        <p className="max-w-md text-lg text-ink">معلمة إنجليزية للأطفال من ٧ إلى ١٢ سنة. نتكلم ببطء، ونشرح بالعربية حين نحتاج.</p>
        <form
          className="flex max-w-md flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (ready && name) setName(name);
          }}
        >
          <label className="text-sm font-semibold text-muted" htmlFor="child-name">
            ما اسمك؟
          </label>
          <Field
            id="child-name"
            autoComplete="nickname"
            placeholder="اكتب اسمك"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <Button type="submit" disabled={!ready || !name}>
            يلا نبدأ
          </Button>
        </form>
      </section>
    </main>
  );
}
