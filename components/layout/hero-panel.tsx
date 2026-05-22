import { Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ScoreSummary } from "@/types/question";

export function HeroPanel({ scoring }: { scoring: ScoreSummary }) {
  const progressValue =
    scoring.total === 0 ? 0 : Math.round((scoring.answered / scoring.total) * 100);

  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div className="flex max-w-3xl flex-col gap-2">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles data-icon="inline-start" />
          </span>
          Cambridge B1 Preliminary for Schools
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            PET Practice Studio
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            选择题目后直接作答，系统会即时检查并给出下一步建议。
          </p>
        </div>
      </div>
      <Card className="w-full lg:max-w-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle>今日进度</CardTitle>
          <CardDescription>
            {scoring.answered}/{scoring.total} 已完成 · 客观题 {scoring.objectiveCorrect}/
            {scoring.objectiveTotal} 正确
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 p-4 pt-0">
          <Progress value={progressValue} />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>综合完成度</span>
            <span className="font-medium text-foreground">{progressValue}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
