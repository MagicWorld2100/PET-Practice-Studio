"use client";

import { Bookmark, Clock, Highlighter, ListChecks } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import { ObjectiveQuestion } from "@/components/practice/objective-question";
import { cn } from "@/lib/utils";
import type {
  ListeningErrorReason,
  ListeningReasonMap,
  PracticeQuestion,
  QuestionResult,
} from "@/types/question";

export function ExamQuestionCard({
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
  question: PracticeQuestion;
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
  const isObjective = question.type !== "writing" && question.type !== "speaking";
  const hasReadingPane = Boolean(question.passage || question.transcript);

  return (
    <section className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <header className="grid gap-3 bg-[#243449] px-4 py-3 text-white md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="text-sm font-medium opacity-95">PET Practice Studio</div>
        <div className="text-base font-semibold md:text-center">
          {question.paper} - {question.part}
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold md:justify-end">
          <Clock className="size-4" />
          Practice timer
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b bg-background px-4 py-3">
        <ToolButton icon={<Highlighter className="size-4" />} label="Highlight" />
        <ToolButton icon={<Bookmark className="size-4" />} label="Review later" />
        <ToolButton icon={<ListChecks className="size-4" />} label="Question list" />
        {isSubmitted ? <Badge variant="secondary">Feedback visible</Badge> : null}
      </div>

      <div
        className={cn(
          "grid min-h-[560px]",
          hasReadingPane ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(390px,0.9fr)]" : "lg:grid-cols-1",
        )}
      >
        {hasReadingPane ? (
          <article className="max-h-[calc(100vh-260px)] min-h-[420px] overflow-y-auto border-b bg-white p-5 shadow-inner lg:border-b-0 lg:border-r-2 lg:border-primary/20 lg:p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{question.paper}</Badge>
              <Badge variant="outline">{question.part}</Badge>
              <Badge variant="outline">{question.topic}</Badge>
              <Badge variant="outline">{question.difficulty}</Badge>
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              {question.paper === "Listening" ? "Listening text" : "Reading text"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{question.title}</h2>
            <div className="relative mt-5 overflow-hidden rounded-2xl border-2 border-primary/45 bg-[#fffaf0] p-6 shadow-xl shadow-primary/15">
              <div className="absolute inset-y-0 left-0 w-2 bg-primary" />
              <p className="whitespace-pre-line text-xl leading-10 text-foreground">
              {question.passage ?? question.transcript}
              </p>
            </div>
          </article>
        ) : null}

        <aside className="flex flex-col gap-4 bg-muted/20 p-4 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:p-5">
          <div className="rounded-lg border border-primary/15 bg-muted/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Exam-style focus
            </p>
            <p className="mt-1 text-base font-semibold leading-6">
              {isSubmitted
                ? "Review the evidence, then move to the next question."
                : question.paper === "Listening"
                  ? "Listen first, then answer. Transcript stays hidden until after checking."
                  : "Read the question first, then locate evidence in the text."}
            </p>
          </div>

          <div className="rounded-xl border-2 border-primary/25 bg-card p-4 shadow-md shadow-slate-200/80">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{question.paper}</Badge>
              <Badge variant="outline">{question.part}</Badge>
              <Badge variant="outline">{question.topic}</Badge>
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              Question
            </p>
            <h3 className="mt-2 text-xl font-semibold leading-7">
              {question.question ?? question.prompt}
            </h3>
          </div>

          {isObjective ? (
            <ObjectiveQuestion
              question={question}
              answer={answer}
              result={result}
              isSubmitted={isSubmitted}
              onAnswer={onAnswer}
              onSubmit={onSubmit}
              compact
            />
          ) : null}

          {question.paper === "Listening" && isSubmitted && result?.isCorrect === false ? (
            <ListeningReasonPicker
              question={question}
              listeningReasons={listeningReasons}
              onToggleListeningReason={onToggleListeningReason}
            />
          ) : null}

          {isSubmitted && result ? <ExplanationPanel question={question} result={result} compact /> : null}

          {isSubmitted && result && onNext ? (
            <div className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-2 border-t bg-background/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:-mx-5">
              <p className="text-sm text-muted-foreground">Evidence reviewed?</p>
              <Button disabled={nextDisabled} onClick={onNext}>
                Next question
              </Button>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function ToolButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Button type="button" size="sm" variant="outline">
      {icon}
      {label}
    </Button>
  );
}

const listeningReasonOptions: ListeningErrorReason[] = [
  "missed-key-information",
  "slow-reaction",
  "unknown-words",
  "option-confusion",
];

function ListeningReasonPicker({
  question,
  listeningReasons,
  onToggleListeningReason,
}: {
  question: PracticeQuestion;
  listeningReasons: ListeningReasonMap;
  onToggleListeningReason: (questionId: string, reason: ListeningErrorReason) => void;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <p className="font-medium">Choose one listening reason</p>
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
  );
}
