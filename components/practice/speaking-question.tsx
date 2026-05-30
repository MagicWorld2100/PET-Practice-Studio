import { CheckCircle2, Circle, Mic } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getWordCount } from "@/lib/scoring";
import type { PracticeQuestion, QuestionResult } from "@/types/question";

export function SpeakingQuestion({
  question,
  answer,
  result,
  isSubmitted,
  onAnswer,
  onSubmit,
}: {
  question: PracticeQuestion;
  answer: string;
  result?: QuestionResult;
  isSubmitted: boolean;
  onAnswer: (questionId: string, value: string) => void;
  onSubmit: () => void;
}) {
  const wordCount = getWordCount(answer);
  const normalized = answer.toLowerCase();
  const checklist = [
    {
      label: "answered the question",
      done: answer.trim().length > 0,
    },
    {
      label: "gave a reason",
      done: /\bbecause\b|\bso\b|\bwhy\b|\breason\b/.test(normalized),
    },
    {
      label: "gave an example/detail",
      done: /\bfor example\b|\bsuch as\b|\bwhen\b|\bwith\b|\bat\b|\bin\b/.test(normalized),
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Speaking practice
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          Say it first, then type the key words.
        </p>
        <p className="mt-2 text-base leading-7 text-foreground">{question.question}</p>
      </div>

      {question.support?.length ? (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-sm font-medium">Sentence starter</p>
          <div className="mt-2 flex flex-wrap gap-2">
          {question.support.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border bg-muted/40 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled>
            <Mic data-icon="inline-start" />
            Record voice later
          </Button>
          <span className="text-sm text-muted-foreground">coming soon</span>
        </div>
      </div>

      <Textarea
        value={answer}
        onChange={(event) => onAnswer(question.id, event.target.value)}
        placeholder="Type what you would say aloud..."
        className="min-h-40 text-base leading-7"
      />

      <div className="flex flex-col justify-between gap-3 rounded-lg border bg-muted/40 p-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Length: <span className="font-medium text-foreground">{wordCount}</span> words
        </p>
        <Button size="lg" disabled={!answer.trim()} onClick={onSubmit}>
          {isSubmitted ? "Checked" : "Check my answer"}
        </Button>
      </div>

      {isSubmitted && result ? (
        <div className="grid gap-3 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Speaking feedback</p>
          <div className="grid gap-2">
            {checklist.map((item) => {
              const Icon = item.done ? CheckCircle2 : Circle;
              return (
                <div key={item.label} className="flex items-center gap-2">
                  <Icon data-icon="inline-start" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
          <p>
            Length: <span className="font-medium text-foreground">{result.feedback}</span>
          </p>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="font-medium text-foreground">Expansion suggestion</p>
            <p className="mt-2">{result.advice ?? "Add one reason or one example."}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
