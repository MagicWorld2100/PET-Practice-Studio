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
  AnswerMap,
  Difficulty,
  ListeningErrorReason,
  ListeningReasonMap,
  PetPaper,
  PracticeQuestion,
  QuestionResult,
} from "@/types/question";

type SubmittedMap = Record<string, boolean>;

export function PracticePanel({
  allQuestions,
  visibleQuestions,
  filters,
  answers,
  results,
  listeningReasons,
  onFiltersChange,
  onAnswer,
  onSubmitAttempt,
  onToggleListeningReason,
}: {
  allQuestions: PracticeQuestion[];
  visibleQuestions: PracticeQuestion[];
  filters: PracticeFilters;
  answers: AnswerMap;
  results: QuestionResult[];
  listeningReasons: ListeningReasonMap;
  onFiltersChange: (filters: PracticeFilters) => void;
  onAnswer: (questionId: string, value: string) => void;
  onSubmitAttempt: (question: PracticeQuestion, timeSpentSec: number) => void;
  onToggleListeningReason: (questionId: string, reason: ListeningErrorReason) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState<SubmittedMap>({});
  const startedAt = useRef(0);
  const lastIndex = Math.max(visibleQuestions.length - 1, 0);
  const boundedIndex = Math.min(currentIndex, lastIndex);
  const currentQuestion = visibleQuestions[boundedIndex];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? "") : "";
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

  function submitCurrent() {
    if (!currentQuestion) return;
    setSubmitted((current) => ({ ...current, [currentQuestion.id]: true }));
    const start = startedAt.current || Date.now();
    onSubmitAttempt(currentQuestion, Math.max(1, Math.round((Date.now() - start) / 1000)));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <NavigatorPanel questions={allQuestions} filters={filters} onFiltersChange={updateFilters} />

      <section className="flex flex-col gap-4">
        {currentQuestion ? (
          <>
            <WorkbenchTopBar
              question={currentQuestion}
              index={boundedIndex}
              total={visibleQuestions.length}
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
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
}: {
  question: PracticeQuestion;
  index: number;
  total: number;
  previousDisabled: boolean;
  nextDisabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold">
            Question {index + 1} of {total}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{question.paper}</Badge>
            <Badge variant="outline">{question.part}</Badge>
            <Badge variant="outline">{question.topic}</Badge>
            <Badge variant="outline">{question.difficulty}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={previousDisabled} onClick={onPrevious}>
            <ChevronLeft data-icon="inline-start" />
            Previous
          </Button>
          <Button variant="outline" disabled={nextDisabled} onClick={onNext}>
            Next
            <ChevronRight data-icon="inline-end" />
          </Button>
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
  filters,
  onFiltersChange,
}: {
  questions: PracticeQuestion[];
  filters: PracticeFilters;
  onFiltersChange: (filters: PracticeFilters) => void;
}) {
  const currentCount = filterQuestions(questions, filters).length;
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
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Practice Navigator</CardTitle>
        <CardDescription>
          Paper is the main choice. Part, Topic, and Difficulty narrow the list together.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
          <p className="font-medium text-foreground">Current filter</p>
          <p>
            {formatFilterValue(filters.paper)} → Part {formatFilterValue(filters.part)} + Topic{" "}
            {formatFilterValue(filters.topic)} + Difficulty {formatFilterValue(filters.difficulty)}
          </p>
          <p>
            Showing <span className="font-medium text-foreground">{currentCount}</span> question
            {currentCount === 1 ? "" : "s"}.
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

function formatFilterValue(value: string) {
  return value === "All" ? "All" : value;
}
