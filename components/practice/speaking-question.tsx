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

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Speaking transcript
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
        placeholder="Type what you would say aloud..."
        className="min-h-40 text-base leading-7"
      />

      <div className="flex flex-col justify-between gap-3 rounded-lg border bg-muted/40 p-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Length: <span className="font-medium text-foreground">{wordCount}</span> words
        </p>
        <Button size="lg" disabled={!answer.trim()} onClick={onSubmit}>
          Submit speaking
        </Button>
      </div>

      {isSubmitted && result ? (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <p>
            Length feedback:{" "}
            <span className="font-medium text-foreground">{result.feedback}</span>
          </p>
          {result.advice ? <p className="mt-2">Expansion suggestion: {result.advice}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
