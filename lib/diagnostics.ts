import type { ListeningReasonMap, PracticeQuestion, QuestionResult } from "@/types/question";

export function buildDiagnosisSummary(
  questions: PracticeQuestion[],
  results: QuestionResult[],
  listeningReasons: ListeningReasonMap,
) {
  const tagCounts = new Map<string, number>();

  for (const result of results) {
    if (!result.isAnswered || result.isCorrect === true) continue;
    for (const tag of result.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  for (const reasons of Object.values(listeningReasons)) {
    for (const reason of reasons) {
      tagCounts.set(reason, (tagCounts.get(reason) ?? 0) + 1);
    }
  }

  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({
      tag,
      count,
      advice: adviceForTag(tag),
    }));
}

export function buildParentFeedback(
  questions: PracticeQuestion[],
  results: QuestionResult[],
) {
  const answered = results.filter((result) => result.isAnswered).length;
  const needsReview = results.filter((result) => result.isAnswered && result.isCorrect === false);
  const writingSpeaking = questions.filter(
    (question) => question.type === "writing" || question.type === "speaking",
  );

  return {
    headline:
      answered === 0
        ? "孩子还没有开始练习，可以先从 Reading 或 Listening 的短题进入。"
        : `本次已完成 ${answered}/${questions.length} 题，建议家长先看错题解析，再看表达类输出。`,
    reviewItems: needsReview.map((result) => result.questionId),
    expressionCount: writingSpeaking.length,
    nextStep:
      needsReview.length > 0
        ? "今天重点复盘错题原因，不需要一次做太多新题。"
        : "客观题表现稳定，可以增加一题 Writing 或 Speaking 输出练习。",
  };
}

function adviceForTag(tag: string) {
  const advice: Record<string, string> = {
    "notice-detail": "读通知题时圈出地点、时间、动作三个信息。",
    "place-change": "看到 not / instead / change 这类词时，优先确认最终地点。",
    "careful-reading": "判断题先找原文证据，再决定 true / false。",
    "always-never": "注意 always、never 等绝对词，通常是陷阱。",
    "listening-detail": "听力填空先预测词性，第二遍确认拼写。",
    weekday: "星期、数字、人名是 PET 听力常见细节。",
    "option-confusion": "听力选择题要记录最后决定，不只听第一个出现的选项。",
    "changed-answer": "听到 but / actually / instead 后要更新答案。",
    "task-coverage": "写作先确认每个任务点都有一句回应。",
    "linking-words": "用 because / and / but 连接原因和对比。",
    invitation: "邮件结尾加入邀请、建议或问题，让任务更完整。",
    fluency: "口语先保证连续表达，再逐步修正语法。",
    "description-detail": "描述图片时覆盖人物、动作、地点和物品。",
    speculation: "加入 maybe / I think 这类推测句可以提高表达完整度。",
    没听到: "下次先听关键词，不要急着完整翻译每句话。",
    反应慢: "做听力前先读题并预测可能答案。",
    词不会: "把不会的高频词加入复习清单。",
    选项混淆: "听到多个选项时，标记被否定或改变的选项。",
  };

  return advice[tag] ?? "建议把这类错误收集起来，下一次做同主题短练习。";
}
