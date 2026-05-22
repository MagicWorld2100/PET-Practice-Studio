import type { Difficulty, PetPaper, PracticeQuestion } from "@/types/question";

export type PracticeFilters = {
  paper: PetPaper | "All";
  part: string;
  topic: string;
  difficulty: Difficulty | "All";
};

export const defaultFilters: PracticeFilters = {
  paper: "All",
  part: "All",
  topic: "All",
  difficulty: "All",
};

export function filterQuestions(questions: PracticeQuestion[], filters: PracticeFilters) {
  return questions.filter((question) => {
    const paperMatches = filters.paper === "All" || question.paper === filters.paper;
    const partMatches = filters.part === "All" || question.part === filters.part;
    const topicMatches = filters.topic === "All" || question.topic === filters.topic;
    const difficultyMatches =
      filters.difficulty === "All" || question.difficulty === filters.difficulty;

    return paperMatches && partMatches && topicMatches && difficultyMatches;
  });
}

export function getAvailableParts(questions: PracticeQuestion[], paper: PetPaper | "All") {
  const scoped = paper === "All" ? questions : questions.filter((question) => question.paper === paper);
  return unique(scoped.map((question) => question.part));
}

export function getAvailableTopics(questions: PracticeQuestion[], paper: PetPaper | "All") {
  const scoped = paper === "All" ? questions : questions.filter((question) => question.paper === paper);
  return unique(scoped.map((question) => question.topic));
}

export function isPracticeQuestion(value: unknown): value is PracticeQuestion {
  const candidate = value as Partial<PracticeQuestion>;

  return Boolean(
    candidate &&
      typeof candidate.id === "string" &&
      isPaper(candidate.paper) &&
      typeof candidate.part === "string" &&
      typeof candidate.skill === "string" &&
      typeof candidate.type === "string" &&
      typeof candidate.topic === "string" &&
      typeof candidate.title === "string" &&
      typeof candidate.prompt === "string",
  );
}

function isPaper(value: unknown): value is PetPaper {
  return value === "Reading" || value === "Listening" || value === "Writing" || value === "Speaking";
}

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
