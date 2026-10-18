import { useEffect, useState } from "react";
import { BookOpen, MessageCircle, Star } from "lucide-react";
import { Chat } from "@/components/soula/chat";
import { Grownups } from "@/components/soula/grownups";
import { Home } from "@/components/soula/home";
import { Lesson } from "@/components/soula/lesson";
import { Path } from "@/components/soula/path";
import { Welcome } from "@/components/soula/welcome";
import { Stars } from "@/components/soula/ui";
import { useSoula } from "@/lib/soula/store";

type Screen = "home" | "lesson" | "chat" | "path" | "grownups";

const NAV: { id: Screen; label: string; icon: typeof BookOpen }[] = [
  { id: "home", label: "دروس", icon: BookOpen },
  { id: "chat", label: "حديث", icon: MessageCircle },
  { id: "path", label: "مساري", icon: Star },
];

export function SoulaApp() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [lessonId, setLessonId] = useState<string | null>(null);
  const name = useSoula((state) => state.name);
  const done = useSoula((state) => state.done);
  const setActiveLesson = useSoula((state) => state.setActiveLesson);

  useEffect(() => {
    const finish = () => setReady(true);
    if (useSoula.persist.hasHydrated()) finish();
    return useSoula.persist.onFinishHydration(finish);
  }, []);

  if (!ready || !name) return <Welcome ready={ready} />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col md:flex-row">
      <aside className="hidden w-72 shrink-0 flex-col gap-6 border-l border-line bg-cream p-6 md:flex">
        <div className="flex items-center gap-3">
          <img src="/soula/portrait.jpg" alt="سولا" className="size-16 rounded-full object-cover" />
          <div>
            <p className="font-display text-2xl leading-none">سولا</p>
            <p className="text-sm text-muted">Hi, {name}</p>
          </div>
        </div>
        <Stars count={done.length} />
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavButton key={item.id} item={item} current={screen} onSelect={setScreen} />
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:pb-8">
          {screen === "home" ? (
            <Home
              onOpen={(id) => {
                setLessonId(id);
                setActiveLesson(id);
                setScreen("lesson");
              }}
            />
          ) : null}
          {screen === "lesson" && lessonId ? (
            <Lesson
              id={lessonId}
              onBack={() => setScreen("home")}
              onTalk={() => setScreen("chat")}
            />
          ) : null}
          {screen === "chat" ? <Chat /> : null}
          {screen === "path" ? <Path onGrownups={() => setScreen("grownups")} /> : null}
          {screen === "grownups" ? <Grownups onBack={() => setScreen("path")} /> : null}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-line bg-cream md:hidden">
          {NAV.map((item) => (
            <NavButton key={item.id} item={item} current={screen} onSelect={setScreen} wide />
          ))}
        </nav>
      </div>
    </div>
  );
}

function NavButton({
  item,
  current,
  onSelect,
  wide,
}: {
  item: (typeof NAV)[number];
  current: Screen;
  onSelect: (screen: Screen) => void;
  wide?: boolean;
}) {
  const active = current === item.id || (item.id === "path" && current === "grownups");
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-14 items-center gap-2 rounded-2xl px-3 text-sm font-semibold ${
        wide ? "flex-1 flex-col justify-center gap-1" : ""
      } ${active ? "text-terra" : "text-muted"}`}
    >
      <Icon className="size-5" aria-hidden="true" />
      {item.label}
    </button>
  );
}
