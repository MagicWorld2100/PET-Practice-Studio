"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionCard } from "@/components/practice/question-card";
import { difficultyOrder, paperOrder } from "@/data/sample-bank";
import { getAvailableParts, getAvailableTopics, type PracticeFilters } from "@/lib/questions";
import type {
  AnswerMap,
  Difficulty,
  ListeningErrorReason,
  ListeningReasonMap,
  PetPaper,
  PracticeQuestion,
  QuestionResult,
} from "@/types/question";

export function PracticePanel({
  allQuestions,
  visibleQuestions,
  filters,
  answers,
  results,
  listeningReasons,
  onFiltersChange,
  onAnswer,
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
  onToggleListeningReason: (questionId: string, reason: ListeningErrorReason) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastIndex = Math.max(visibleQuestions.length - 1, 0);
  const boundedIndex = Math.min(currentIndex, lastIndex);
  const currentQuestion = visibleQuestions[boundedIndex];
  const currentResult = currentQuestion
    ? results.find((item) => item.questionId === currentQuestion.id)
    : undefined;
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? "") : "";

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <NavigatorPanel
        questions={allQuestions}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
          <div>
            <p className="font-medium">
              {visibleQuestions.length === 0
                ? "No question in current filter"
                : `Question ${boundedIndex + 1} of ${visibleQuestions.length}`}
            </p>
            {currentQuestion ? (
              <p className="text-sm text-muted-foreground">
                {currentQuestion.paper} · {currentQuestion.part} · {currentQuestion.topic}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{visibleQuestions.length} questions in view</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={visibleQuestions.length === 0 || boundedIndex === 0}
              onClick={() => setCurrentIndex(Math.max(boundedIndex - 1, 0))}
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={visibleQuestions.length === 0 || boundedIndex >= visibleQuestions.length - 1}
              onClick={() => setCurrentIndex(Math.min(boundedIndex + 1, lastIndex))}
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFiltersChange({ ...filters, part: "All", topic: "All", difficulty: "All" })
              }
            >
              Reset part filters
            </Button>
          </div>
        </div>
        {currentQuestion ? (
          <div
            data-testid="active-question-card"
            className="rounded-xl border bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-3 rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">
              Active question loaded:{" "}
              <span className="font-medium text-foreground">{currentQuestion.id}</span>
            </div>
            <QuestionCard
              question={currentQuestion}
              answer={currentAnswer}
              listeningReasons={listeningReasons}
              result={currentResult}
              onAnswer={onAnswer}
              onToggleListeningReason={onToggleListeningReason}
            />
            <DebugStrip
              questionId={currentQuestion.id}
              type={currentQuestion.type}
              answer={currentAnswer}
              resultState={
                currentResult?.isAnswered
                  ? currentResult.isCorrect === null
                    ? `scored ${currentResult.score}/${currentResult.maxScore}`
                    : currentResult.isCorrect
                      ? "correct"
                      : "review"
                  : "not answered"
              }
            />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No matching practice question</CardTitle>
              <CardDescription>
                当前筛选没有题目。请切换 Paper / Part / Topic / Difficulty，或重置筛选。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() =>
                  onFiltersChange({ ...filters, part: "All", topic: "All", difficulty: "All" })
                }
              >
                Reset part filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DebugStrip({
  questionId,
  type,
  answer,
  resultState,
}: {
  questionId: string;
  type: string;
  answer: string;
  resultState: string;
}) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="mt-4 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Debug:</span> id={questionId} · type={type} ·
      answer={answer || "(empty)"} · result={resultState}
    </div>
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
  const parts = getAvailableParts(questions, filters.paper);
  const topics = getAvailableTopics(questions, filters.paper);

  function setPaper(paper: PetPaper | "All") {
    onFiltersChange({ ...filters, paper, part: "All", topic: "All" });
  }

  return (
    <Card className="h-fit">
      <CardHeader className="p-4 pb-2">
        <CardTitle>练习导航</CardTitle>
        <CardDescription>按 Paper / Part / Topic / Difficulty 精准进入短练。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4 pt-0">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Paper</p>
          {(["All", ...paperOrder] as const).map((paper) => (
            <Button
              key={paper}
              variant={filters.paper === paper ? "default" : "outline"}
              className="justify-start"
              onClick={() => setPaper(paper)}
            >
              {paper === "All" ? <ClipboardList data-icon="inline-start" /> : null}
              {paper === "All" ? "All papers 全部" : paper}
            </Button>
          ))}
        </div>

        <SelectFilter
          label="Part"
          value={filters.part}
          options={parts}
          onChange={(part) => onFiltersChange({ ...filters, part })}
        />
        <SelectFilter
          label="Topic"
          value={filters.topic}
          options={topics}
          onChange={(topic) => onFiltersChange({ ...filters, topic })}
        />
        <SelectFilter
          label="Difficulty"
          value={filters.difficulty}
          options={[...difficultyOrder]}
          onChange={(difficulty) =>
            onFiltersChange({ ...filters, difficulty: difficulty as Difficulty | "All" })
          }
        />
      </CardContent>
    </Card>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
