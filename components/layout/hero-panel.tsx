import { Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ScoreSummary } from "@/types/question";

export function HeroPanel({ scoring }: { scoring: ScoreSummary }) {
  const progressValue =
    scoring.total === 0 ? 0 : Math.round((scoring.answered / scoring.total) * 100);
  const attemptedObjective = scoring.results.filter(
    (result) => result.isAnswered && result.type !== "writing" && result.type !== "speaking",
  ).length;
  const attemptedAccuracy =
    attemptedObjective === 0 ? 0 : Math.round((scoring.objectiveCorrect / attemptedObjective) * 100);

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
            Choose a question, answer it, then get instant feedback and a clear next step.
          </p>
        </div>
      </div>
      <Card className="w-full lg:max-w-xl">
        <CardHeader className="p-4 pb-2">
          <CardTitle>Today&apos;s progress</CardTitle>
          <CardDescription>
            Completed {scoring.answered}/{scoring.total} - Objective accuracy{" "}
            {attemptedObjective ? `${scoring.objectiveCorrect}/${attemptedObjective}` : "No data"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 p-4 pt-0">
          <Progress value={progressValue} />
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3">
              <span>Coverage</span>
              <span className="font-medium text-foreground">{progressValue}%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Attempted accuracy</span>
              <span className="font-medium text-foreground">
                {attemptedObjective ? `${attemptedAccuracy}%` : "No data"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
