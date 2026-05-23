"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/practice/question-card";
import type {
  AnswerMap,
  ListeningErrorReason,
  ListeningReasonMap,
  MockSession,
  PracticeQuestion,
  QuestionResult,
} from "@/types/question";

export function CoverageMockPanel({
  session,
  questions,
  answers,
  results,
  listeningReasons,
  onStart,
  onMove,
  onComplete,
  onAnswer,
  onSubmitAttempt,
  onToggleListeningReason,
}: {
  session?: MockSession;
  questions: PracticeQuestion[];
  answers: AnswerMap;
  results: QuestionResult[];
  listeningReasons: ListeningReasonMap;
  onStart: () => void;
  onMove: (index: number) => void;
  onComplete: () => void;
  onAnswer: (questionId: string, value: string) => void;
  onSubmitAttempt: (question: PracticeQuestion, timeSpentSec: number) => void;
  onToggleListeningReason: (questionId: string, reason: ListeningErrorReason) => void;
}) {
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    queueMicrotask(() => {
      startedAt.current = Date.now();
    });
  }, [session?.currentIndex]);

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coverage Mock</CardTitle>
          <CardDescription>
            A short mini-test for family practice. This is not an official PET mock.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <IntroBlock title="What this mock covers" body="Reading 6 + Listening 4 + Writing 1 + Speaking 2." />
            <IntroBlock title="Estimated time" body="About 15-20 minutes. Keep it calm and short." />
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Your latest result is saved locally in this browser for parent review.
          </p>
          <Button className="w-fit" onClick={onStart}>
            <PlayCircle data-icon="inline-start" />
            Start Coverage Mock
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[session.currentIndex];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? "") : "";
  const currentSubmitted = currentQuestion ? Boolean(submitted[currentQuestion.id]) : false;
  const currentResult =
    currentQuestion && currentSubmitted
      ? results.find((result) => result.questionId === currentQuestion.id)
      : undefined;
  const progressValue =
    questions.length === 0 ? 0 : Math.round(((session.currentIndex + 1) / questions.length) * 100);

  if (session.completedAt && session.summary && !reviewCompleted) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Coverage Mock summary</CardTitle>
            <CardDescription>
              Finished mini-test result. This is a practice summary, not an official score.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <SummaryBlock title="Completed questions" body={`${session.summary.completed}/${questions.length}`} />
            <SummaryBlock
              title="Correct objective questions"
              body={`${session.summary.objectiveCorrect}/${session.summary.objectiveTotal}`}
            />
            <SummaryBlock title="Weakest paper" body={session.summary.weakestPaper ?? "暂无"} />
            <SummaryBlock
              title="Recommended next training"
              body={session.summary.recommendedNextTraining ?? "Do 3 short Reading or Listening questions."}
            />
            <div className="rounded-lg border bg-muted/30 p-3 md:col-span-2">
              <p className="font-medium">Top 3 diagnosis tags</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {session.summary.topTags?.length ? session.summary.topTags.join(", ") : "No clear repeated tags yet."}
              </p>
            </div>
            <div className="md:col-span-2">
              <Button onClick={() => setReviewCompleted(true)}>
                Review practice result
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Coverage Mock</CardTitle>
          <CardDescription>
            Question {Math.min(session.currentIndex + 1, questions.length)} of {questions.length || 13}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Progress value={progressValue} />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={session.currentIndex <= 0}
              onClick={() => onMove(session.currentIndex - 1)}
            >
              <ArrowLeft data-icon="inline-start" />
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={session.currentIndex >= questions.length - 1}
              onClick={() => onMove(session.currentIndex + 1)}
            >
              Next
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button onClick={onComplete}>
              <CheckCircle2 data-icon="inline-start" />
              Finish mock
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentQuestion ? (
        <QuestionCard
          question={currentQuestion}
          answer={currentAnswer}
          result={currentResult}
          isSubmitted={currentSubmitted}
          listeningReasons={listeningReasons}
          onAnswer={(questionId, value) => {
            setSubmitted((current) => ({ ...current, [questionId]: false }));
            onAnswer(questionId, value);
          }}
          onSubmit={() => {
            setSubmitted((current) => ({ ...current, [currentQuestion.id]: true }));
            const start = startedAt.current || Date.now();
            onSubmitAttempt(currentQuestion, Math.max(1, Math.round((Date.now() - start) / 1000)));
          }}
          onNext={() => onMove(Math.min(session.currentIndex + 1, questions.length - 1))}
          nextDisabled={session.currentIndex >= questions.length - 1}
          onToggleListeningReason={onToggleListeningReason}
        />
      ) : null}
    </div>
  );
}

function IntroBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function SummaryBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
