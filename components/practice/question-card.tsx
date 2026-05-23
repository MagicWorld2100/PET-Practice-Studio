"use client";

import { AlertCircle, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import { ListeningControls } from "@/components/practice/listening-controls";
import { ObjectiveQuestion } from "@/components/practice/objective-question";
import { SpeakingQuestion } from "@/components/practice/speaking-question";
import { WritingQuestion } from "@/components/practice/writing-question";
import type {
  ListeningErrorReason,
  ListeningReasonMap,
  PracticeQuestion,
  QuestionResult,
} from "@/types/question";

const listeningReasonOptions: ListeningErrorReason[] = ["没听到", "反应慢", "词不会", "选项混淆"];

export function QuestionCard({
  question,
  answer,
  result,
  isSubmitted,
  listeningReasons,
  onAnswer,
  onSubmit,
  onNext,
  nextDisabled = false,
  onToggleListeningReason,
}: {
  question: Partial<PracticeQuestion>;
  answer: string;
  result?: QuestionResult;
  isSubmitted: boolean;
  listeningReasons: ListeningReasonMap;
  onAnswer: (questionId: string, value: string) => void;
  onSubmit: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  onToggleListeningReason: (questionId: string, reason: ListeningErrorReason) => void;
}) {
  if (!isRenderableQuestion(question)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>This question needs more information</CardTitle>
          <CardDescription>
            Please choose another question or ask an adult to check the imported practice bank.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const nextAction = getNextAction(question, answer, isSubmitted);

  return (
    <Card className="bg-white">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{question.paper}</Badge>
          <Badge variant="outline">{question.part}</Badge>
          <Badge variant="outline">{question.topic}</Badge>
          <Badge variant="outline">{question.difficulty}</Badge>
        </div>
        <div>
          <CardTitle className="text-2xl leading-8">{question.title}</CardTitle>
          <CardDescription className="mt-2 text-base">
            {question.paper === "Listening"
              ? "Listen first, answer, then check."
              : "Read, answer, check, then learn from the feedback."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <section className="rounded-lg border border-primary/30 bg-secondary/60 p-4">
          <p className="text-sm font-semibold text-muted-foreground">What to do now / 现在做什么</p>
          <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{nextAction}</p>
        </section>

        <section className="rounded-lg border bg-muted/40 p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Task instruction
          </p>
          <p className="mt-2 text-base font-semibold leading-7 text-foreground">{question.prompt}</p>
        </section>

        {question.paper === "Listening" ? (
          <ListeningControls question={question} canReveal={isSubmitted} />
        ) : null}

        {question.paper !== "Listening" && question.passage ? (
          <section className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Passage
            </p>
            <p className="mt-2 text-base leading-7 text-muted-foreground">{question.passage}</p>
          </section>
        ) : null}

        {question.question ? (
          <section className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Question
            </p>
            <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{question.question}</p>
          </section>
        ) : null}

        {question.type === "writing" ? (
          <WritingQuestion
            question={question}
            answer={answer}
            result={result}
            isSubmitted={isSubmitted}
            onAnswer={onAnswer}
            onSubmit={onSubmit}
          />
        ) : question.type === "speaking" ? (
          <SpeakingQuestion
            question={question}
            answer={answer}
            result={result}
            isSubmitted={isSubmitted}
            onAnswer={onAnswer}
            onSubmit={onSubmit}
          />
        ) : (
          <ObjectiveQuestion
            question={question}
            answer={answer}
            result={result}
            isSubmitted={isSubmitted}
            onAnswer={onAnswer}
            onSubmit={onSubmit}
          />
        )}

        {question.paper === "Listening" && isSubmitted && result?.isCorrect === false ? (
          <section className="flex flex-col gap-3 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle data-icon="inline-start" />
              Choose one listening reason / 选一个听力错因
            </div>
            <p className="text-sm text-muted-foreground">
              This helps the parent feedback say what to practise next.
            </p>
            <div className="flex flex-wrap gap-2">
              {listeningReasonOptions.map((reason) => {
                const active = (listeningReasons[question.id] ?? []).includes(reason);
                return (
                  <Button
                    key={reason}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => onToggleListeningReason(question.id, reason)}
                  >
                    {reason}
                  </Button>
                );
              })}
            </div>
          </section>
        ) : null}

        {isSubmitted && result ? <ExplanationPanel question={question} result={result} /> : null}

        {isSubmitted && result && onNext ? (
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Read the feedback, then go next.</p>
            <Button disabled={nextDisabled} onClick={onNext}>
              Next question
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function isRenderableQuestion(question: Partial<PracticeQuestion> | undefined): question is PracticeQuestion {
  return Boolean(
    question?.id &&
      question.paper &&
      question.part &&
      question.topic &&
      question.difficulty &&
      question.type &&
      question.title &&
      question.prompt,
  );
}

function getNextAction(question: PracticeQuestion, answer: string, isSubmitted: boolean) {
  if (isSubmitted) return "Read the feedback, then go next. 看反馈，然后做下一题。";
  if (question.type === "writing") return "Write your answer, then check it. 写完后检查。";
  if (question.type === "speaking") return "Say it first, then type key words. 先说，再打关键词。";
  if (question.paper === "Listening" && !answer) {
    return "Listen first. Do not read the transcript before answering. 先听，不要先看原文。";
  }
  if (!answer) return "Choose one answer. 先选一个答案。";
  return "Now check your answer. 现在检查答案。";
}
