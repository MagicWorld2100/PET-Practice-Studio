import { scoreQuestion } from "@/lib/scoring";
import type { AnswerMap, ListeningReasonMap, MockSession, PetPaper, PracticeQuestion } from "@/types/question";

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
  listeningReasons: ListeningReasonMap = {},
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
      listeningErrorReasons: listeningReasons[result.questionId] ?? [],
    }));
  const objective = results.filter((result) => result.isCorrect !== null);
  const objectiveCorrect = objective.filter((result) => result.isCorrect).length;
  const weakestPaper = findWeakestPaper(results);
  const topTags = findTopTags(results);
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
      weakestPaper,
      topTags,
      recommendedNextTraining: recommendTraining(weakestPaper, topTags),
    },
  };
}

function findWeakestPaper(results: MockSession["results"]) {
  const byPaper = new Map<PetPaper, { total: number; score: number }>();

  for (const result of results) {
    const current = byPaper.get(result.paper) ?? { total: 0, score: 0 };
    byPaper.set(result.paper, {
      total: current.total + 1,
      score: current.score + result.score / result.maxScore,
    });
  }

  const weakest = [...byPaper.entries()]
    .map(([paper, value]) => ({ paper, average: value.total ? value.score / value.total : 0 }))
    .sort((a, b) => a.average - b.average)[0];

  return weakest?.paper ?? "暂无";
}

function findTopTags(results: MockSession["results"]) {
  const counts = new Map<string, number>();

  for (const result of results) {
    if (result.isCorrect === true) continue;
    for (const tag of result.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    for (const reason of result.listeningErrorReasons ?? []) {
      counts.set(`listening-${reason}`, (counts.get(`listening-${reason}`) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
}

function recommendTraining(weakestPaper: PetPaper | "暂无", topTags: string[]) {
  if (weakestPaper !== "暂无") return `Tomorrow: do 2 ${weakestPaper} short questions, then review one mistake.`;
  if (topTags[0]) return `Tomorrow: practise one short question for ${topTags[0]}.`;
  return "Tomorrow: do 3 short Reading or Listening questions.";
}
