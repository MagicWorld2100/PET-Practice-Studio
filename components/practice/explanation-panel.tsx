import { Lightbulb, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PracticeQuestion, QuestionResult } from "@/types/question";

export function ExplanationPanel({
  question,
  result,
  compact = false,
}: {
  question: PracticeQuestion;
  result: QuestionResult;
  compact?: boolean;
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
        <div className={compact ? "mt-4 grid gap-3" : "mt-4 grid gap-3 md:grid-cols-2"}>
          <CoachSection title="1. What this question tests" body={details.tests ?? question.explanation ?? result.feedback} />
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="font-medium">2. Locator words</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {details.locatorWords?.length ? (
                details.locatorWords.map((word) => (
                  <Badge key={word} variant="secondary">
                    {word}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Mark the key words in the question and text first.</span>
              )}
            </div>
          </div>
          <CoachSection title="3. Why this answer is correct" body={details.whyCorrect ?? result.feedback} />
          <CoachSection title="4. Why the other answers are wrong" body={details.whyWrong ?? "The other options do not match the evidence in the text."} />
          <div className={compact ? "rounded-lg border bg-muted/30 p-3" : "rounded-lg border bg-muted/30 p-3 md:col-span-2"}>
            <p className="font-medium">5. What to do next time</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {details.nextStep ?? "Find locator words first, then use the text evidence to remove wrong options."}
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
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Explanation: {question.explanation}</p>
      ) : null}
      {question.explanationDetails ? (
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
          {question.explanationDetails.tests ? (
            <p>
              <span className="font-medium text-foreground">Skill tested: </span>
              {question.explanationDetails.tests}
            </p>
          ) : null}
          {question.explanationDetails.locatorWords?.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">Locator words: </span>
              {question.explanationDetails.locatorWords.map((word) => (
                <Badge key={word} variant="secondary">
                  {word}
                </Badge>
              ))}
            </div>
          ) : null}
          {question.explanationDetails.whyCorrect ? (
            <p>
              <span className="font-medium text-foreground">Why correct: </span>
              {question.explanationDetails.whyCorrect}
            </p>
          ) : null}
          {question.explanationDetails.whyWrong ? (
            <p>
              <span className="font-medium text-foreground">Why wrong: </span>
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
