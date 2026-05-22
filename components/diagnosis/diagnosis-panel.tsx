import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DiagnosisSummary } from "@/lib/diagnostics";

export function DiagnosisPanel({ diagnosis }: { diagnosis: DiagnosisSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>轻量诊断</CardTitle>
        <CardDescription>给孩子看的短反馈：完成了什么、哪里容易错、下一题做什么。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <SummaryBlock title="今日表现" body={diagnosis.todayPerformance} />
          <SummaryBlock title="完成了什么" body={diagnosis.completedWork} />
          <SummaryBlock title="正确率" body={diagnosis.accuracy} />
          <SummaryBlock title="最容易错的 part" body={diagnosis.weakestPart} />
          <SummaryBlock title="最需要注意的技能点" body={diagnosis.keySkill} />
          <SummaryBlock title="下一题建议" body={diagnosis.nextQuestionSuggestion} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <IssueList title="问题标签" items={diagnosis.issues} empty="暂时没有明显问题标签。" />
          <IssueList
            title="听力错因"
            items={diagnosis.listeningReasons}
            empty="暂时没有记录听力错因。"
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
                <span>{item.count} 次</span>
              </div>
              <p className="mt-2">{item.advice}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
