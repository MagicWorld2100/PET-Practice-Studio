import { BookOpenCheck, ClipboardList } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AttemptRecord,
  LearningAnalyticsSummary,
  PracticeQuestion,
  PracticeSession,
} from "@/types/question";

export function AnalyticsPanel({
  analytics,
  attempts,
  sessions,
  questions,
}: {
  analytics: LearningAnalyticsSummary;
  attempts: AttemptRecord[];
  sessions: PracticeSession[];
  questions: PracticeQuestion[];
}) {
  const wrongObjectiveAttempts = attempts.filter((attempt) => attempt.correct === false);

  if (attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics / 学习追踪</CardTitle>
          <CardDescription>
            暂时还没有提交记录。完成几道题后，这里会显示学习趋势和错题本。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Start with 2-3 Reading or Listening questions.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Analytics / 学习追踪</CardTitle>
          <CardDescription>Local-first learning history from this browser only.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Today summary" value={`${analytics.todayAttempts} attempts`} />
          <MetricCard title="Last 7 days" value={`${analytics.last7DaysAttempts} attempts`} />
          <MetricCard title="Sessions" value={`${sessions.length} saved`} />
          <MetricCard title="Wrong review" value={`${wrongObjectiveAttempts.length} items`} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accuracy by paper</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {analytics.accuracyByPaper.map((item) => (
              <BarRow
                key={item.paper}
                label={item.paper}
                value={item.total === 0 ? "No data" : `${item.correct}/${item.total} correct`}
                percent={item.accuracy}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reading part performance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {analytics.readingPartPerformance.length ? (
              analytics.readingPartPerformance.map((item) => (
                <BarRow
                  key={item.part}
                  label={item.part}
                  value={`${item.correct}/${item.total} correct`}
                  percent={item.accuracy}
                />
              ))
            ) : (
              <EmptyLine>No Reading attempts yet.</EmptyLine>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Listening error reasons</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {analytics.listeningReasons.length ? (
              analytics.listeningReasons.map((item) => (
                <BarRow
                  key={item.reason}
                  label={item.reason}
                  value={`${item.count} times`}
                  percent={Math.min(item.count * 25, 100)}
                />
              ))
            ) : (
              <EmptyLine>No listening error reason recorded yet.</EmptyLine>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top weak diagnosis tags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analytics.topWeakTags.length ? (
              analytics.topWeakTags.map((item) => (
                <Badge key={item.tag} variant="secondary">
                  {item.tag} · {item.count}
                </Badge>
              ))
            ) : (
              <EmptyLine>No repeated weak tag yet.</EmptyLine>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Writing task point completion</CardTitle>
          </CardHeader>
          <CardContent>
            <BarRow
              label="Task points"
              value={`${analytics.writingTaskCompletion.completed}/${analytics.writingTaskCompletion.total}`}
              percent={analytics.writingTaskCompletion.rate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Speaking output length trend</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {analytics.speakingLengthTrend.length ? (
              analytics.speakingLengthTrend.map((item) => (
                <BarRow
                  key={item.submittedAt}
                  label={new Date(item.submittedAt).toLocaleDateString()}
                  value={`${item.wordCount} words`}
                  percent={Math.min(item.wordCount * 2, 100)}
                />
              ))
            ) : (
              <EmptyLine>No Speaking attempt yet.</EmptyLine>
            )}
          </CardContent>
        </Card>
      </div>

      <WrongAnswerReview attempts={wrongObjectiveAttempts} questions={questions} />
    </div>
  );
}

function WrongAnswerReview({
  attempts,
  questions,
}: {
  attempts: AttemptRecord[];
  questions: PracticeQuestion[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenCheck data-icon="inline-start" />
          Wrong Answer Review
        </CardTitle>
        <CardDescription>Review objective mistakes saved from every submit.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {attempts.length === 0 ? (
          <EmptyLine>No wrong objective answer yet.</EmptyLine>
        ) : (
          attempts.slice().reverse().map((attempt) => {
            const question = questions.find((item) => item.id === attempt.questionId);
            return (
              <div key={attempt.attemptId} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{question?.title ?? attempt.questionId}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {attempt.paper} / {attempt.part} / {attempt.topic}
                    </p>
                  </div>
                  <Badge variant="outline">{attempt.submittedAt.slice(0, 10)}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>
                    Selected answer: <span className="font-medium text-foreground">{String(attempt.answer)}</span>
                  </p>
                  <p>
                    Correct answer:{" "}
                    <span className="font-medium text-foreground">{String(attempt.correctAnswer ?? "")}</span>
                  </p>
                </div>
                {attempt.listeningErrorReason ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Listening reason: {attempt.listeningErrorReason}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {attempt.diagnosisTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {question?.explanation ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Explanation: {question.explanation}
                  </p>
                ) : null}
                <Button className="mt-3" variant="outline" disabled>
                  <ClipboardList data-icon="inline-start" />
                  Practice similar later
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function BarRow({
  label,
  value,
  percent,
}: {
  label: string;
  value: string;
  percent: number;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }} />
      </div>
    </div>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
