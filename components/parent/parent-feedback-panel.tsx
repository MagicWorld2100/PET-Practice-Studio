import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParentFeedback } from "@/lib/diagnostics";

export function ParentFeedbackPanel({
  feedback,
  onEndSession,
}: {
  feedback: ParentFeedback;
  onEndSession?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>家长反馈摘要</CardTitle>
            <CardDescription>简短、可执行，不把一次练习讲成长期结论。</CardDescription>
          </div>
          {onEndSession ? (
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm font-medium"
              onClick={onEndSession}
            >
              End current session
            </button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <FeedbackBlock title="1. 今日完成内容" body={feedback.completedContent} />
        <FeedbackBlock title="2. 今日最明显进步" body={feedback.obviousProgress} />
        <ListBlock title="3. 今日三个关键问题" items={feedback.keyProblems} />
        <ListBlock title="4. 明日建议任务" items={feedback.tomorrowTasks} />
        <div className="lg:col-span-2">
          <FeedbackBlock title="5. 家长是否需要介入，以及如何介入" body={feedback.intervention} />
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
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
