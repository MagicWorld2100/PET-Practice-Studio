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
const listeningReasons: ListeningErrorReason[] = ["没听到", "反应慢", "词不会", "选项混淆"];

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
    ...(weakestPaper ? [`近 7 天较弱 paper：${weakestPaper.paper}，客观题正确率 ${weakestPaper.accuracy}%。`] : []),
    ...(listeningReason ? [`听力主要错因：${listeningReason.reason}。`] : []),
    ...topTags.map((item) => `${item.tag}: ${item.count} 次。`),
  ].slice(0, 3);

  while (keyProblems.length < 3) {
    keyProblems.push(
      attempts.length < 3
        ? "数据还不够，先完成 3-5 次短练习再看趋势。"
        : "暂时没有新的明显问题，保持短练和复盘。",
    );
  }

  return {
    completedContent:
      todayAttempts.length === 0
        ? "今天还没有新的提交记录。"
        : `今天提交 ${todayAttempts.length} 次；最近 7 天共 ${last7Days.length} 次。${
            latestSession ? ` 最近一次 session 完成 ${latestSession.totalAttempts} 次提交。` : ""
          }`,
    obviousProgress:
      attempts.length === 0
        ? "暂时没有足够数据判断进步。"
        : analytics.writingTaskCompletion.total > 0
          ? `Writing 信息点完成率 ${analytics.writingTaskCompletion.rate}%，可以先肯定任务完成度。`
          : latestSpeaking
            ? `Speaking 最近一次输出约 ${latestSpeaking.wordCount} 词，已经开始形成可追踪输出。`
            : "孩子已经开始留下可复盘的练习记录，这是今天最明显的进步。",
    keyProblems,
    tomorrowTasks: [
      listeningReason
        ? `做 1 题 Listening，重点复盘“${listeningReason.reason}”。`
        : weakestPaper
          ? `做 2 题 ${weakestPaper.paper} 短练，并复盘一个错因。`
          : "做 3 题 Reading 或 Listening，先积累趋势数据。",
      "错题本里选 1 道题，让孩子说出定位词或错因。",
      "补 1 个 Writing/Speaking 输出，只看是否完整，不做重批改。",
    ],
    intervention:
      attempts.length < 5
        ? "暂不需要强介入。家长只需帮助孩子完成稳定记录。"
        : topTags.length >= 3 || Boolean(listeningReason)
          ? "建议轻度介入：陪孩子复盘最高频错因，每次控制在 5 分钟内。"
          : "不需要明显介入，保持短时练习和错题复盘即可。",
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
