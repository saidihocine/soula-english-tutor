import { BookOpen, ChevronLeft, Hand, Hash, Palette, PawPrint, Sun, Users, Utensils } from "lucide-react";
import { lessonById, lessons, type Lesson } from "@/lib/soula/lessons";
import { useSoula } from "@/lib/soula/store";
import { Button, Stars } from "@/components/soula/ui";

const icons = {
  hello: Hand,
  colors: Palette,
  numbers: Hash,
  animals: PawPrint,
  family: Users,
  food: Utensils,
  school: BookOpen,
  feelings: Sun,
} as const;

export function Home({ onOpen }: { onOpen: (id: string) => void }) {
  const name = useSoula((state) => state.name);
  const learned = useSoula((state) => state.learned);
  const done = useSoula((state) => state.done);
  const next = lessons.find((lesson) => !done.includes(lesson.id)) ?? lessons[0];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3 md:hidden">
        <img src="/soula/portrait.jpg" alt="" className="size-14 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="text-sm text-muted">أهلاً</p>
          <h1 className="truncate font-display text-3xl leading-none">Hi, {name}</h1>
        </div>
        <div className="ms-auto">
          <Stars count={done.length} />
        </div>
      </header>

      <img
        src="/soula/classroom.jpg"
        alt="طاولة دراسة مع دفتر فارغ وكوب أقلام"
        className="h-44 w-full rounded-3xl object-cover md:h-56"
      />

      {next ? <Today lesson={next} learned={learned} onOpen={onOpen} /> : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted">كل الدروس</h2>
        <ul className="flex flex-col gap-2">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <LessonRow
                lesson={lesson}
                learned={lesson.words.filter((word) => learned.includes(word.id)).length}
                done={done.includes(lesson.id)}
                onOpen={onOpen}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Today({
  lesson,
  learned,
  onOpen,
}: {
  lesson: Lesson;
  learned: string[];
  onOpen: (id: string) => void;
}) {
  const count = lesson.words.filter((word) => learned.includes(word.id)).length;
  return (
    <article className="rounded-3xl border border-line bg-cream p-5">
      <p className="text-sm font-semibold text-terra">درس اليوم</p>
      <h2 className="mt-1 font-display text-4xl">{lesson.ar}</h2>
      <p className="mt-1 text-muted" dir="ltr">
        {lesson.en}
      </p>
      <p className="mt-3">{lesson.blurb}</p>
      <p className="mt-2 tabular-nums text-sm text-muted">
        {count} / {lesson.words.length} كلمات
      </p>
      <Button className="mt-4" onClick={() => onOpen(lesson.id)}>
        ابدأ
      </Button>
    </article>
  );
}

function LessonRow({
  lesson,
  learned,
  done,
  onOpen,
}: {
  lesson: Lesson;
  learned: number;
  done: boolean;
  onOpen: (id: string) => void;
}) {
  const Icon = icons[lesson.id as keyof typeof icons] ?? BookOpen;
  return (
    <button
      type="button"
      onClick={() => onOpen(lesson.id)}
      className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-line bg-cream px-3 py-2 text-start"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-terra-soft text-terra">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{lesson.ar}</span>
        <span className="block text-sm text-muted" dir="ltr">
          {lesson.en}
          {done ? " · تم" : ` · ${learned}/${lesson.words.length}`}
        </span>
      </span>
      <ChevronLeft className="size-5 text-muted" aria-hidden="true" />
    </button>
  );
}

export function lessonTitle(id: string | null) {
  return lessonById(id)?.en;
}
