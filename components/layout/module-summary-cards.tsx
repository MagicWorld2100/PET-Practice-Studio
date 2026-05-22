import { Card, CardContent } from "@/components/ui/card";
import { paperMeta } from "@/components/layout/paper-meta";
import { paperOrder } from "@/data/sample-bank";
import { cn } from "@/lib/utils";
import type { AnswerMap, PracticeQuestion } from "@/types/question";

export function ModuleSummaryCards({
  questions,
  answers,
}: {
  questions: PracticeQuestion[];
  answers: AnswerMap;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {paperOrder.map((paper) => {
        const items = questions.filter((question) => question.paper === paper);
        const done = items.filter((question) => Boolean(answers[question.id]?.trim())).length;
        const Icon = paperMeta[paper].icon;

        return (
          <Card key={paper}>
            <CardContent className="flex items-center gap-4 p-4">
              <span
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-md",
                  paperMeta[paper].tone,
                )}
              >
                <Icon data-icon="inline-start" />
              </span>
              <div>
                <p className="font-medium">{paperMeta[paper].label}</p>
                <p className="text-sm text-muted-foreground">
                  {done}/{items.length} completed
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
