import { BookOpen, Headphones, Mic, PenLine } from "lucide-react";

import type { PetPaper } from "@/types/question";

export const paperMeta: Record<
  PetPaper,
  { icon: typeof BookOpen; label: string; tone: string }
> = {
  Reading: { icon: BookOpen, label: "Reading 阅读", tone: "bg-sky-50 text-sky-700" },
  Listening: { icon: Headphones, label: "Listening 听力", tone: "bg-violet-50 text-violet-700" },
  Writing: { icon: PenLine, label: "Writing 写作", tone: "bg-amber-50 text-amber-700" },
  Speaking: { icon: Mic, label: "Speaking 口语", tone: "bg-emerald-50 text-emerald-700" },
};
