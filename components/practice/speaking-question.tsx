import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { PracticeQuestion, QuestionResult } from "@/types/question";

export function SpeakingQuestion({
  question,
  answer,
  result,
  onAnswer,
}: {
  question: PracticeQuestion;
  answer: string;
  result?: QuestionResult;
  onAnswer: (questionId: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={answer}
        onChange={(event) => onAnswer(question.id, event.target.value)}
        placeholder="Type what you would say aloud..."
        className="min-h-36"
      />
      {question.support?.length ? (
        <div className="flex flex-wrap gap-2">
          {question.support.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      ) : null}
      {result?.isAnswered ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          <p>
            Output length: <span className="font-medium text-foreground">{result.wordCount ?? 0}</span>{" "}
            words
          </p>
          {result.advice ? <p className="mt-2">建议：{result.advice}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
