import type { AnswerMap, PracticeQuestion, QuestionResult } from "@/types/question";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function wordCount(value: string) {
  return normalize(value).split(" ").filter(Boolean).length;
}

export function scoreQuestion(question: PracticeQuestion, answers: AnswerMap): QuestionResult {
  const value = answers[question.id] ?? "";
  const words = wordCount(value);
  const isAnswered = value.trim().length > 0;

  if (question.type === "writing") {
    const minWords = question.minWords ?? 35;
    const idealWords = question.idealWords ?? 70;
    const checklistHits =
      question.checklist?.filter((item) => normalize(value).includes(normalize(item))).length ?? 0;
    const wordScore = Math.min(words / idealWords, 1) * 70;
    const completionScore = words >= minWords ? 20 : 0;
    const checklistScore = Math.min(checklistHits * 5, 10);
    const score = Math.round(wordScore + completionScore + checklistScore);

    return {
      questionId: question.id,
      isAnswered,
      isCorrect: null,
      score,
      maxScore: 100,
      feedback:
        words < minWords
          ? `目前约 ${words} 词，先补足到 ${minWords} 词以上。`
          : `目前约 ${words} 词，内容长度已达到基础要求。`,
      tags: question.diagnosisTags ?? [],
    };
  }

  if (question.type === "speaking") {
    const minWords = question.minWords ?? 25;
    const idealWords = question.idealWords ?? 55;
    const score = Math.round(Math.min(words / idealWords, 1) * 100);

    return {
      questionId: question.id,
      isAnswered,
      isCorrect: null,
      score,
      maxScore: 100,
      feedback:
        words < minWords
          ? `回答偏短，建议至少说到 ${minWords} 词左右。`
          : "回答长度达到基础要求，下一步可以增加地点、动作和推测。",
      tags: question.diagnosisTags ?? [],
    };
  }

  const expected = String(question.answer ?? "");
  const isCorrect = isAnswered && normalize(value) === normalize(expected);

  return {
    questionId: question.id,
    isAnswered,
    isCorrect,
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    feedback: !isAnswered ? "还没有作答。" : isCorrect ? "回答正确。" : "答案不匹配，请看解析。",
    tags: isCorrect ? [] : question.diagnosisTags ?? [],
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
