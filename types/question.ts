export type PetPaper = "Reading" | "Listening" | "Writing" | "Speaking";

export type PetSkill = "reading" | "listening" | "writing" | "speaking";

export type QuestionType =
  | "single_choice"
  | "true_false"
  | "gap_fill"
  | "writing"
  | "speaking";

export type Difficulty = "foundation" | "standard" | "stretch";

export type ListeningErrorReason =
  | "missed-key-information"
  | "slow-reaction"
  | "unknown-words"
  | "option-confusion";
export type LearningDataVersion = "0.1.3";

export type QuestionOption = {
  id: string;
  label: string;
};

export type WritingChecklistItem = {
  id: string;
  label: string;
  patterns?: string[];
  required?: boolean;
  advice?: string;
};

export type ExplanationDetails = {
  tests?: string;
  locatorWords?: string[];
  whyCorrect?: string;
  whyWrong?: string;
  nextStep?: string;
};

export type PracticeQuestion = {
  id: string;
  paper: PetPaper;
  part: string;
  skill: PetSkill;
  type: QuestionType;
  difficulty: Difficulty;
  topic: string;
  title: string;
  prompt: string;
  passage?: string;
  transcript?: string;
  question?: string;
  options?: QuestionOption[];
  answer?: string | boolean;
  explanation?: string;
  explanationDetails?: ExplanationDetails;
  diagnosisTags?: string[];
  checklist?: WritingChecklistItem[];
  support?: string[];
  assessmentFocus?: string[];
  minWords?: number;
  idealWords?: number;
  audioLabel?: string;
};

export type AnswerMap = Record<string, string>;

export type ListeningReasonMap = Record<string, ListeningErrorReason[]>;

export type QuestionResult = {
  questionId: string;
  paper: PetPaper;
  part: string;
  skill: PetSkill;
  type: QuestionType;
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  maxScore: number;
  feedback: string;
  tags: string[];
  wordCount?: number;
  checklistHits?: WritingChecklistItem[];
  missingItems?: WritingChecklistItem[];
  advice?: string;
};

export type ScoreSummary = {
  results: QuestionResult[];
  answered: number;
  total: number;
  objectiveCorrect: number;
  objectiveTotal: number;
  heuristicAverage: number;
};

export type AttemptResult = QuestionResult & {
  answer: string;
  completedAt: string;
  listeningErrorReasons?: ListeningErrorReason[];
};

export type MockSession = {
  id: string;
  title: string;
  mode: "coverage";
  questionIds: string[];
  currentIndex: number;
  startedAt: string;
  completedAt?: string;
  results: AttemptResult[];
  summary?: {
    completed: number;
    objectiveCorrect: number;
    objectiveTotal: number;
    average: number;
    weakestPaper?: PetPaper | "No data";
    topTags?: string[];
    recommendedNextTraining?: string;
  };
};

export type AttemptRecord = {
  attemptId: string;
  questionId: string;
  sessionId: string;
  paper: PetPaper;
  part: string;
  topic: string;
  difficulty: string;
  type: QuestionType;
  answer: unknown;
  correct?: boolean;
  correctAnswer?: unknown;
  diagnosisTags: string[];
  listeningErrorReason?: ListeningErrorReason;
  timeSpentSec: number;
  wordCount?: number;
  checklistHits?: number;
  missingChecklistItems?: string[];
  speakingWordCount?: number;
  submittedAt: string;
};

export type PracticeSession = {
  sessionId: string;
  mode: "practice" | "coverageMock" | "review";
  startedAt: string;
  completedAt?: string;
  attemptIds: string[];
  papersCovered: string[];
  totalAttempts: number;
  correctObjectiveCount: number;
  objectiveAttemptCount: number;
  objectiveAccuracy: number;
  durationSec?: number;
};

export type LearningAnalyticsSummary = {
  todayAttempts: number;
  last7DaysAttempts: number;
  accuracyByPaper: { paper: PetPaper; correct: number; total: number; accuracy: number }[];
  readingPartPerformance: { part: string; correct: number; total: number; accuracy: number }[];
  listeningReasons: { reason: ListeningErrorReason; count: number }[];
  topWeakTags: { tag: string; count: number }[];
  writingTaskCompletion: { completed: number; total: number; rate: number };
  speakingLengthTrend: { submittedAt: string; wordCount: number }[];
};

export type ParentReport = {
  reportId: string;
  createdAt: string;
  sessionId?: string;
  completedContent: string;
  obviousProgress: string;
  keyProblems: string[];
  tomorrowTasks: string[];
  intervention: string;
};

export type ProgressState = {
  version: LearningDataVersion;
  answers: AnswerMap;
  listeningReasons: ListeningReasonMap;
  importedQuestions: PracticeQuestion[];
  attempts: AttemptRecord[];
  sessions: PracticeSession[];
  mockSessions: MockSession[];
  parentReports: ParentReport[];
  settings: Record<string, unknown>;
  activeSessionId?: string;
  latestMockSessionId?: string;
  updatedAt: string;
};

export type LocalLearningExport = {
  version: "0.1.3";
  exportedAt: string;
  questionBank: PracticeQuestion[];
  answers: AnswerMap;
  attempts: AttemptRecord[];
  sessions: PracticeSession[];
  mockSessions: MockSession[];
  parentReports: ParentReport[];
  settings: Record<string, unknown>;
};
