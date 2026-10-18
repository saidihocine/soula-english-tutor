import { lessons } from "@/lib/soula/lessons";
import { useSoula } from "@/lib/soula/store";
import { Button } from "@/components/soula/ui";

export function Path({ onGrownups }: { onGrownups: () => void }) {
  const name = useSoula((state) => state.name);
  const learned = useSoula((state) => state.learned);
  const done = useSoula((state) => state.done);
  const total = lessons.reduce((sum, lesson) => sum + lesson.words.length, 0);
  const width = total === 0 ? 0 : Math.round((learned.length / total) * 100);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-semibold text-terra">مسار {name}</p>
        <h1 className="font-display text-4xl">تقدّمك</h1>
      </header>
      <section className="rounded-3xl border border-line bg-cream p-5">
        <p className="font-display text-5xl tabular-nums">{done.length}</p>
        <p className="text-muted">دروس بنجمة</p>
        <p className="mt-4 tabular-nums text-sm text-muted">
          {learned.length} / {total} كلمة
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
          <div className="h-full bg-leaf" style={{ width: `${width}%` }} />
        </div>
      </section>
      <ul className="flex flex-col gap-2">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="flex items-center justify-between rounded-2xl border border-line bg-cream px-4 py-3">
            <span>
              <span className="block font-semibold">{lesson.ar}</span>
              <span className="text-sm text-muted" dir="ltr">
                {lesson.en}
              </span>
            </span>
            <span className={done.includes(lesson.id) ? "font-semibold text-leaf" : "text-muted"}>
              {done.includes(lesson.id) ? "نجمة" : "لم يتم"}
            </span>
          </li>
        ))}
      </ul>
      <Button variant="quiet" onClick={onGrownups}>
        للأهل
      </Button>
    </div>
  );
}
