import type {
  ListeningReasonMap,
  PracticeQuestion,
  QuestionResult,
  ScoreSummary,
} from "@/types/question";

export type DiagnosisItem = {
  tag: string;
  count: number;
  advice: string;
};

export type DiagnosisSummary = {
  todayPerformance: string;
  completedWork: string;
  accuracy: string;
  weakestPart: string;
  keySkill: string;
  nextQuestionSuggestion: string;
  issues: DiagnosisItem[];
  listeningReasons: DiagnosisItem[];
};

export type ParentFeedback = {
  completedContent: string;
  obviousProgress: string;
  keyProblems: string[];
  tomorrowTasks: string[];
  intervention: string;
};

export function buildDiagnosisSummary(
  questions: PracticeQuestion[],
  scoring: ScoreSummary,
  listeningReasons: ListeningReasonMap,
): DiagnosisSummary {
  const answeredResults = scoring.results.filter((result) => result.isAnswered);
  const answeredObjectiveResults = answeredResults.filter(
    (result) => result.type !== "writing" && result.type !== "speaking",
  );
  const objectiveAccuracy =
    answeredObjectiveResults.length === 0
      ? "No objective accuracy yet"
      : `${scoring.objectiveCorrect}/${answeredObjectiveResults.length} (${Math.round(
          (scoring.objectiveCorrect / answeredObjectiveResults.length) * 100,
        )}%)`;
  const partMistakes = countBy(
    answeredResults.filter((result) => result.isCorrect === false),
    (result) => `${result.paper} ${result.part}`,
  );
  const weakestPart = topEntry(partMistakes)?.[0] ?? "No clear weak part";
  const issueItems = buildIssueItems(answeredResults);
  const listeningItems = buildListeningItems(listeningReasons);
  const completedPapers = new Set(answeredResults.map((result) => `${result.paper} ${result.part}`));

  return {
    todayPerformance:
      answeredResults.length === 0
        ? "No practice completed today. Start with 2-3 short questions so the system can record performance."
        : `Completed ${answeredResults.length}/${questions.length} questions today. Overall completion is ${scoring.heuristicAverage}%.`,
    completedWork:
      completedPapers.size === 0
        ? "No completion records yet."
        : `Covered: ${[...completedPapers].slice(0, 6).join(", ")}${
            completedPapers.size > 6 ? ", and more" : ""
          }.`,
    accuracy: objectiveAccuracy,
    weakestPart,
    keySkill: issueItems[0]?.tag ?? listeningItems[0]?.tag ?? "No frequent issue yet",
    nextQuestionSuggestion: suggestNextQuestion(answeredResults, weakestPart, issueItems),
    issues: issueItems,
    listeningReasons: listeningItems,
  };
}

export function buildParentFeedback(
  questions: PracticeQuestion[],
  scoring: ScoreSummary,
  diagnosis: DiagnosisSummary,
): ParentFeedback {
  const answered = scoring.results.filter((result) => result.isAnswered);
  const answeredObjective = answered.filter(
    (result) => result.type !== "writing" && result.type !== "speaking",
  );
  const expressionResults = answered.filter(
    (result) => result.type === "writing" || result.type === "speaking",
  );
  const writingResult = answered.find((result) => result.type === "writing");
  const speakingResult = answered.find((result) => result.type === "speaking");
  const listeningReason = diagnosis.listeningReasons[0];
  const topProblems = [
    ...diagnosis.issues.map((item) => `${item.tag}: ${item.advice}`),
    ...diagnosis.listeningReasons.map((item) => `Listening - ${item.tag}: ${item.advice}`),
  ].slice(0, 3);

  while (topProblems.length < 3) {
    topProblems.push(
      answered.length === 0
        ? "Complete one short Reading or Listening set first to create enough data."
        : "No new frequent issue yet. Keep short practice and review steady.",
    );
  }

  return {
    completedContent:
      answered.length === 0
        ? "No practice completed today."
        : `Completed ${answered.length}/${questions.length} questions today. Objective correct: ${
            answeredObjective.length === 0
              ? "no objective attempts yet"
              : `${scoring.objectiveCorrect}/${answeredObjective.length}`
          }. ${
            writingResult
              ? `Writing completed ${writingResult.checklistHits?.length ?? 0}/${
                  (writingResult.checklistHits?.length ?? 0) + (writingResult.missingItems?.length ?? 0)
                } task points.`
              : ""
          }${speakingResult ? ` Speaking output: about ${speakingResult.wordCount ?? 0} words.` : ""}`,
    obviousProgress:
      expressionResults.length > 0
        ? "The learner has started Writing or Speaking output. Acknowledge completion first, then review details."
        : answered.length > 0
          ? "The learner completed short questions and used instant feedback. That is the clearest progress today."
          : "There is not enough data yet to judge progress.",
    keyProblems: topProblems,
    tomorrowTasks: [
      listeningReason
        ? `Do 1 Listening question and focus on "${listeningReason.tag}": ${listeningReason.advice}`
        : diagnosis.weakestPart === "No clear weak part"
          ? "Do 3 foundation or standard Reading/Listening questions."
          : `Review ${diagnosis.weakestPart}, then do 2 more short questions from the same part.`,
      "Add 1 Writing or Speaking response. Aim for a complete answer, not perfection.",
      "Explain one error tag to a parent so the learner can say what went wrong.",
    ],
    intervention:
      scoring.answered < 3
        ? "No strong intervention is needed yet. A parent can simply help the learner start and finish the first three questions."
        : diagnosis.issues.length >= 3 || diagnosis.listeningReasons.length >= 2
          ? "Light support is useful: review locator words and listening reasons together, without long explanations."
          : "No obvious intervention is needed. Keep practice short and steady.",
  };
}

function buildIssueItems(results: QuestionResult[]) {
  const tagCounts = new Map<string, number>();

  for (const result of results) {
    if (result.isCorrect === true) continue;
    for (const tag of result.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
    if (result.type === "writing" && result.missingItems?.length) {
      tagCounts.set("writing-task-points", (tagCounts.get("writing-task-points") ?? 0) + 1);
    }
    if (result.type === "speaking" && (result.wordCount ?? 0) < 30) {
      tagCounts.set("speaking-length", (tagCounts.get("speaking-length") ?? 0) + 1);
    }
  }

  return mapCounts(tagCounts);
}

function buildListeningItems(listeningReasons: ListeningReasonMap) {
  const counts = new Map<string, number>();

  for (const reasons of Object.values(listeningReasons)) {
    for (const reason of reasons) {
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    }
  }

  return mapCounts(counts);
}

function mapCounts(counts: Map<string, number>) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({
      tag,
      count,
      advice: adviceForTag(tag),
    }));
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function topEntry(counts: Map<string, number>) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
}

function suggestNextQuestion(
  answeredResults: QuestionResult[],
  weakestPart: string,
  issueItems: DiagnosisItem[],
) {
  if (answeredResults.length === 0) return "Start with Reading Part 1 or Listening Part 1.";
  if (weakestPart !== "No clear weak part") return `Keep practising ${weakestPart}.`;
  if (issueItems[0]) return `Do one short question focused on ${issueItems[0].tag}.`;
  return "Try Coverage Mock to check balance across the four skills.";
}

function adviceForTag(tag: string) {
  const advice: Record<string, string> = {
    "notice-detail": "Circle the place, time, and action in notice questions.",
    "place-change": "When you see not, instead, or change, confirm the final place.",
    "matching-detail": "In Part 2, mark each person's need first, then remove options that do not fit.",
    preference: "Watch likes, does not enjoy, and wants.",
    "long-text-reason": "For long texts, find the question keywords, then locate the reason in the text.",
    evidence: "Every Reading answer should have text evidence.",
    cohesion: "In gapped text, track pronouns and logical links before and after the gap.",
    "cause-effect": "When you see after that, because, or so, follow the cause-effect chain.",
    "vocabulary-context": "Choose cloze answers from the surrounding meaning, not isolated words.",
    collocation: "Build common collocations and read the full sentence before choosing.",
    "grammar-pronoun": "In open cloze, check pronoun form after prepositions.",
    "open-cloze": "Identify the word class first, then choose one word.",
    "listening-detail": "Predict the word class before listening, then confirm details on the second pass.",
    weekday: "Days, numbers, and names are common PET listening details.",
    "option-confusion": "In listening choices, record the final decision, not the first option you hear.",
    "changed-answer": "After but, actually, or instead, update the answer.",
    contrast: "The real information often comes after but, instead, or actually.",
    opinion: "For opinion questions, catch the final attitude, not the opening setup.",
    "locator-word": "Circle locator words before listening and note synonyms as soon as you hear them.",
    "task-coverage": "In writing, make sure each task point has a sentence.",
    "linking-words": "Use because, and, and but to connect reasons and contrasts.",
    invitation: "End emails with an invitation, suggestion, or question.",
    "article-structure": "An article needs an opening, examples in the body, and a recommendation at the end.",
    recommendation: "Add a suggestion or recommendation at the end.",
    detail: "Specific examples sound more like B1 output than general statements.",
    fluency: "Prioritise continuous speaking first, then improve grammar.",
    "description-detail": "When describing a picture, cover people, actions, place, and objects.",
    speculation: "Use maybe or I think to add simple speculation.",
    "personal-response": "Use real personal experience in Part 1, not single-word answers.",
    collaboration: "In Part 3, respond to your partner with phrases like What about or I agree.",
    reasons: "After giving an opinion, add a because reason.",
    example: "Add a real-life example with for example.",
    "extended-answer": "In Part 4, avoid one-sentence answers. Give an opinion and a reason.",
    "writing-task-points": "Add missing task points before polishing grammar.",
    "speaking-length": "If speaking is too short, practise a 3-sentence pattern: opinion, reason, example.",
    "missed-key-information": "Next time, listen for keywords instead of translating every sentence.",
    "slow-reaction": "Before listening, read the question and predict possible answers.",
    "unknown-words": "Add frequent unknown words to a review list.",
    "option-confusion": "When multiple options appear, mark which one is denied or changed.",
  };

  return advice[tag] ?? "Collect this error type and practise one short question on the same topic next time.";
}
