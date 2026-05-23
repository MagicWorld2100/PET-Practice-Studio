import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PracticeQuestion, QuestionResult } from "@/types/question";

export function ObjectiveQuestion({
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
  const selectedLabel = question.options?.find((option) => option.id === answer)?.label;

  if (question.options?.length) {
    return (
      <section className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Choose one answer
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {!answer
              ? "Choose one answer."
              : isSubmitted
                ? "Read the feedback, then go next."
                : "Now check your answer."}
          </p>
        </div>

        <div className="grid gap-3">
          {question.options.map((option) => {
            const selected = answer === option.id;
            return (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-4 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary hover:bg-accent",
                  selected && "border-primary bg-secondary ring-2 ring-primary shadow-md",
                )}
                onClick={() => onAnswer(question.id, option.id)}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full border text-base font-bold",
                    selected ? "border-primary bg-primary text-primary-foreground" : "bg-background",
                  )}
                >
                  {option.id}
                </span>
                <span className="pt-2 text-base leading-6 text-foreground">{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Your answer:{" "}
          <span className="font-medium text-foreground">
            {answer ? `${answer}${selectedLabel ? ` - ${selectedLabel}` : ""}` : "Choose one answer"}
          </span>
        </div>

        <Button size="lg" disabled={!answer} onClick={onSubmit}>
          {isSubmitted ? "Checked" : "Check my answer"}
        </Button>

        {isSubmitted && result ? <ObjectiveResult question={question} result={result} /> : null}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <Textarea
        value={answer}
        onChange={(event) => onAnswer(question.id, event.target.value)}
        placeholder="Type your answer..."
        className="min-h-14 text-base"
      />
      {!answer.trim() ? <p className="text-sm text-muted-foreground">Type your answer first.</p> : null}
      <Button size="lg" disabled={!answer.trim()} onClick={onSubmit}>
        {isSubmitted ? "Checked" : "Check my answer"}
      </Button>
      {isSubmitted && result ? <ObjectiveResult question={question} result={result} /> : null}
    </section>
  );
}

function ObjectiveResult({
  question,
  result,
}: {
  question: PracticeQuestion;
  result: QuestionResult;
}) {
  const correct = result.isCorrect === true;
  const Icon = correct ? CheckCircle2 : XCircle;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        correct ? "border-primary bg-secondary/60" : "border-input bg-card",
      )}
    >
      <div className="flex items-center gap-2 font-semibold">
        <Icon data-icon="inline-start" />
        {correct ? "Correct" : "Review"}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Correct answer:{" "}
        <span className="font-medium text-foreground">{String(question.answer ?? "")}</span>
      </p>
      {!correct ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Try again after reading the explanation below.
        </p>
      ) : null}
    </div>
  );
}
