import { MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PracticeQuestion, QuestionResult } from "@/types/question";

export function ExplanationPanel({
  question,
  result,
}: {
  question: PracticeQuestion;
  result: QuestionResult;
}) {
  if (!result.isAnswered) return null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 font-medium">
        <MessageCircle data-icon="inline-start" />
        Instant feedback
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.feedback}</p>
      {question.explanation ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">解析：{question.explanation}</p>
      ) : null}
      {question.explanationDetails ? (
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
          {question.explanationDetails.tests ? (
            <p>
              <span className="font-medium text-foreground">考点：</span>
              {question.explanationDetails.tests}
            </p>
          ) : null}
          {question.explanationDetails.locatorWords?.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">定位词：</span>
              {question.explanationDetails.locatorWords.map((word) => (
                <Badge key={word} variant="secondary">
                  {word}
                </Badge>
              ))}
            </div>
          ) : null}
          {question.explanationDetails.whyCorrect ? (
            <p>
              <span className="font-medium text-foreground">为什么对：</span>
              {question.explanationDetails.whyCorrect}
            </p>
          ) : null}
          {question.explanationDetails.whyWrong ? (
            <p>
              <span className="font-medium text-foreground">为什么错：</span>
              {question.explanationDetails.whyWrong}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
