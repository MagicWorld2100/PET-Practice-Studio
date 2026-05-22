"use client";

import { useState } from "react";
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
  onToggleListeningReason: (questionId: string, reason: ListeningErrorReason) => void;
}) {
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coverage Mock</CardTitle>
          <CardDescription>
            覆盖 Reading、Listening、Writing、Speaking 的短流程，不是官方完整模考。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm leading-6 text-muted-foreground">
            开始后会抽取 Reading 6 题、Listening 4 题、Writing 1 题、Speaking 2 题。
            结果会保存在 localStorage，方便家长查看今日学习情况。
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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Coverage Mock</CardTitle>
          <CardDescription>
            Question {Math.min(session.currentIndex + 1, questions.length)}/{questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Progress value={progressValue} />
          {session.completedAt && session.summary ? (
            <div className="rounded-lg border bg-card p-4 text-sm leading-6 text-muted-foreground">
              <p className="font-medium text-foreground">Final summary</p>
              <p>Completed: {session.summary.completed}/{questions.length}</p>
              <p>
                Objective accuracy: {session.summary.objectiveCorrect}/
                {session.summary.objectiveTotal}
              </p>
              <p>Overall average: {session.summary.average}%</p>
            </div>
          ) : null}
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
          onSubmit={() =>
            setSubmitted((current) => ({ ...current, [currentQuestion.id]: true }))
          }
          onToggleListeningReason={onToggleListeningReason}
        />
      ) : null}
    </div>
  );
}
