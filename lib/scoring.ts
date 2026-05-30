import type {
  AnswerMap,
  PracticeQuestion,
  QuestionResult,
  WritingChecklistItem,
} from "@/types/question";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getWordCount(value: string) {
  const normalized = normalize(value);
  return normalized ? normalized.split(" ").filter(Boolean).length : 0;
}

function matchesPattern(value: string, pattern: string) {
  const normalized = normalize(value);
  const lowerPattern = pattern.toLowerCase();

  if (lowerPattern.startsWith("/") && lowerPattern.endsWith("/")) {
    try {
      return new RegExp(lowerPattern.slice(1, -1), "i").test(value);
    } catch {
      return false;
    }
  }

  return normalized.includes(lowerPattern);
}

function scoreChecklist(value: string, checklist: WritingChecklistItem[] = []) {
  const hits = checklist.filter((item) =>
    item.patterns?.some((pattern) => matchesPattern(value, pattern)),
  );
  const missingItems = checklist.filter((item) => item.required && !hits.includes(item));

  return {
    checklistHits: hits,
    missingItems,
    advice:
      missingItems[0]?.advice ??
      checklist.find((item) => !hits.includes(item))?.advice ??
      "Next time, add a more specific example so the answer sounds more natural.",
  };
}

function baseResult(question: PracticeQuestion, value: string, isAnswered: boolean) {
  return {
    questionId: question.id,
    paper: question.paper,
    part: question.part,
    skill: question.skill,
    type: question.type,
    isAnswered,
    tags: question.diagnosisTags ?? [],
  };
}

export function scoreQuestion(question: PracticeQuestion, answers: AnswerMap): QuestionResult {
  const value = answers[question.id] ?? "";
  const words = getWordCount(value);
  const isAnswered = value.trim().length > 0;

  if (question.type === "writing") {
    const minWords = question.minWords ?? 35;
    const idealWords = question.idealWords ?? 75;
    const { checklistHits, missingItems, advice } = scoreChecklist(value, question.checklist);
    const requiredItems = question.checklist?.filter((item) => item.required) ?? [];
    const requiredHitCount = requiredItems.filter((item) => checklistHits.includes(item)).length;
    const requiredScore =
      requiredItems.length === 0 ? 20 : (requiredHitCount / requiredItems.length) * 30;
    const wordScore = Math.min(words / idealWords, 1) * 55;
    const completionScore = words >= minWords ? 15 : Math.min(words / minWords, 1) * 15;
    const score = Math.round(Math.min(wordScore + completionScore + requiredScore, 100));

    return {
      ...baseResult(question, value, isAnswered),
      isCorrect: null,
      score,
      maxScore: 100,
      wordCount: words,
      checklistHits,
      missingItems,
      advice,
      feedback:
        words < minWords
          ? `About ${words} words so far. Add more detail to reach at least ${minWords} words.`
          : `About ${words} words so far. Completed ${checklistHits.length}/${question.checklist?.length ?? 0} task points.`,
    };
  }

  if (question.type === "speaking") {
    const minWords = question.minWords ?? 25;
    const idealWords = question.idealWords ?? 55;
    const score = Math.round(Math.min(words / idealWords, 1) * 100);
    const advice =
      words < minWords
        ? `Aim for at least ${minWords} words and keep the answer continuous.`
        : "Add a reason, example, or simple guess to make the answer more complete.";

    return {
      ...baseResult(question, value, isAnswered),
      isCorrect: null,
      score,
      maxScore: 100,
      wordCount: words,
      advice,
      feedback:
        words < minWords
          ? `The answer is short: about ${words} words.`
          : `The answer meets the basic length target: about ${words} words.`,
    };
  }

  const expected = String(question.answer ?? "");
  const isCorrect = isAnswered && normalize(value) === normalize(expected);

  return {
    ...baseResult(question, value, isAnswered),
    isCorrect,
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    tags: isCorrect ? [] : question.diagnosisTags ?? [],
    feedback: !isAnswered ? "No answer yet." : isCorrect ? "Correct." : "The answer does not match. Check the explanation.",
  };
}

export function scoreQuestionBank(questions: PracticeQuestion[], answers: AnswerMap) {
  const results = questions.map((question) => scoreQuestion(question, answers));
  const answered = results.filter((result) => result.isAnswered).length;
  const objective = results.filter((result) => result.isCorrect !== null);
  const objectiveCorrect = objective.filter((result) => result.isCorrect).length;
  const heuristicAverage =
    results.length === 0
      ? 0
      : Math.round(
          (results.reduce((sum, result) => sum + result.score / result.maxScore, 0) /
            results.length) *
            100,
        );

  return {
    results,
    answered,
    total: questions.length,
    objectiveCorrect,
    objectiveTotal: objective.length,
    heuristicAverage,
  };
}
