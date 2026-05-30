import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParentFeedback } from "@/lib/diagnostics";

export function ParentFeedbackPanel({
  feedback,
  onEndSession,
  onGenerateReport,
}: {
  feedback: ParentFeedback;
  onEndSession?: () => void;
  onGenerateReport?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Parent feedback summary</CardTitle>
            <CardDescription>Short and actionable, based only on the current practice data.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {onEndSession ? (
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm font-medium"
                onClick={onEndSession}
              >
                End current session
              </button>
            ) : null}
            {onGenerateReport ? (
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                onClick={onGenerateReport}
              >
                Generate parent report
              </button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <FeedbackBlock title="1. Completed today" body={feedback.completedContent} />
        <FeedbackBlock title="2. Clear progress" body={feedback.obviousProgress} />
        <ListBlock title="3. Key issues" items={feedback.keyProblems} />
        <ListBlock title="4. Suggested next tasks" items={feedback.tomorrowTasks} />
        <div className="lg:col-span-2">
          <FeedbackBlock title="5. Parent support" body={feedback.intervention} />
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-medium">{title}</p>
      <ul className="mt-2 flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
