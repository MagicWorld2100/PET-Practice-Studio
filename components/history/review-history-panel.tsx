import { BookOpenCheck, Clock, RotateCcw, Target } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttemptRecord, PracticeQuestion } from "@/types/question";

export function ReviewHistoryPanel({
  attempts,
  questions,
  onPracticeQuestion,
}: {
  attempts: AttemptRecord[];
  questions: PracticeQuestion[];
  onPracticeQuestion: (question: PracticeQuestion) => void;
}) {
  const latestAttempts = attempts.slice().reverse();
  const wrongAttempts = latestAttempts.filter((attempt) => attempt.correct === false);
  const practisedQuestionIds = new Set(attempts.map((attempt) => attempt.questionId));
  const practisedQuestions = questions.filter((question) => practisedQuestionIds.has(question.id));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Review History</CardTitle>
          <CardDescription>
            Trace what has been attempted, review mistakes, and jump back into focused practice.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <HistoryStat title="Attempts" value={String(attempts.length)} detail="Every submitted answer" />
          <HistoryStat title="Wrong answers" value={String(wrongAttempts.length)} detail="Objective mistakes to review" />
          <HistoryStat title="Questions practised" value={String(practisedQuestions.length)} detail="Unique question coverage" />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock data-icon="inline-start" />
              Timeline
            </CardTitle>
            <CardDescription>Newest submissions first.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {latestAttempts.length === 0 ? (
              <EmptyLine>No attempts yet. Submit an answer to start the history.</EmptyLine>
            ) : (
              latestAttempts.map((attempt) => {
                const question = questions.find((item) => item.id === attempt.questionId);
                return (
                  <AttemptCard
                    key={attempt.attemptId}
                    attempt={attempt}
                    question={question}
                    onPracticeQuestion={onPracticeQuestion}
                  />
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck data-icon="inline-start" />
                Mistake notebook
              </CardTitle>
              <CardDescription>Only objective answers marked wrong.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {wrongAttempts.length === 0 ? (
                <EmptyLine>No wrong objective answer yet.</EmptyLine>
              ) : (
                wrongAttempts.slice(0, 6).map((attempt) => {
                  const question = questions.find((item) => item.id === attempt.questionId);
                  return (
                    <AttemptCard
                      key={attempt.attemptId}
                      attempt={attempt}
                      question={question}
                      compact
                      onPracticeQuestion={onPracticeQuestion}
                    />
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target data-icon="inline-start" />
                Practised questions
              </CardTitle>
              <CardDescription>Jump back to a question already seen.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {practisedQuestions.length === 0 ? (
                <EmptyLine>No practised questions yet.</EmptyLine>
              ) : (
                practisedQuestions.map((question) => (
                  <div key={question.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{question.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {question.paper} - {question.part} - {question.topic}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onPracticeQuestion(question)}>
                      <RotateCcw data-icon="inline-start" />
                      Practice
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AttemptCard({
  attempt,
  question,
  compact = false,
  onPracticeQuestion,
}: {
  attempt: AttemptRecord;
  question?: PracticeQuestion;
  compact?: boolean;
  onPracticeQuestion: (question: PracticeQuestion) => void;
}) {
  const status = attempt.correct === undefined ? "Reviewed" : attempt.correct ? "Correct" : "Wrong";
  const statusVariant = attempt.correct === false ? "default" : "secondary";

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{question?.title ?? attempt.questionId}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {attempt.paper} - {attempt.part} - {attempt.topic}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant}>{status}</Badge>
          <Badge variant="outline">{formatDateTime(attempt.submittedAt)}</Badge>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
        <p>
          Answer: <span className="font-medium text-foreground">{String(attempt.answer)}</span>
        </p>
        <p>
          Correct answer:{" "}
          <span className="font-medium text-foreground">{String(attempt.correctAnswer ?? "N/A")}</span>
        </p>
        {!compact ? (
          <p>
            Time spent: <span className="font-medium text-foreground">{attempt.timeSpentSec}s</span>
          </p>
        ) : null}
        {attempt.listeningErrorReason ? <p>Listening reason: {attempt.listeningErrorReason}</p> : null}
      </div>

      {attempt.diagnosisTags.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {attempt.diagnosisTags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      {question ? (
        <Button className="mt-3" variant="outline" onClick={() => onPracticeQuestion(question)}>
          <RotateCcw data-icon="inline-start" />
          Practice again
        </Button>
      ) : null}
    </div>
  );
}

function HistoryStat({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">{children}</p>;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
