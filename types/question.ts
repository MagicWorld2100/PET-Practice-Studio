export type PetPaper = "Reading" | "Listening" | "Writing" | "Speaking";

export type PetSkill = "reading" | "listening" | "writing" | "speaking";

export type QuestionType =
  | "single_choice"
  | "true_false"
  | "gap_fill"
  | "writing"
  | "speaking";

export type Difficulty = "foundation" | "standard" | "stretch";

export type ListeningErrorReason = "没听到" | "反应慢" | "词不会" | "选项混淆";

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
    weakestPaper?: PetPaper | "暂无";
    topTags?: string[];
    recommendedNextTraining?: string;
  };
};

export type ProgressState = {
  answers: AnswerMap;
  listeningReasons: ListeningReasonMap;
  importedQuestions: PracticeQuestion[];
  mockSessions: MockSession[];
  latestMockSessionId?: string;
  updatedAt: string;
};

export type LocalLearningExport = {
  bank: PracticeQuestion[];
  answers: AnswerMap;
  results: QuestionResult[];
  listeningReasons: ListeningReasonMap;
  mockSessions: MockSession[];
  exportedAt: string;
  version: 1;
};
