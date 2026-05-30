"use client";

import { AlertCircle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamQuestionCard } from "@/components/practice/exam-question-card";
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

const listeningReasonOptions: ListeningErrorReason[] = [
  "missed-key-information",
  "slow-reaction",
  "unknown-words",
  "option-confusion",
];

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
  presentation = "practice",
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
  presentation?: "practice" | "exam";
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
  const useExamLayout = presentation === "exam" || isLongReadingQuestion(question);

  if (useExamLayout) {
    return (
      <ExamQuestionCard
        question={question}
        answer={answer}
        result={result}
        isSubmitted={isSubmitted}
        listeningReasons={listeningReasons}
        onAnswer={onAnswer}
        onSubmit={onSubmit}
        onNext={onNext}
        nextDisabled={nextDisabled}
        onToggleListeningReason={onToggleListeningReason}
      />
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader className="gap-3">
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
        <section className="rounded-lg border border-primary/15 bg-muted/40 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What to do now
          </p>
          <p className="mt-1 text-base font-semibold leading-6 text-foreground">{nextAction}</p>
        </section>

        <section className="rounded-xl border-2 border-primary/20 bg-white p-5 shadow-md shadow-slate-200/80">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">
            Task instruction
          </p>
          <p className="mt-3 text-lg font-semibold leading-8 text-foreground">{question.prompt}</p>
        </section>

        {question.paper === "Listening" ? (
          <ListeningControls question={question} canReveal={isSubmitted} />
        ) : null}

        {question.paper !== "Listening" && question.passage ? (
          <section className="relative overflow-hidden rounded-2xl border-2 border-primary/45 bg-[#fffaf0] p-6 shadow-xl shadow-primary/15">
            <div className="absolute inset-y-0 left-0 w-2 bg-primary" />
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-primary px-3 py-1 text-sm font-bold uppercase tracking-wide text-primary-foreground">
                Passage
              </span>
              <span className="text-sm font-medium text-muted-foreground">Read this text carefully</span>
            </div>
            <p className="mt-5 text-xl leading-9 text-foreground">{question.passage}</p>
          </section>
        ) : null}

        {question.question ? (
          <section className="rounded-xl border-2 border-primary/25 bg-white p-5 shadow-lg shadow-slate-200/90">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              Question
            </p>
            <p className="mt-3 text-xl font-semibold leading-8 text-foreground">{question.question}</p>
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
              Choose one listening reason
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
  if (isSubmitted) return "Read the feedback, then go next.";
  if (question.type === "writing") return "Write your answer, then check it.";
  if (question.type === "speaking") return "Say it first, then type key words.";
  if (question.paper === "Listening" && !answer) {
    return "Listen first. Do not read the transcript before answering.";
  }
  if (!answer) return "Choose one answer.";
  return "Now check your answer.";
}

function isLongReadingQuestion(question: PracticeQuestion) {
  if (question.paper !== "Reading") return false;
  if (question.part === "Part 3" || question.part === "Part 4") return true;
  return (question.passage?.length ?? 0) > 260;
}
