"use client";

import { useEffect, useMemo, useState } from "react";

import { AnalyticsPanel } from "@/components/analytics/analytics-panel";
import { DiagnosisPanel } from "@/components/diagnosis/diagnosis-panel";
import { ImportBankPanel } from "@/components/import/import-bank-panel";
import { HeroPanel } from "@/components/layout/hero-panel";
import { CoverageMockPanel } from "@/components/mock/coverage-mock-panel";
import { ParentFeedbackPanel } from "@/components/parent/parent-feedback-panel";
import { PracticePanel } from "@/components/practice/practice-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sampleQuestionBank } from "@/data/sample-bank";
import {
  buildLearningAnalytics,
  buildTrendAwareParentFeedback,
  completeSession,
  createAttemptRecord,
  createParentReport,
  createPracticeSession,
  updateSessionWithAttempt,
} from "@/lib/analytics";
import { buildDiagnosisSummary } from "@/lib/diagnostics";
import { completeMockSession, createCoverageMockSession } from "@/lib/mock";
import {
  defaultFilters,
  filterQuestions,
  isPracticeQuestion,
  type PracticeFilters,
} from "@/lib/questions";
import { scoreQuestion, scoreQuestionBank } from "@/lib/scoring";
import {
  clearProgress,
  defaultProgressState,
  isLearningExport,
  isLegacyLearningExport,
  loadProgress,
  saveProgress,
} from "@/lib/storage";
import type {
  ListeningErrorReason,
  LocalLearningExport,
  MockSession,
  PracticeQuestion,
  PracticeSession,
  ProgressState,
} from "@/types/question";

export function PetPracticeStudio() {
  const [progress, setProgress] = useState<ProgressState>(defaultProgressState);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [filters, setFilters] = useState<PracticeFilters>(defaultFilters);
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [activeTab, setActiveTab] = useState("practice");

  useEffect(() => {
    queueMicrotask(() => {
      setProgress(loadProgress());
      setHasLoadedProgress(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedProgress) return;
    saveProgress(progress);
  }, [hasLoadedProgress, progress]);

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
    () => buildTrendAwareParentFeedback(progress.attempts, progress.sessions),
    [progress.attempts, progress.sessions],
  );
  const analytics = useMemo(
    () => buildLearningAnalytics(progress.attempts),
    [progress.attempts],
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
        attempts: current.attempts.map((attempt, index, attempts) =>
          attempt.questionId === questionId &&
          index === attempts.findLastIndex((item) => item.questionId === questionId)
            ? { ...attempt, listeningErrorReason: nextReasons[0] }
            : attempt,
        ),
      };
    });
  }

  function submitAttempt(
    question: PracticeQuestion,
    mode: PracticeSession["mode"],
    timeSpentSec: number,
    answerOverride?: string,
  ) {
    setProgress((current) => {
      const session =
        current.sessions.find((item) => item.sessionId === current.activeSessionId && !item.completedAt) ??
        createPracticeSession(mode);
      const nextAnswers =
        answerOverride === undefined
          ? current.answers
          : { ...current.answers, [question.id]: answerOverride };
      const result = scoreQuestion(question, nextAnswers);
      const attempt = createAttemptRecord({
        question,
        result,
        answer: nextAnswers[question.id] ?? "",
        sessionId: session.sessionId,
        listeningErrorReason: current.listeningReasons[question.id]?.[0],
        timeSpentSec,
      });
      const updatedSession = updateSessionWithAttempt(session, attempt);
      const existingSession = current.sessions.some((item) => item.sessionId === session.sessionId);

      return {
        ...current,
        answers: nextAnswers,
        attempts: [...current.attempts, attempt],
        sessions: existingSession
          ? current.sessions.map((item) => (item.sessionId === session.sessionId ? updatedSession : item))
          : [...current.sessions, updatedSession],
        activeSessionId: updatedSession.sessionId,
      };
    });
  }

  function endActiveSession() {
    setProgress((current) => {
      if (!current.activeSessionId) return current;
      const active = current.sessions.find(
        (session) => session.sessionId === current.activeSessionId && !session.completedAt,
      );
      if (!active) return current;
      return {
        ...current,
        sessions: current.sessions.map((session) =>
          session.sessionId === active.sessionId ? completeSession(session) : session,
        ),
        activeSessionId: undefined,
      };
    });
  }

  function handleTabChange(value: string) {
    setActiveTab(value);
    if (value === "parent") {
      setProgress((current) => {
        const feedback = buildTrendAwareParentFeedback(current.attempts, current.sessions);
        const active = current.activeSessionId;
        const sessions = active
          ? current.sessions.map((session) =>
              session.sessionId === active && !session.completedAt ? completeSession(session) : session,
            )
          : current.sessions;

        return {
          ...current,
          sessions,
          activeSessionId: undefined,
          parentReports: [...current.parentReports, createParentReport(feedback, active)],
        };
      });
    }
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
      version: "0.1.3",
      exportedAt: new Date().toISOString(),
      questionBank: allQuestions,
      answers: progress.answers,
      attempts: progress.attempts,
      sessions: progress.sessions,
      mockSessions: progress.mockSessions,
      parentReports: progress.parentReports,
      settings: progress.settings,
    };

    setExportText(JSON.stringify(exportObject, null, 2));
    setImportMessage("已生成本地学习数据导出 JSON。");
  }

  function importLearningData() {
    try {
      const parsed = JSON.parse(importText) as unknown;
      if (!isLearningExport(parsed)) {
        if (!isLegacyLearningExport(parsed)) {
          setImportMessage("这不是有效的 learning export JSON。");
          return;
        }
        const legacy = parsed as {
          bank: PracticeQuestion[];
          answers: Record<string, string>;
          mockSessions: MockSession[];
        };
        const importedOnly = legacy.bank.filter(
          (question) => !sampleQuestionBank.some((sample) => sample.id === question.id),
        );
        setProgress((current) => ({
          ...current,
          answers: legacy.answers,
          importedQuestions: mergeQuestionBanks(current.importedQuestions, importedOnly),
          mockSessions: legacy.mockSessions,
          latestMockSessionId: legacy.mockSessions.at(-1)?.id,
        }));
        setImportMessage("已恢复旧版本地学习数据。新历史记录会从下一次提交开始记录。");
        return;
      }

      const importedOnly = parsed.questionBank.filter(
        (question) => !sampleQuestionBank.some((sample) => sample.id === question.id),
      );

      setProgress((current) => ({
        ...current,
        answers: parsed.answers,
        importedQuestions: mergeQuestionBanks(current.importedQuestions, importedOnly),
        attempts: parsed.attempts,
        sessions: parsed.sessions,
        mockSessions: parsed.mockSessions,
        parentReports: parsed.parentReports,
        settings: parsed.settings,
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
    const analyticsSession = createPracticeSession("coverageMock");
    setProgress((current) => ({
      ...current,
      mockSessions: [...current.mockSessions, session],
      latestMockSessionId: session.id,
      sessions: [...current.sessions, analyticsSession],
      activeSessionId: analyticsSession.sessionId,
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
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="mock">Coverage Mock</TabsTrigger>
            <TabsTrigger value="analytics">Analytics / 学习追踪</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="parent">Parent Feedback</TabsTrigger>
            <TabsTrigger value="import">Import / Export</TabsTrigger>
          </TabsList>

          <TabsContent value="practice">
            <PracticePanel
              allQuestions={allQuestions}
              visibleQuestions={visibleQuestions}
              filters={filters}
              attempts={progress.attempts}
              results={visibleScoring.results}
              listeningReasons={progress.listeningReasons}
              onFiltersChange={setFilters}
              onAnswer={updateAnswer}
              onSubmitAttempt={(question, timeSpentSec, answer) =>
                submitAttempt(question, "practice", timeSpentSec, answer)
              }
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
              onSubmitAttempt={(question, timeSpentSec) =>
                submitAttempt(question, "coverageMock", timeSpentSec)
              }
              onToggleListeningReason={toggleListeningReason}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel
              analytics={analytics}
              attempts={progress.attempts}
              sessions={progress.sessions}
              questions={allQuestions}
            />
          </TabsContent>

          <TabsContent value="diagnosis">
            <DiagnosisPanel diagnosis={diagnosis} />
          </TabsContent>

          <TabsContent value="parent">
            <ParentFeedbackPanel feedback={parentFeedback} onEndSession={endActiveSession} />
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
