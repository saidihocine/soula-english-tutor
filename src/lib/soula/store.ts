import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LM_BASE } from "@/lib/soula/lm-url";

export type BrainMode = "auto" | "studio" | "tutor";

export type SoulaMessage = {
  id: string;
  role: "soula" | "child";
  text: string;
};

type SoulaState = {
  hydrated: boolean;
  name: string;
  speak: boolean;
  lmUrl: string;
  lmModel: string;
  brain: BrainMode;
  learned: string[];
  done: string[];
  messages: SoulaMessage[];
  activeLessonId: string | null;
  setHydrated: () => void;
  setName: (name: string) => void;
  setSpeak: (speak: boolean) => void;
  setLmUrl: (lmUrl: string) => void;
  setLmModel: (lmModel: string) => void;
  setBrain: (brain: BrainMode) => void;
  setActiveLesson: (activeLessonId: string | null) => void;
  markLearned: (id: string) => void;
  markDone: (id: string) => void;
  addMessage: (message: Omit<SoulaMessage, "id">) => void;
  resetProgress: () => void;
};

function uid() {
  return crypto.randomUUID();
}

export function cleanName(raw: string) {
  return raw.replace(/\s+/g, " ").trim().slice(0, 20);
}

export const useSoula = create<SoulaState>()(
  persist(
    (set) => ({
      hydrated: false,
      name: "",
      speak: true,
      lmUrl: DEFAULT_LM_BASE,
      lmModel: "",
      brain: "auto",
      learned: [],
      done: [],
      messages: [],
      activeLessonId: null,
      setHydrated: () => set({ hydrated: true }),
      setName: (name) =>
        set({
          name,
          messages: [
            {
              id: uid(),
              role: "soula",
              text: `Hello, ${name}! I am Soula.\nأنا سولا. اكتب جملة صغيرة، أو اسأل: كيف أقول قطة؟`,
            },
          ],
        }),
      setSpeak: (speak) => set({ speak }),
      setLmUrl: (lmUrl) => set({ lmUrl }),
      setLmModel: (lmModel) => set({ lmModel }),
      setBrain: (brain) => set({ brain }),
      setActiveLesson: (activeLessonId) => set({ activeLessonId }),
      markLearned: (id) =>
        set((state) => (state.learned.includes(id) ? state : { learned: [...state.learned, id] })),
      markDone: (id) => set((state) => (state.done.includes(id) ? state : { done: [...state.done, id] })),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { ...message, id: uid() }].slice(-40),
        })),
      resetProgress: () => set({ name: "", learned: [], done: [], messages: [], activeLessonId: null }),
    }),
    {
      name: "soula-tutor",
      version: 1,
      partialize: (state) => ({
        name: state.name,
        speak: state.speak,
        lmUrl: state.lmUrl,
        lmModel: state.lmModel,
        brain: state.brain,
        learned: state.learned,
        done: state.done,
        messages: state.messages,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
