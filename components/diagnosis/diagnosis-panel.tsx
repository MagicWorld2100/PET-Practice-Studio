import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DiagnosisSummary } from "@/lib/diagnostics";

export function DiagnosisPanel({ diagnosis }: { diagnosis: DiagnosisSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick diagnosis</CardTitle>
        <CardDescription>A short review of completed work, likely weak points, and the next step.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <SummaryBlock title="Today" body={diagnosis.todayPerformance} />
          <SummaryBlock title="Completed work" body={diagnosis.completedWork} />
          <SummaryBlock title="Accuracy" body={diagnosis.accuracy} />
          <SummaryBlock title="Weakest part" body={diagnosis.weakestPart} />
          <SummaryBlock title="Key skill" body={diagnosis.keySkill} />
          <SummaryBlock title="Next step" body={diagnosis.nextQuestionSuggestion} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <IssueList title="Issue tags" items={diagnosis.issues} empty="No clear issue tags yet." />
          <IssueList
            title="Listening reasons"
            items={diagnosis.listeningReasons}
            empty="No listening reasons recorded yet."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function IssueList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { tag: string; count: number; advice: string }[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-medium">{title}</p>
      <div className="mt-3 flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          items.slice(0, 5).map((item) => (
            <div key={item.tag} className="text-sm leading-6 text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary">{item.tag}</Badge>
                <span>{item.count} times</span>
              </div>
              <p className="mt-2">{item.advice}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
