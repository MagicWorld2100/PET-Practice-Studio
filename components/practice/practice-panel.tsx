"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ClipboardList, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionCard } from "@/components/practice/question-card";
import { difficultyOrder, paperOrder } from "@/data/sample-bank";
import { filterQuestions, getAvailableParts, getAvailableTopics, type PracticeFilters } from "@/lib/questions";
import type {
  AttemptRecord,
  Difficulty,
  ListeningErrorReason,
  ListeningReasonMap,
  PetPaper,
  PracticeQuestion,
  QuestionResult,
} from "@/types/question";

type SubmittedMap = Record<string, boolean>;
type DraftAnswerMap = Record<string, string>;

export function PracticePanel({
  allQuestions,
  visibleQuestions,
  filters,
  attempts,
  results,
  listeningReasons,
  onFiltersChange,
  onAnswer,
  onSubmitAttempt,
  onToggleListeningReason,
  targetQuestionId,
  onTargetQuestionApplied,
}: {
  allQuestions: PracticeQuestion[];
  visibleQuestions: PracticeQuestion[];
  filters: PracticeFilters;
  attempts: AttemptRecord[];
  results: QuestionResult[];
  listeningReasons: ListeningReasonMap;
  onFiltersChange: (filters: PracticeFilters) => void;
  onAnswer: (questionId: string, value: string) => void;
  onSubmitAttempt: (question: PracticeQuestion, timeSpentSec: number, answer: string) => void;
  onToggleListeningReason: (questionId: string, reason: ListeningErrorReason) => void;
  targetQuestionId?: string;
  onTargetQuestionApplied?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState<SubmittedMap>({});
  const [draftAnswers, setDraftAnswers] = useState<DraftAnswerMap>({});
  const startedAt = useRef(0);
  const lastIndex = Math.max(visibleQuestions.length - 1, 0);
  const boundedIndex = Math.min(currentIndex, lastIndex);
  const currentQuestion = visibleQuestions[boundedIndex];
  const currentAnswer = currentQuestion ? (draftAnswers[currentQuestion.id] ?? "") : "";
  const currentResult =
    currentQuestion && submitted[currentQuestion.id]
      ? results.find((item) => item.questionId === currentQuestion.id)
      : undefined;

  function updateFilters(nextFilters: PracticeFilters) {
    setCurrentIndex(0);
    startedAt.current = 0;
    onFiltersChange(nextFilters);
  }

  useEffect(() => {
    queueMicrotask(() => {
      startedAt.current = Date.now();
    });
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (!targetQuestionId) return;
    const targetIndex = visibleQuestions.findIndex((question) => question.id === targetQuestionId);
    if (targetIndex >= 0) {
      queueMicrotask(() => {
        setCurrentIndex(targetIndex);
        onTargetQuestionApplied?.();
      });
    }
  }, [onTargetQuestionApplied, targetQuestionId, visibleQuestions]);

  function submitCurrent() {
    if (!currentQuestion) return;
    setSubmitted((current) => ({ ...current, [currentQuestion.id]: true }));
    const start = startedAt.current || Date.now();
    onSubmitAttempt(
      currentQuestion,
      Math.max(1, Math.round((Date.now() - start) / 1000)),
      currentAnswer,
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
      <div className="order-2 md:order-1">
        <NavigatorPanel
          questions={allQuestions}
          visibleQuestions={visibleQuestions}
          currentQuestionId={currentQuestion?.id}
          attempts={attempts}
          filters={filters}
          onFiltersChange={updateFilters}
          onSelectQuestion={(questionId) => {
            const nextIndex = visibleQuestions.findIndex((question) => question.id === questionId);
            if (nextIndex >= 0) setCurrentIndex(nextIndex);
          }}
        />
      </div>

      <section className="order-1 flex flex-col gap-4 md:order-2">
        {currentQuestion ? (
          <>
            <WorkbenchTopBar
              question={currentQuestion}
              index={boundedIndex}
              total={visibleQuestions.length}
              filters={filters}
              visibleQuestions={visibleQuestions}
              attempts={attempts}
              onSelectQuestion={(questionId) => {
                const nextIndex = visibleQuestions.findIndex((question) => question.id === questionId);
                if (nextIndex >= 0) setCurrentIndex(nextIndex);
              }}
              onResetFilters={() =>
                updateFilters({ paper: "All", part: "All", topic: "All", difficulty: "All" })
              }
              onPrevious={() => setCurrentIndex(Math.max(boundedIndex - 1, 0))}
              onNext={() => setCurrentIndex(Math.min(boundedIndex + 1, lastIndex))}
              previousDisabled={boundedIndex === 0}
              nextDisabled={boundedIndex >= visibleQuestions.length - 1}
            />
            <div data-testid="active-question-card">
              <QuestionCard
                question={currentQuestion}
                answer={currentAnswer}
                result={currentResult}
                isSubmitted={Boolean(submitted[currentQuestion.id])}
                listeningReasons={listeningReasons}
                onAnswer={(questionId, value) => {
                  setSubmitted((current) => ({ ...current, [questionId]: false }));
                  setDraftAnswers((current) => ({ ...current, [questionId]: value }));
                  onAnswer(questionId, value);
                }}
                onSubmit={submitCurrent}
                onNext={() => setCurrentIndex(Math.min(boundedIndex + 1, lastIndex))}
                nextDisabled={boundedIndex >= visibleQuestions.length - 1}
                onToggleListeningReason={onToggleListeningReason}
              />
            </div>
          </>
        ) : (
          <EmptyPracticeState
            onReset={() =>
              updateFilters({ paper: "All", part: "All", topic: "All", difficulty: "All" })
            }
          />
        )}
      </section>
    </div>
  );
}

function WorkbenchTopBar({
  question,
  index,
  total,
  filters,
  visibleQuestions,
  attempts,
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
  onSelectQuestion,
  onResetFilters,
}: {
  question: PracticeQuestion;
  index: number;
  total: number;
  filters: PracticeFilters;
  visibleQuestions: PracticeQuestion[];
  attempts: AttemptRecord[];
  previousDisabled: boolean;
  nextDisabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelectQuestion: (questionId: string) => void;
  onResetFilters: () => void;
}) {
  const attemptedIds = new Set(attempts.map((attempt) => attempt.questionId));
  const attemptedVisibleCount = visibleQuestions.filter((item) => attemptedIds.has(item.id)).length;
  const [questionListOpen, setQuestionListOpen] = useState(false);
  const [pendingQuestionId, setPendingQuestionId] = useState(question.id);

  function confirmQuestionSelection() {
    onSelectQuestion(pendingQuestionId);
    setQuestionListOpen(false);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-semibold">Question {index + 1} of {total}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatQuestionMeta(question)}
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              View: {formatFilterSummary(filters)}
            </p>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:flex">
            <Button
              variant="outline"
              size="sm"
              disabled={previousDisabled}
              onClick={() => {
                setQuestionListOpen(false);
                onPrevious();
              }}
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <div className="relative md:hidden">
              <Button
                type="button"
                size="sm"
                className="shadow-md shadow-primary/20"
                onClick={() => {
                  setPendingQuestionId(question.id);
                  setQuestionListOpen((current) => !current);
                }}
              >
                Questions - {attemptedVisibleCount}/{visibleQuestions.length}
              </Button>
              {questionListOpen ? (
                <div className="fixed inset-x-4 bottom-4 top-20 z-20 flex flex-col overflow-hidden rounded-lg border bg-card shadow-xl sm:absolute sm:inset-auto sm:left-1/2 sm:mt-2 sm:max-h-[70vh] sm:w-[min(92vw,380px)] sm:-translate-x-1/2">
                  <div className="border-b p-3">
                    <div>
                      <p className="text-sm font-medium">Question list</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatFilterSummary(filters)}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 overflow-y-auto p-3">
                    {visibleQuestions.map((item, itemIndex) => {
                      const attempted = attemptedIds.has(item.id);
                      const active = item.id === pendingQuestionId;
                      const current = item.id === question.id;
                      return (
                        <Button
                          key={item.id}
                          type="button"
                          variant={active ? "default" : "outline"}
                          className="h-auto justify-start whitespace-normal px-3 py-2 text-left"
                          onClick={() => setPendingQuestionId(item.id)}
                        >
                          <span className="flex w-full items-start justify-between gap-2">
                            <span className="min-w-0 text-sm">
                              <span className="block truncate">
                                {itemIndex + 1}. {item.part}
                              </span>
                              <span className="block truncate text-xs opacity-75">
                                {shortQuestionTitle(item.title)}
                              </span>
                            </span>
                            <Badge variant={current ? "secondary" : attempted ? "secondary" : "outline"}>
                              {current ? "Current" : attempted ? "Done" : "New"}
                            </Badge>
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t bg-background p-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onResetFilters();
                        setPendingQuestionId(question.id);
                      }}
                    >
                      Reset
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPendingQuestionId(question.id);
                          setQuestionListOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="button" size="sm" onClick={confirmQuestionSelection}>
                        Confirm
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={nextDisabled}
              onClick={() => {
                setQuestionListOpen(false);
                onNext();
              }}
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function EmptyPracticeState({ onReset }: { onReset: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No practice question matches these filters</CardTitle>
        <CardDescription>
          Try a wider filter, or reset filters to return to the full practice bank.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onReset}>
          <RotateCcw data-icon="inline-start" />
          Reset filters
        </Button>
      </CardContent>
    </Card>
  );
}

function NavigatorPanel({
  questions,
  visibleQuestions,
  currentQuestionId,
  attempts,
  filters,
  onFiltersChange,
  onSelectQuestion,
}: {
  questions: PracticeQuestion[];
  visibleQuestions: PracticeQuestion[];
  currentQuestionId?: string;
  attempts: AttemptRecord[];
  filters: PracticeFilters;
  onFiltersChange: (filters: PracticeFilters) => void;
  onSelectQuestion: (questionId: string) => void;
}) {
  const currentCount = filterQuestions(questions, filters).length;
  const attemptedIds = new Set(attempts.map((attempt) => attempt.questionId));
  const attemptedVisibleCount = visibleQuestions.filter((question) => attemptedIds.has(question.id)).length;
  const remainingVisibleCount = Math.max(visibleQuestions.length - attemptedVisibleCount, 0);
  const paperOptions = (["All", ...paperOrder] as const).map((paper) => ({
    value: paper,
    label: paper === "All" ? "All papers" : paper,
    count: filterQuestions(questions, { paper, part: "All", topic: "All", difficulty: "All" }).length,
  }));
  const parts = buildFilterOptions(
    getAvailableParts(questions, filters.paper),
    (part) => ({ ...filters, part }),
    questions,
  );
  const topics = buildFilterOptions(
    getAvailableTopics(questions, filters.paper),
    (topic) => ({ ...filters, topic }),
    questions,
  );
  const difficulties = buildFilterOptions(
    [...difficultyOrder],
    (difficulty) => ({ ...filters, difficulty: difficulty as Difficulty | "All" }),
    questions,
  );

  function setPaper(paper: PetPaper | "All") {
    onFiltersChange({ paper, part: "All", topic: "All", difficulty: "All" });
  }

  return (
    <Card className="hidden h-fit md:block">
      <CardHeader>
        <CardTitle>Choose practice</CardTitle>
        <CardDescription className="md:hidden">
          Filters are below the question on mobile so practice starts first.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
          <p className="font-medium text-foreground">Current filter</p>
          <p>{formatFilterSummary(filters)}</p>
          <p>
            Showing <span className="font-medium text-foreground">{currentCount}</span> question
            {currentCount === 1 ? "" : "s"}.
          </p>
          <p>
            Done <span className="font-medium text-foreground">{attemptedVisibleCount}</span>, not yet{" "}
            <span className="font-medium text-foreground">{remainingVisibleCount}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Paper</p>
          {paperOptions.map((paper) => (
            <Button
              key={paper.value}
              variant={filters.paper === paper.value ? "default" : "outline"}
              className="justify-between"
              onClick={() => setPaper(paper.value)}
            >
              <span className="inline-flex items-center gap-2">
                {paper.value === "All" ? <ClipboardList data-icon="inline-start" /> : null}
                {paper.label}
              </span>
              <span className="text-xs opacity-75">{paper.count}</span>
            </Button>
          ))}
        </div>

        <SelectFilter
          label="Part"
          value={filters.part}
          options={parts}
          help="PET exam part inside the selected paper."
          onChange={(part) => onFiltersChange({ ...filters, part })}
        />
        <SelectFilter
          label="Topic"
          value={filters.topic}
          options={topics}
          help="Practice topic. It narrows the current paper/part."
          onChange={(topic) => onFiltersChange({ ...filters, topic })}
        />
        <SelectFilter
          label="Difficulty"
          value={filters.difficulty}
          options={difficulties}
          help="Training level. It also narrows the same question list."
          onChange={(difficulty) =>
            onFiltersChange({ ...filters, difficulty: difficulty as Difficulty | "All" })
          }
        />

        <Button
          variant="outline"
          onClick={() => onFiltersChange({ paper: "All", part: "All", topic: "All", difficulty: "All" })}
        >
          <RotateCcw data-icon="inline-start" />
          Reset filters
        </Button>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Question status</p>
          <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
            {visibleQuestions.map((question, index) => {
              const attempted = attemptedIds.has(question.id);
              const active = question.id === currentQuestionId;
              return (
                <Button
                  key={question.id}
                  type="button"
                  variant={active ? "default" : "outline"}
                  className="h-auto justify-start whitespace-normal px-3 py-2 text-left"
                  onClick={() => onSelectQuestion(question.id)}
                >
                  <span className="flex w-full items-start justify-between gap-2">
                    <span className="min-w-0 text-sm">
                      <span className="block truncate">
                        {index + 1}. {question.part}
                      </span>
                      <span className="block truncate text-xs opacity-75">
                        {shortQuestionTitle(question.title)}
                      </span>
                    </span>
                    <Badge variant={attempted ? "secondary" : "outline"}>
                      {attempted ? "Done" : "Not yet"}
                    </Badge>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SelectFilter({
  label,
  value,
  options,
  help,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  help: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      <span className="text-xs font-normal leading-5 text-muted-foreground">{help}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="All">All ({options.reduce((sum, option) => sum + option.count, 0)})</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.count === 0}>
            {option.value} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );
}

type FilterOption = {
  value: string;
  count: number;
};

function buildFilterOptions(
  values: readonly string[],
  nextFilters: (value: string) => PracticeFilters,
  questions: PracticeQuestion[],
): FilterOption[] {
  return values.map((value) => ({
    value,
    count: filterQuestions(questions, nextFilters(value)).length,
  }));
}

function formatQuestionMeta(question: PracticeQuestion) {
  return [question.paper, question.part, question.topic, question.difficulty].join(" - ");
}

function formatFilterSummary(filters: PracticeFilters) {
  const activeFilters = [filters.paper, filters.part, filters.topic, filters.difficulty].filter(
    (value) => value !== "All",
  );

  return activeFilters.length === 0 ? "All questions" : activeFilters.join(" - ");
}

function shortQuestionTitle(title: string) {
  return title.replace(/^Reading Part \d+:\s*/i, "").replace(/^Listening Part \d+:\s*/i, "");
}
