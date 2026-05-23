import { Lightbulb, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PracticeQuestion, QuestionResult } from "@/types/question";

export function ExplanationPanel({
  question,
  result,
}: {
  question: PracticeQuestion;
  result: QuestionResult;
}) {
  if (!result.isAnswered) return null;
  const isReadingObjective =
    question.paper === "Reading" && question.type !== "writing" && question.type !== "speaking";

  if (isReadingObjective && question.explanationDetails) {
    const details = question.explanationDetails;

    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 font-medium">
          <Lightbulb data-icon="inline-start" />
          Reading feedback
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CoachSection title="1. 这题在考什么" body={details.tests ?? question.explanation ?? result.feedback} />
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="font-medium">2. 定位词</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {details.locatorWords?.length ? (
                details.locatorWords.map((word) => (
                  <Badge key={word} variant="secondary">
                    {word}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">先圈题干和原文里的关键词。</span>
              )}
            </div>
          </div>
          <CoachSection title="3. 为什么这个答案对" body={details.whyCorrect ?? result.feedback} />
          <CoachSection title="4. 为什么其他答案错" body={details.whyWrong ?? "其他选项和原文证据对不上。"} />
          <div className="rounded-lg border bg-muted/30 p-3 md:col-span-2">
            <p className="font-medium">5. 下一次怎么做</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {details.nextStep ?? "先找定位词，再用原文证据排除不符合的选项。"}
            </p>
            <Button className="mt-3" variant="outline" disabled>
              Try a similar question later
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

function CoachSection({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
