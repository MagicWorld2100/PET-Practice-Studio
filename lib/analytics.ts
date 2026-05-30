import type {
  AttemptRecord,
  LearningAnalyticsSummary,
  ListeningErrorReason,
  ParentReport,
  PetPaper,
  PracticeQuestion,
  PracticeSession,
  QuestionResult,
} from "@/types/question";
import type { ParentFeedback } from "@/lib/diagnostics";

const papers: PetPaper[] = ["Reading", "Listening", "Writing", "Speaking"];
const listeningReasons: ListeningErrorReason[] = [
  "missed-key-information",
  "slow-reaction",
  "unknown-words",
  "option-confusion",
];

export function createPracticeSession(mode: PracticeSession["mode"]): PracticeSession {
  const now = new Date().toISOString();
  return {
    sessionId: `${mode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    mode,
    startedAt: now,
    attemptIds: [],
    papersCovered: [],
    totalAttempts: 0,
    correctObjectiveCount: 0,
    objectiveAttemptCount: 0,
    objectiveAccuracy: 0,
  };
}

export function createAttemptRecord({
  question,
  result,
  answer,
  sessionId,
  listeningErrorReason,
  timeSpentSec,
}: {
  question: PracticeQuestion;
  result: QuestionResult;
  answer: string;
  sessionId: string;
  listeningErrorReason?: ListeningErrorReason;
  timeSpentSec: number;
}): AttemptRecord {
  return {
    attemptId: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    questionId: question.id,
    sessionId,
    paper: question.paper,
    part: question.part,
    topic: question.topic,
    difficulty: question.difficulty,
    type: question.type,
    answer,
    correct: result.isCorrect ?? undefined,
    correctAnswer: question.answer,
    diagnosisTags: result.tags,
    listeningErrorReason,
    timeSpentSec,
    wordCount: question.type === "writing" ? result.wordCount : undefined,
    checklistHits: result.checklistHits?.length,
    missingChecklistItems: result.missingItems?.map((item) => item.label),
    speakingWordCount: question.type === "speaking" ? result.wordCount : undefined,
    submittedAt: new Date().toISOString(),
  };
}

export function updateSessionWithAttempt(session: PracticeSession, attempt: AttemptRecord): PracticeSession {
  const attemptIds = [...session.attemptIds, attempt.attemptId];
  const papersCovered = [...new Set([...session.papersCovered, attempt.paper])];
  const objectiveAttempts = attempt.correct === undefined ? 0 : 1;
  const totalObjective = session.objectiveAttemptCount + objectiveAttempts;
  const correctObjectiveCount = session.correctObjectiveCount + (attempt.correct ? 1 : 0);

  return {
    ...session,
    attemptIds,
    papersCovered,
    totalAttempts: attemptIds.length,
    correctObjectiveCount,
    objectiveAttemptCount: totalObjective,
    objectiveAccuracy: totalObjective === 0 ? 0 : correctObjectiveCount / totalObjective,
  };
}

export function completeSession(session: PracticeSession): PracticeSession {
  const completedAt = new Date().toISOString();
  return {
    ...session,
    completedAt,
    durationSec: Math.max(0, Math.round((Date.parse(completedAt) - Date.parse(session.startedAt)) / 1000)),
  };
}

export function buildLearningAnalytics(attempts: AttemptRecord[]): LearningAnalyticsSummary {
  const now = Date.now();
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayAttempts = attempts.filter((attempt) => attempt.submittedAt.slice(0, 10) === todayKey);
  const last7DaysAttempts = attempts.filter(
    (attempt) => now - Date.parse(attempt.submittedAt) <= 7 * 24 * 60 * 60 * 1000,
  );
  const objectiveAttempts = attempts.filter((attempt) => attempt.correct !== undefined);
  const readingObjective = objectiveAttempts.filter((attempt) => attempt.paper === "Reading");
  const writingAttempts = attempts.filter((attempt) => attempt.paper === "Writing");
  const writingHits = writingAttempts.reduce((sum, attempt) => sum + (attempt.checklistHits ?? 0), 0);
  const writingTotal = writingAttempts.reduce(
    (sum, attempt) => sum + (attempt.checklistHits ?? 0) + (attempt.missingChecklistItems?.length ?? 0),
    0,
  );

  return {
    todayAttempts: todayAttempts.length,
    last7DaysAttempts: last7DaysAttempts.length,
    accuracyByPaper: papers.map((paper) => buildAccuracy(paper, objectiveAttempts)),
    readingPartPerformance: [...new Set(readingObjective.map((attempt) => attempt.part))]
      .sort((a, b) => a.localeCompare(b))
      .map((part) => buildPartAccuracy(part, readingObjective)),
    listeningReasons: listeningReasons
      .map((reason) => ({
        reason,
        count: attempts.filter((attempt) => attempt.listeningErrorReason === reason).length,
      }))
      .filter((item) => item.count > 0),
    topWeakTags: topCounts(
      attempts.flatMap((attempt) => (attempt.correct === true ? [] : attempt.diagnosisTags)),
    ),
    writingTaskCompletion: {
      completed: writingHits,
      total: writingTotal,
      rate: writingTotal === 0 ? 0 : Math.round((writingHits / writingTotal) * 100),
    },
    speakingLengthTrend: attempts
      .filter((attempt) => attempt.paper === "Speaking")
      .slice(-8)
      .map((attempt) => ({
        submittedAt: attempt.submittedAt,
        wordCount: attempt.speakingWordCount ?? 0,
      })),
  };
}

export function buildTrendAwareParentFeedback(
  attempts: AttemptRecord[],
  sessions: PracticeSession[],
): ParentFeedback {
  const analytics = buildLearningAnalytics(attempts);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayAttempts = attempts.filter((attempt) => attempt.submittedAt.slice(0, 10) === todayKey);
  const last7Days = attempts.filter(
    (attempt) => Date.now() - Date.parse(attempt.submittedAt) <= 7 * 24 * 60 * 60 * 1000,
  );
  const weakestPaper = analytics.accuracyByPaper
    .filter((item) => item.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy)[0];
  const listeningReason = analytics.listeningReasons[0];
  const topTags = analytics.topWeakTags.slice(0, 3);
  const latestSpeaking = analytics.speakingLengthTrend.at(-1);
  const latestSession = sessions.at(-1);
  const keyProblems = [
    ...(weakestPaper ? [`Weakest paper in the last 7 days: ${weakestPaper.paper}, objective accuracy ${weakestPaper.accuracy}%.`] : []),
    ...(listeningReason ? [`Main listening reason: ${listeningReason.reason}.`] : []),
    ...topTags.map((item) => `${item.tag}: ${item.count} times.`),
  ].slice(0, 3);

  while (keyProblems.length < 3) {
    keyProblems.push(
      attempts.length < 3
        ? "There is not enough data yet. Complete 3-5 short practices before reading trends."
        : "No obvious new issue yet. Keep short practice and review steady.",
    );
  }

  return {
    completedContent:
      todayAttempts.length === 0
        ? "No new submissions today."
        : `Submitted ${todayAttempts.length} times today; ${last7Days.length} times in the last 7 days.${
            latestSession ? ` The latest session had ${latestSession.totalAttempts} submissions.` : ""
          }`,
    obviousProgress:
      attempts.length === 0
        ? "There is not enough data yet to judge progress."
        : analytics.writingTaskCompletion.total > 0
          ? `Writing task point completion is ${analytics.writingTaskCompletion.rate}%. Start by acknowledging task completion.`
          : latestSpeaking
            ? `The latest Speaking output was about ${latestSpeaking.wordCount} words, so output is becoming trackable.`
            : "The learner has started creating reviewable practice records. That is the clearest progress today.",
    keyProblems,
    tomorrowTasks: [
      listeningReason
        ? `Do 1 Listening question and review "${listeningReason.reason}".`
        : weakestPaper
          ? `Do 2 short ${weakestPaper.paper} questions and review one error reason.`
          : "Do 3 Reading or Listening questions to build trend data first.",
      "Choose 1 review item and ask the learner to explain the locator words or error reason.",
      "Add 1 Writing or Speaking output. Check completeness only, without heavy correction.",
    ],
    intervention:
      attempts.length < 5
        ? "No strong intervention is needed yet. A parent only needs to help the learner build a steady record."
        : topTags.length >= 3 || Boolean(listeningReason)
          ? "Light support is useful: review the most frequent error reason together, keeping each review within 5 minutes."
          : "No obvious intervention is needed. Keep practice short and review mistakes regularly.",
  };
}

export function createParentReport(feedback: ParentFeedback, sessionId?: string): ParentReport {
  return {
    reportId: `parent-report-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sessionId,
    ...feedback,
  };
}

function buildAccuracy(paper: PetPaper, attempts: AttemptRecord[]) {
  const paperAttempts = attempts.filter((attempt) => attempt.paper === paper);
  const correct = paperAttempts.filter((attempt) => attempt.correct).length;
  return {
    paper,
    correct,
    total: paperAttempts.length,
    accuracy: paperAttempts.length === 0 ? 0 : Math.round((correct / paperAttempts.length) * 100),
  };
}

function buildPartAccuracy(part: string, attempts: AttemptRecord[]) {
  const partAttempts = attempts.filter((attempt) => attempt.part === part);
  const correct = partAttempts.filter((attempt) => attempt.correct).length;
  return {
    part,
    correct,
    total: partAttempts.length,
    accuracy: partAttempts.length === 0 ? 0 : Math.round((correct / partAttempts.length) * 100),
  };
}

function topCounts(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
}
