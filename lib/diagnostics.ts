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
  const objectiveAccuracy =
    scoring.objectiveTotal === 0
      ? "暂无客观题正确率"
      : `${Math.round((scoring.objectiveCorrect / scoring.objectiveTotal) * 100)}%`;
  const partMistakes = countBy(
    answeredResults.filter((result) => result.isCorrect === false),
    (result) => `${result.paper} ${result.part}`,
  );
  const weakestPart = topEntry(partMistakes)?.[0] ?? "暂无明显薄弱 part";
  const issueItems = buildIssueItems(answeredResults);
  const listeningItems = buildListeningItems(listeningReasons);
  const completedPapers = new Set(
    answeredResults.map((result) => `${result.paper} ${result.part}`),
  );

  return {
    todayPerformance:
      answeredResults.length === 0
        ? "今天还没有完成练习。先做 2-3 道短题，让系统开始记录表现。"
        : `今天已完成 ${answeredResults.length}/${questions.length} 题，综合完成度 ${scoring.heuristicAverage}%。`,
    completedWork:
      completedPapers.size === 0
        ? "暂无完成记录。"
        : `已触达：${[...completedPapers].slice(0, 6).join("、")}${
            completedPapers.size > 6 ? " 等" : ""
          }。`,
    accuracy: objectiveAccuracy,
    weakestPart,
    keySkill: issueItems[0]?.tag ?? listeningItems[0]?.tag ?? "暂无高频问题",
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
  const expressionResults = answered.filter(
    (result) => result.type === "writing" || result.type === "speaking",
  );
  const writingResult = answered.find((result) => result.type === "writing");
  const speakingResult = answered.find((result) => result.type === "speaking");
  const listeningReason = diagnosis.listeningReasons[0];
  const topProblems = [
    ...diagnosis.issues.map((item) => `${item.tag}: ${item.advice}`),
    ...diagnosis.listeningReasons.map((item) => `听力-${item.tag}: ${item.advice}`),
  ].slice(0, 3);

  while (topProblems.length < 3) {
    topProblems.push(
      answered.length === 0
        ? "先完成一组 Reading/Listening 短题，积累可判断的数据。"
        : "暂时没有新的高频问题，保持短练和复盘节奏。",
    );
  }

  return {
    completedContent:
      answered.length === 0
        ? "今天还没有完成练习。"
        : `今天完成 ${answered.length}/${questions.length} 题，客观题正确 ${scoring.objectiveCorrect}/${scoring.objectiveTotal}。${
            writingResult
              ? ` Writing 完成 ${writingResult.checklistHits?.length ?? 0}/${
                  (writingResult.checklistHits?.length ?? 0) + (writingResult.missingItems?.length ?? 0)
                } 个信息点。`
              : ""
          }${speakingResult ? ` Speaking 输出约 ${speakingResult.wordCount ?? 0} 词。` : ""}`,
    obviousProgress:
      expressionResults.length > 0
        ? "孩子已经开始输出 Writing/Speaking，建议优先肯定完成度，再看细节。"
        : answered.length > 0
          ? "孩子已经完成短题并能看到即时解析，这是今天最明显的进步。"
          : "暂时没有足够数据判断进步。",
    keyProblems: topProblems,
    tomorrowTasks: [
      listeningReason
        ? `先做 1 题 Listening，重点处理“${listeningReason.tag}”：${listeningReason.advice}`
        : diagnosis.weakestPart === "暂无明显薄弱 part"
          ? "做 3 道 Reading 或 Listening foundation/standard 题。"
          : `复盘 ${diagnosis.weakestPart}，再做 2 道同 part 短题。`,
      "补一题 Writing 或 Speaking，只要求完整回答，不追求完美。",
      "把一个错因标签讲给家长听，确认孩子知道错在哪里。",
    ],
    intervention:
      scoring.answered < 3
        ? "暂不需要强介入。家长只需陪孩子开始并完成前三题。"
        : diagnosis.issues.length >= 3 || diagnosis.listeningReasons.length >= 2
          ? "建议轻度介入：家长陪同复盘错题定位词和听力错因，不要长时间讲解。"
          : "不需要明显介入。保持短时、稳定练习即可。",
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
  if (answeredResults.length === 0) return "建议先做 Reading Part 1 或 Listening Part 1。";
  if (weakestPart !== "暂无明显薄弱 part") return `下一题建议继续练 ${weakestPart}。`;
  if (issueItems[0]) return `下一题建议针对 ${issueItems[0].tag} 做一题短练。`;
  return "下一题建议进入 Coverage Mock，检查四项技能是否均衡。";
}

function adviceForTag(tag: string) {
  const advice: Record<string, string> = {
    "notice-detail": "读通知题时圈出地点、时间、动作三个信息。",
    "place-change": "看到 not / instead / change 这类词时，优先确认最终地点。",
    "matching-detail": "Part 2 先划出人物需求，再排除不符合的选项。",
    preference: "注意 likes / does not enjoy / wants 这类偏好词。",
    "long-text-reason": "长文本题先找题干关键词，再回原文定位原因句。",
    evidence: "每道 Reading 题都要能指出原文证据。",
    cohesion: "Gapped text 关注前后句的指代和逻辑关系。",
    "cause-effect": "看到 after that / because / so 时判断因果链。",
    "vocabulary-context": "Cloze 题要根据前后语义选词，不只看中文意思。",
    collocation: "积累常见搭配，做题时读完整句。",
    "grammar-pronoun": "Open cloze 注意介词后的人称代词形式。",
    "open-cloze": "先判断词性，再决定一个词答案。",
    "listening-detail": "听力填空先预测词性，第二遍确认细节。",
    weekday: "星期、数字、人名是 PET 听力常见细节。",
    "option-confusion": "听力选择题要记录最后决定，不只听第一个出现的选项。",
    "changed-answer": "听到 but / actually / instead 后要更新答案。",
    contrast: "注意 but / instead / actually 后面的真实信息。",
    opinion: "观点题要抓最终态度，而不是开头铺垫。",
    "locator-word": "听前先圈题干定位词，听到同义表达时立刻记录。",
    "task-coverage": "写作先确认每个任务点都有一句回应。",
    "linking-words": "用 because / and / but 连接原因和对比。",
    invitation: "邮件结尾加入邀请、建议或问题，让任务更完整。",
    "article-structure": "Article 需要开头点题、主体举例、结尾推荐。",
    recommendation: "文章结尾加入建议或推荐，任务更完整。",
    detail: "加入具体例子会比泛泛表达更像 B1 输出。",
    fluency: "口语先保证连续表达，再逐步修正语法。",
    "description-detail": "描述图片时覆盖人物、动作、地点和物品。",
    speculation: "加入 maybe / I think 这类推测句可以提高表达完整度。",
    "personal-response": "Part 1 用个人真实经历回答，不要只说一个词。",
    collaboration: "Part 3 需要回应伙伴想法，可用 What about 或 I agree。",
    reasons: "表达观点后补一个 because 原因。",
    example: "用 for example 加一个生活例子。",
    "extended-answer": "Part 4 避免一句话结束，至少给观点和理由。",
    "writing-task-points": "写作先补齐缺失任务点，再优化语法。",
    "speaking-length": "口语回答偏短，先练 3 句结构：观点、原因、例子。",
    没听到: "下次先听关键词，不要急着完整翻译每句话。",
    反应慢: "做听力前先读题并预测可能答案。",
    词不会: "把不会的高频词加入复习清单。",
    选项混淆: "听到多个选项时，标记被否定或改变的选项。",
  };

  return advice[tag] ?? "建议把这类错误收集起来，下一次做同主题短练习。";
}
