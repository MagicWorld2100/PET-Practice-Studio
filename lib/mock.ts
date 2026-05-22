import { scoreQuestion } from "@/lib/scoring";
import type { AnswerMap, MockSession, PracticeQuestion } from "@/types/question";

const coverageTargets = [
  ["Reading", "Part 1"],
  ["Reading", "Part 2"],
  ["Reading", "Part 3"],
  ["Reading", "Part 4"],
  ["Reading", "Part 5"],
  ["Reading", "Part 6"],
  ["Listening", "Part 1"],
  ["Listening", "Part 2"],
  ["Listening", "Part 3"],
  ["Listening", "Part 4"],
  ["Writing", "Part 1"],
  ["Speaking", "Part 2"],
  ["Speaking", "Part 3"],
] as const;

export function createCoverageMockSession(bank: PracticeQuestion[]): MockSession {
  const questionIds = coverageTargets
    .map(([paper, part]) => {
      const candidates = bank.filter((question) => question.paper === paper && question.part === part);
      return candidates[Math.floor(Math.random() * candidates.length)]?.id;
    })
    .filter(Boolean) as string[];

  const now = new Date().toISOString();

  return {
    id: `coverage-${Date.now()}`,
    title: "Coverage Mock",
    mode: "coverage",
    questionIds,
    currentIndex: 0,
    startedAt: now,
    results: [],
  };
}

export function completeMockSession(
  session: MockSession,
  bank: PracticeQuestion[],
  answers: AnswerMap,
): MockSession {
  const questions = session.questionIds
    .map((id) => bank.find((question) => question.id === id))
    .filter(Boolean) as PracticeQuestion[];
  const results = questions
    .map((question) => scoreQuestion(question, answers))
    .filter((result) => result.isAnswered)
    .map((result) => ({
      ...result,
      answer: answers[result.questionId] ?? "",
      completedAt: new Date().toISOString(),
    }));
  const objective = results.filter((result) => result.isCorrect !== null);
  const objectiveCorrect = objective.filter((result) => result.isCorrect).length;
  const average =
    results.length === 0
      ? 0
      : Math.round(
          (results.reduce((sum, result) => sum + result.score / result.maxScore, 0) /
            results.length) *
            100,
        );

  return {
    ...session,
    currentIndex: Math.max(session.questionIds.length - 1, 0),
    completedAt: new Date().toISOString(),
    results,
    summary: {
      completed: results.length,
      objectiveCorrect,
      objectiveTotal: objective.length,
      average,
    },
  };
}
