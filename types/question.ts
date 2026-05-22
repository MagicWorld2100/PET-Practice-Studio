export type PetPaper = "Reading" | "Listening" | "Writing" | "Speaking";

export type PetSkill = "reading" | "listening" | "writing" | "speaking";

export type QuestionType =
  | "single_choice"
  | "true_false"
  | "gap_fill"
  | "writing"
  | "speaking";

export type ListeningErrorReason = "没听到" | "反应慢" | "词不会" | "选项混淆";

export type QuestionOption = {
  id: string;
  label: string;
};

export type PracticeQuestion = {
  id: string;
  paper: PetPaper;
  part: string;
  skill: PetSkill;
  type: QuestionType;
  topic: string;
  title: string;
  prompt: string;
  passage?: string;
  question?: string;
  options?: QuestionOption[];
  answer?: string | boolean;
  explanation?: string;
  diagnosisTags?: string[];
  checklist?: string[];
  support?: string[];
  minWords?: number;
  idealWords?: number;
  audioLabel?: string;
};

export type AnswerMap = Record<string, string>;

export type ListeningReasonMap = Record<string, ListeningErrorReason[]>;

export type QuestionResult = {
  questionId: string;
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  maxScore: number;
  feedback: string;
  tags: string[];
};

export type ProgressState = {
  answers: AnswerMap;
  listeningReasons: ListeningReasonMap;
  importedQuestions: PracticeQuestion[];
  updatedAt: string;
};
