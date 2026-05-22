"use client";

import { AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";

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
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <NavigatorPanel
        questions={allQuestions}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{visibleQuestions.length} questions in view</p>
          <Button variant="outline" size="sm" onClick={() => onFiltersChange({ ...filters, part: "All", topic: "All", difficulty: "All" })}>
            Reset part filters
          </Button>
        </div>
        <AnimatePresence mode="popLayout">
          {visibleQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={answers[question.id] ?? ""}
              listeningReasons={listeningReasons}
              result={results.find((item) => item.questionId === question.id)}
              onAnswer={onAnswer}
              onToggleListeningReason={onToggleListeningReason}
            />
          ))}
        </AnimatePresence>
      </div>
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
      <CardHeader>
        <CardTitle>练习导航</CardTitle>
        <CardDescription>按 Paper / Part / Topic / Difficulty 精准进入短练。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
