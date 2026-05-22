import { Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ScoreSummary } from "@/types/question";

export function HeroPanel({ scoring }: { scoring: ScoreSummary }) {
  const progressValue =
    scoring.total === 0 ? 0 : Math.round((scoring.answered / scoring.total) * 100);

  return (
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div className="flex max-w-3xl flex-col gap-4">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles data-icon="inline-start" />
          </span>
          Cambridge B1 Preliminary for Schools
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            PET Practice Studio
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            面向孩子和家长的 PET 练习工作台：短练、即时检查、轻量诊断、Coverage
            Mock 和本地学习数据导入导出。
          </p>
        </div>
      </div>
      <Card className="w-full lg:max-w-sm">
        <CardHeader>
          <CardTitle>今日进度</CardTitle>
          <CardDescription>
            {scoring.answered}/{scoring.total} 已完成 · 客观题 {scoring.objectiveCorrect}/
            {scoring.objectiveTotal} 正确
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
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
