import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getWordCount } from "@/lib/scoring";
import type { PracticeQuestion, QuestionResult } from "@/types/question";

export function WritingQuestion({
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
  const hitIds = new Set(result?.checklistHits?.map((item) => item.id) ?? []);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Write your answer
        </p>
        <p className="mt-2 text-base leading-7 text-foreground">{question.question}</p>
      </div>

      {question.support?.length ? (
        <div className="flex flex-wrap gap-2">
          {question.support.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      ) : null}

      <Textarea
        value={answer}
        onChange={(event) => onAnswer(question.id, event.target.value)}
        placeholder="Write your answer here..."
        className="min-h-44 text-base leading-7"
      />

      <div className="flex flex-col justify-between gap-3 rounded-lg border bg-muted/40 p-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Word count: <span className="font-medium text-foreground">{wordCount}</span>
        </p>
        <Button size="lg" disabled={!answer.trim()} onClick={onSubmit}>
          Submit writing
        </Button>
      </div>

      {isSubmitted && result && question.checklist?.length ? (
        <div className="grid gap-3 rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">Writing feedback</p>
            <Badge variant="secondary">
              {result.checklistHits?.length ?? 0}/{question.checklist.length} task points
            </Badge>
          </div>
          {question.checklist.map((item) => {
            const hit = hitIds.has(item.id);
            const Icon = hit ? CheckCircle2 : Circle;
            return (
              <div key={item.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Icon data-icon="inline-start" />
                <span>
                  {item.label}
                  {item.required ? " *" : ""}
                </span>
              </div>
            );
          })}
          {result.missingItems?.length ? (
            <p className="text-sm text-muted-foreground">
              Missing: {result.missingItems.map((item) => item.label).join(", ")}
            </p>
          ) : null}
          {result.advice ? <p className="text-sm text-muted-foreground">Suggestion: {result.advice}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
