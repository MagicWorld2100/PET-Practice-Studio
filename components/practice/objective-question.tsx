import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PracticeQuestion } from "@/types/question";

export function ObjectiveQuestion({
  question,
  answer,
  onAnswer,
}: {
  question: PracticeQuestion;
  answer: string;
  onAnswer: (questionId: string, value: string) => void;
}) {
  const selectedLabel = question.options?.find((option) => option.id === answer)?.label;

  if (question.options?.length) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid gap-2">
          {question.options.map((option) => (
            <Button
              key={option.id}
              variant={answer === option.id ? "default" : "outline"}
              className="h-auto justify-start whitespace-normal py-3 text-left"
              onClick={() => onAnswer(question.id, option.id)}
            >
              <span className="font-semibold">{option.id}.</span>
              {option.label}
            </Button>
          ))}
        </div>
        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          Selected:{" "}
          <span className="font-medium text-foreground">
            {answer ? `${answer}${selectedLabel ? ` · ${selectedLabel}` : ""}` : "none"}
          </span>
        </div>
        <Button disabled={!answer} onClick={() => onAnswer(question.id, answer)}>
          Check answer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={answer}
        onChange={(event) => onAnswer(question.id, event.target.value)}
        placeholder="Type your answer..."
        className="min-h-12"
      />
      <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
        Selected: <span className="font-medium text-foreground">{answer || "none"}</span>
      </div>
      <Button disabled={!answer.trim()} onClick={() => onAnswer(question.id, answer)}>
        Check answer
      </Button>
    </div>
  );
}
