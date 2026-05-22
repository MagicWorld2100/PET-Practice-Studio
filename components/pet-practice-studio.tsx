"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Import,
  MessageCircle,
  Mic,
  PenLine,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { paperOrder, sampleQuestionBank } from "@/data/sample-bank";
import { buildDiagnosisSummary, buildParentFeedback } from "@/lib/diagnostics";
import { scoreQuestionBank } from "@/lib/scoring";
import { clearProgress, defaultProgressState, loadProgress, saveProgress } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type {
  AnswerMap,
  ListeningErrorReason,
  ListeningReasonMap,
  PetPaper,
  PracticeQuestion,
  ProgressState,
} from "@/types/question";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const listeningReasonOptions: ListeningErrorReason[] = ["没听到", "反应慢", "词不会", "选项混淆"];

const paperMeta: Record<PetPaper, { icon: typeof BookOpen; label: string; tone: string }> = {
  Reading: { icon: BookOpen, label: "Reading 阅读", tone: "bg-sky-50 text-sky-700" },
  Listening: { icon: Headphones, label: "Listening 听力", tone: "bg-violet-50 text-violet-700" },
  Writing: { icon: PenLine, label: "Writing 写作", tone: "bg-amber-50 text-amber-700" },
  Speaking: { icon: Mic, label: "Speaking 口语", tone: "bg-emerald-50 text-emerald-700" },
};

export function PetPracticeStudio() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [selectedPaper, setSelectedPaper] = useState<PetPaper | "All">("All");
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState("");

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const allQuestions = useMemo(
    () => [...sampleQuestionBank, ...progress.importedQuestions],
    [progress.importedQuestions],
  );

  const visibleQuestions = useMemo(
    () =>
      selectedPaper === "All"
        ? allQuestions
        : allQuestions.filter((question) => question.paper === selectedPaper),
    [allQuestions, selectedPaper],
  );

  const scoring = useMemo(
    () => scoreQuestionBank(visibleQuestions, progress.answers),
    [visibleQuestions, progress.answers],
  );

  const diagnosis = useMemo(
    () => buildDiagnosisSummary(visibleQuestions, scoring.results, progress.listeningReasons),
    [visibleQuestions, progress.listeningReasons, scoring.results],
  );

  const parentFeedback = useMemo(
    () => buildParentFeedback(visibleQuestions, scoring.results),
    [visibleQuestions, scoring.results],
  );

  const progressValue =
    scoring.total === 0 ? 0 : Math.round((scoring.answered / scoring.total) * 100);

  function updateAnswer(questionId: string, value: string) {
    setProgress((current) => ({
      ...current,
      answers: { ...current.answers, [questionId]: value },
    }));
  }

  function toggleListeningReason(questionId: string, reason: ListeningErrorReason) {
    setProgress((current) => {
      const existing = current.listeningReasons[questionId] ?? [];
      const nextReasons = existing.includes(reason)
        ? existing.filter((item) => item !== reason)
        : [...existing, reason];

      return {
        ...current,
        listeningReasons: { ...current.listeningReasons, [questionId]: nextReasons },
      };
    });
  }

  function importQuestions() {
    try {
      const parsed = JSON.parse(importText) as PracticeQuestion | PracticeQuestion[];
      const incoming = Array.isArray(parsed) ? parsed : [parsed];
      const valid = incoming.filter(isPracticeQuestion);

      if (valid.length === 0) {
        setImportMessage("没有找到可导入的题目。请检查 JSON 字段。");
        return;
      }

      setProgress((current) => ({
        ...current,
        importedQuestions: [
          ...current.importedQuestions.filter(
            (question) => !valid.some((item) => item.id === question.id),
          ),
          ...valid,
        ],
      }));
      setImportMessage(`已导入 ${valid.length} 题。重复 id 会被新版本替换。`);
    } catch {
      setImportMessage("JSON 解析失败，请检查格式。");
    }
  }

  function resetProgress() {
    clearProgress();
    setProgress(defaultProgressState);
    setImportText("");
    setImportMessage("本地进度已清空。");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="flex max-w-3xl flex-col gap-4">
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles data-icon="inline-start" />
                </span>
                Cambridge B1 Preliminary for Schools
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                  PET Practice Studio
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  面向孩子和家长的 PET 练习工作台：先用本地题库完成短练、即时检查、
                  轻量诊断和家长反馈，后续再接入听力、数据库、登录和 AI 讲解服务。
                </p>
              </div>
            </div>
            <Card className="w-full lg:max-w-sm">
              <CardHeader>
                <CardTitle>今日进度</CardTitle>
                <CardDescription>
                  {scoring.answered}/{scoring.total} 已完成 · 客观题{" "}
                  {scoring.objectiveCorrect}/{scoring.objectiveTotal} 正确
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Progress value={progressValue} />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>综合完成度</span>
                  <span className="font-medium text-foreground">{progressValue}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <ModuleSummary questions={allQuestions} answers={progress.answers} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="practice">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="parent">Parent feedback</TabsTrigger>
            <TabsTrigger value="import">Import JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="practice">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <FilterPanel selectedPaper={selectedPaper} onSelect={setSelectedPaper} />
              <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {visibleQuestions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      answer={progress.answers[question.id] ?? ""}
                      listeningReasons={progress.listeningReasons}
                      result={scoring.results.find((item) => item.questionId === question.id)}
                      onAnswer={updateAnswer}
                      onToggleListeningReason={toggleListeningReason}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diagnosis">
            <Card>
              <CardHeader>
                <CardTitle>轻量诊断</CardTitle>
                <CardDescription>
                  基于错题标签、听力原因和表达长度生成，适合作为课后复盘入口。
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {diagnosis.length === 0 ? (
                  <EmptyPanel text="暂时没有明显薄弱项。完成更多题目后这里会生成诊断。" />
                ) : (
                  diagnosis.map((item) => (
                    <div key={item.tag} className="rounded-lg border bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="secondary">{item.tag}</Badge>
                        <span className="text-sm text-muted-foreground">{item.count} 次</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.advice}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parent">
            <Card>
              <CardHeader>
                <CardTitle>家长反馈摘要</CardTitle>
                <CardDescription>把练习结果翻译成家长能执行的下一步。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-3">
                <FeedbackBlock title="本次情况" body={parentFeedback.headline} />
                <FeedbackBlock
                  title="建议复盘"
                  body={
                    parentFeedback.reviewItems.length === 0
                      ? "没有客观错题需要重点复盘。"
                      : `重点查看 ${parentFeedback.reviewItems.length} 道错题的解析和原因标签。`
                  }
                />
                <FeedbackBlock title="下一步" body={parentFeedback.nextStep} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>JSON 题库导入</CardTitle>
                <CardDescription>
                  支持粘贴单题对象或题目数组。v1 只写入 localStorage，不连接数据库。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Textarea
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  className="min-h-56 font-mono"
                  placeholder='{"id":"reading-custom-1","paper":"Reading","part":"Part 1","skill":"reading","type":"single_choice","topic":"Notice","title":"Custom question","prompt":"Read and answer","options":[{"id":"A","label":"Option A"}],"answer":"A"}'
                />
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-sm text-muted-foreground">{importMessage}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetProgress}>
                      <RotateCcw data-icon="inline-start" />
                      Reset local data
                    </Button>
                    <Button onClick={importQuestions}>
                      <Import data-icon="inline-start" />
                      Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

function ModuleSummary({ questions, answers }: { questions: PracticeQuestion[]; answers: AnswerMap }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {paperOrder.map((paper) => {
        const items = questions.filter((question) => question.paper === paper);
        const done = items.filter((question) => Boolean(answers[question.id]?.trim())).length;
        const Icon = paperMeta[paper].icon;

        return (
          <Card key={paper}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className={cn("inline-flex size-11 items-center justify-center rounded-md", paperMeta[paper].tone)}>
                <Icon data-icon="inline-start" />
              </span>
              <div>
                <p className="font-medium">{paperMeta[paper].label}</p>
                <p className="text-sm text-muted-foreground">
                  {done}/{items.length} completed
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FilterPanel({
  selectedPaper,
  onSelect,
}: {
  selectedPaper: PetPaper | "All";
  onSelect: (paper: PetPaper | "All") => void;
}) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>练习筛选</CardTitle>
        <CardDescription>按 PET paper 进入短练。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {(["All", ...paperOrder] as const).map((paper) => (
          <Button
            key={paper}
            variant={selectedPaper === paper ? "default" : "outline"}
            className="justify-start"
            onClick={() => onSelect(paper)}
          >
            {paper === "All" ? <ClipboardList data-icon="inline-start" /> : null}
            {paper === "All" ? "All papers 全部" : paperMeta[paper].label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function QuestionCard({
  question,
  answer,
  result,
  listeningReasons,
  onAnswer,
  onToggleListeningReason,
}: {
  question: PracticeQuestion;
  answer: string;
  result?: ReturnType<typeof scoreQuestionBank>["results"][number];
  listeningReasons: ListeningReasonMap;
  onAnswer: (questionId: string, value: string) => void;
  onToggleListeningReason: (questionId: string, reason: ListeningErrorReason) => void;
}) {
  const isObjective =
    question.type === "single_choice" || question.type === "true_false" || question.type === "gap_fill";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{question.paper}</Badge>
                <Badge variant="outline">{question.part}</Badge>
                <Badge variant="outline">{question.type}</Badge>
              </div>
              <CardTitle>{question.title}</CardTitle>
              <CardDescription>{question.topic}</CardDescription>
            </div>
            {result?.isAnswered ? (
              <Badge variant={result.isCorrect === false ? "outline" : "default"}>
                {result.isCorrect === null
                  ? `${result.score}/${result.maxScore}`
                  : result.isCorrect
                    ? "Correct"
                    : "Review"}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg bg-muted/60 p-4 text-sm leading-6">
            <p className="font-medium">{question.prompt}</p>
            {question.audioLabel ? (
              <p className="mt-2 text-muted-foreground">Audio placeholder: {question.audioLabel}</p>
            ) : null}
            {question.passage ? <p className="mt-3 text-muted-foreground">{question.passage}</p> : null}
            {question.question ? <p className="mt-3 font-medium">{question.question}</p> : null}
          </div>

          {question.options?.length ? (
            <div className="grid gap-2">
              {question.options.map((option) => (
                <Button
                  key={option.id}
                  variant={answer === option.id ? "default" : "outline"}
                  className="h-auto justify-start whitespace-normal py-3 text-left"
                  onClick={() => onAnswer(question.id, option.id)}
                >
                  <span className="font-semibold">{option.id}.</span>
                  {option.label}
                </Button>
              ))}
            </div>
          ) : (
            <Textarea
              value={answer}
              onChange={(event) => onAnswer(question.id, event.target.value)}
              placeholder={question.type === "gap_fill" ? "Type your answer..." : "Write your response here..."}
              className={question.type === "gap_fill" ? "min-h-12" : "min-h-36"}
            />
          )}

          {question.support?.length ? (
            <div className="flex flex-wrap gap-2">
              {question.support.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          ) : null}

          {question.checklist?.length ? (
            <div className="grid gap-2 rounded-lg border p-4 text-sm">
              <p className="font-medium">Writing checklist</p>
              {question.checklist.map((item) => (
                <label key={item} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 data-icon="inline-start" />
                  {item}
                </label>
              ))}
            </div>
          ) : null}

          {question.paper === "Listening" ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">听力错误原因</p>
              <div className="flex flex-wrap gap-2">
                {listeningReasonOptions.map((reason) => {
                  const active = listeningReasonsForQuestion(listeningReasons, question.id).includes(reason);
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
            </div>
          ) : null}

          {result?.isAnswered ? (
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 font-medium">
                <MessageCircle data-icon="inline-start" />
                Instant feedback
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.feedback}</p>
              {isObjective && question.explanation ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  解析：{question.explanation}
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.article>
  );
}

function FeedbackBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground md:col-span-2">
      {text}
    </div>
  );
}

function listeningReasonsForQuestion(reasons: ListeningReasonMap, questionId: string) {
  return reasons[questionId] ?? [];
}

function isPracticeQuestion(value: unknown): value is PracticeQuestion {
  const candidate = value as Partial<PracticeQuestion>;

  return Boolean(
    candidate &&
      typeof candidate.id === "string" &&
      typeof candidate.paper === "string" &&
      typeof candidate.part === "string" &&
      typeof candidate.skill === "string" &&
      typeof candidate.type === "string" &&
      typeof candidate.title === "string" &&
      typeof candidate.prompt === "string",
  );
}
