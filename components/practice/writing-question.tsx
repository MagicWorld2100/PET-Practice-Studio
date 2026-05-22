import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { PracticeQuestion, QuestionResult } from "@/types/question";

export function WritingQuestion({
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
  const hitIds = new Set(result?.checklistHits?.map((item) => item.id) ?? []);

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={answer}
        onChange={(event) => onAnswer(question.id, event.target.value)}
        placeholder="Write your answer here..."
        className="min-h-40"
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

      {question.checklist?.length ? (
        <div className="grid gap-2 rounded-lg border p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">Writing checklist</p>
            {result?.isAnswered ? (
              <Badge variant="secondary">
                {result.wordCount ?? 0} words · {result.checklistHits?.length ?? 0}/
                {question.checklist.length} task points
              </Badge>
            ) : null}
          </div>
          {question.checklist.map((item) => {
            const hit = hitIds.has(item.id);
            const Icon = hit ? CheckCircle2 : Circle;
            return (
              <div key={item.id} className="flex items-start gap-2 text-muted-foreground">
                <Icon data-icon="inline-start" />
                <span>
                  {item.label}
                  {item.required ? " *" : ""}
                </span>
              </div>
            );
          })}
          {result?.missingItems?.length ? (
            <p className="text-sm text-muted-foreground">
              Missing: {result.missingItems.map((item) => item.label).join(", ")}
            </p>
          ) : null}
          {result?.advice ? <p className="text-sm text-muted-foreground">建议：{result.advice}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
