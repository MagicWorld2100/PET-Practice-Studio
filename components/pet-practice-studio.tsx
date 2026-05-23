"use client";

import { useEffect, useMemo, useState } from "react";

import { DiagnosisPanel } from "@/components/diagnosis/diagnosis-panel";
import { ImportBankPanel } from "@/components/import/import-bank-panel";
import { HeroPanel } from "@/components/layout/hero-panel";
import { CoverageMockPanel } from "@/components/mock/coverage-mock-panel";
import { ParentFeedbackPanel } from "@/components/parent/parent-feedback-panel";
import { PracticePanel } from "@/components/practice/practice-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sampleQuestionBank } from "@/data/sample-bank";
import { buildDiagnosisSummary, buildParentFeedback } from "@/lib/diagnostics";
import { completeMockSession, createCoverageMockSession } from "@/lib/mock";
import {
  defaultFilters,
  filterQuestions,
  isPracticeQuestion,
  type PracticeFilters,
} from "@/lib/questions";
import { scoreQuestionBank } from "@/lib/scoring";
import {
  clearProgress,
  defaultProgressState,
  isLearningExport,
  loadProgress,
  saveProgress,
} from "@/lib/storage";
import type {
  ListeningErrorReason,
  LocalLearningExport,
  MockSession,
  ProgressState,
} from "@/types/question";

export function PetPracticeStudio() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [filters, setFilters] = useState<PracticeFilters>(defaultFilters);
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");
  const [importMessage, setImportMessage] = useState("");

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const allQuestions = useMemo(
    () => mergeQuestionBanks(sampleQuestionBank, progress.importedQuestions),
    [progress.importedQuestions],
  );
  const visibleQuestions = useMemo(
    () => filterQuestions(allQuestions, filters),
    [allQuestions, filters],
  );
  const visibleScoring = useMemo(
    () => scoreQuestionBank(visibleQuestions, progress.answers),
    [visibleQuestions, progress.answers],
  );
  const allScoring = useMemo(
    () => scoreQuestionBank(allQuestions, progress.answers),
    [allQuestions, progress.answers],
  );
  const diagnosis = useMemo(
    () => buildDiagnosisSummary(allQuestions, allScoring, progress.listeningReasons),
    [allQuestions, allScoring, progress.listeningReasons],
  );
  const parentFeedback = useMemo(
    () => buildParentFeedback(allQuestions, allScoring, diagnosis),
    [allQuestions, allScoring, diagnosis],
  );
  const latestMockSession = progress.mockSessions.find(
    (session) => session.id === progress.latestMockSessionId,
  );
  const mockQuestions = useMemo(
    () =>
      latestMockSession?.questionIds
        .map((id) => allQuestions.find((question) => question.id === id))
        .filter((question): question is (typeof allQuestions)[number] => Boolean(question)) ?? [],
    [allQuestions, latestMockSession],
  );
  const mockScoring = useMemo(
    () => scoreQuestionBank(mockQuestions, progress.answers),
    [mockQuestions, progress.answers],
  );

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
      const parsed = JSON.parse(importText) as unknown;
      const incoming = Array.isArray(parsed) ? parsed : [parsed];
      const valid = incoming.filter(isPracticeQuestion);

      if (valid.length === 0) {
        setImportMessage("没有找到可导入的题目。请检查 JSON 字段。");
        return;
      }

      setProgress((current) => ({
        ...current,
        importedQuestions: mergeQuestionBanks(current.importedQuestions, valid),
      }));
      setImportMessage(`已导入 ${valid.length} 题。重复 id 会被新版本替换。`);
    } catch {
      setImportMessage("JSON 解析失败，请检查格式。");
    }
  }

  function exportLearningData() {
    const exportObject: LocalLearningExport = {
      bank: allQuestions,
      answers: progress.answers,
      results: allScoring.results,
      listeningReasons: progress.listeningReasons,
      mockSessions: progress.mockSessions,
      exportedAt: new Date().toISOString(),
      version: 1,
    };

    setExportText(JSON.stringify(exportObject, null, 2));
    setImportMessage("已生成本地学习数据导出 JSON。");
  }

  function importLearningData() {
    try {
      const parsed = JSON.parse(importText) as unknown;
      if (!isLearningExport(parsed)) {
        setImportMessage("这不是有效的 Sprint 1 learning export JSON。");
        return;
      }

      const importedOnly = parsed.bank.filter(
        (question) => !sampleQuestionBank.some((sample) => sample.id === question.id),
      );

      setProgress((current) => ({
        ...current,
        answers: parsed.answers,
        listeningReasons: parsed.listeningReasons ?? {},
        importedQuestions: mergeQuestionBanks(current.importedQuestions, importedOnly),
        mockSessions: parsed.mockSessions,
        latestMockSessionId: parsed.mockSessions.at(-1)?.id,
      }));
      setImportMessage("已恢复本地学习数据。");
    } catch {
      setImportMessage("学习数据 JSON 解析失败，请检查格式。");
    }
  }

  function resetProgressOnly() {
    if (!window.confirm("Reset answers, listening reasons, and mock results? Imported questions will stay.")) {
      return;
    }
    setProgress((current) => ({
      ...defaultProgressState,
      importedQuestions: current.importedQuestions,
    }));
    setExportText("");
    setImportMessage("Practice progress has been reset. Imported questions stayed.");
  }

  function resetAllLocalData() {
    if (!window.confirm("Reset all local data, including imported questions and practice progress?")) {
      return;
    }
    clearProgress();
    setProgress(defaultProgressState);
    setImportText("");
    setExportText("");
    setImportMessage("All local data has been reset.");
  }

  function loadSampleData() {
    setProgress((current) => ({
      ...current,
      importedQuestions: [],
    }));
    setImportMessage("Sample practice bank is ready.");
  }

  function startCoverageMock() {
    const session = createCoverageMockSession(allQuestions);
    setProgress((current) => ({
      ...current,
      mockSessions: [...current.mockSessions, session],
      latestMockSessionId: session.id,
    }));
  }

  function moveMock(index: number) {
    updateLatestMock((session) => ({
      ...session,
      currentIndex: Math.max(0, Math.min(index, session.questionIds.length - 1)),
    }));
  }

  function finishMock() {
    if (!latestMockSession) return;
    const completed = completeMockSession(
      latestMockSession,
      allQuestions,
      progress.answers,
      progress.listeningReasons,
    );
    updateLatestMock(() => completed);
  }

  function updateLatestMock(update: (session: MockSession) => MockSession) {
    setProgress((current) => ({
      ...current,
      mockSessions: current.mockSessions.map((session) =>
        session.id === current.latestMockSessionId ? update(session) : session,
      ),
    }));
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <HeroPanel scoring={allScoring} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="practice">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="mock">Coverage Mock</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="parent">Parent Feedback</TabsTrigger>
            <TabsTrigger value="import">Import / Export</TabsTrigger>
          </TabsList>

          <TabsContent value="practice">
            <PracticePanel
              allQuestions={allQuestions}
              visibleQuestions={visibleQuestions}
              filters={filters}
              answers={progress.answers}
              results={visibleScoring.results}
              listeningReasons={progress.listeningReasons}
              onFiltersChange={setFilters}
              onAnswer={updateAnswer}
              onToggleListeningReason={toggleListeningReason}
            />
          </TabsContent>

          <TabsContent value="mock">
            <CoverageMockPanel
              session={latestMockSession}
              questions={mockQuestions}
              answers={progress.answers}
              results={mockScoring.results}
              listeningReasons={progress.listeningReasons}
              onStart={startCoverageMock}
              onMove={moveMock}
              onComplete={finishMock}
              onAnswer={updateAnswer}
              onToggleListeningReason={toggleListeningReason}
            />
          </TabsContent>

          <TabsContent value="diagnosis">
            <DiagnosisPanel diagnosis={diagnosis} />
          </TabsContent>

          <TabsContent value="parent">
            <ParentFeedbackPanel feedback={parentFeedback} />
          </TabsContent>

          <TabsContent value="import">
            <ImportBankPanel
              importText={importText}
              exportText={exportText}
              message={importMessage}
              onImportTextChange={setImportText}
              onImportQuestions={importQuestions}
              onExportLearningData={exportLearningData}
              onImportLearningData={importLearningData}
              onResetProgressOnly={resetProgressOnly}
              onResetAllLocalData={resetAllLocalData}
              onLoadSampleData={loadSampleData}
              bankIsEmpty={allQuestions.length === 0}
            />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

function mergeQuestionBanks<T extends { id: string }>(base: T[], incoming: T[]) {
  const map = new Map(base.map((item) => [item.id, item]));
  for (const item of incoming) {
    map.set(item.id, item);
  }
  return [...map.values()];
}
