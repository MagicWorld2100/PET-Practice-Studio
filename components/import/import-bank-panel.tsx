"use client";

import { Download, Import, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ImportBankPanel({
  importText,
  exportText,
  message,
  onImportTextChange,
  onImportQuestions,
  onExportLearningData,
  onImportLearningData,
  onReset,
}: {
  importText: string;
  exportText: string;
  message: string;
  onImportTextChange: (value: string) => void;
  onImportQuestions: () => void;
  onExportLearningData: () => void;
  onImportLearningData: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>JSON 题库 / 学习数据导入</CardTitle>
          <CardDescription>
            支持粘贴题目数组，也支持 Sprint 1 learning export JSON。全部保存在 localStorage。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            value={importText}
            onChange={(event) => onImportTextChange(event.target.value)}
            className="min-h-72 font-mono"
            placeholder='[{"id":"reading-custom-1","paper":"Reading","part":"Part 1","skill":"reading","type":"single_choice","difficulty":"foundation","topic":"school life","title":"Custom question","prompt":"Read and answer","options":[{"id":"A","label":"Option A"}],"answer":"A"}]'
          />
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onReset}>
              <RotateCcw data-icon="inline-start" />
              Reset local data
            </Button>
            <Button variant="outline" onClick={onImportLearningData}>
              <Import data-icon="inline-start" />
              Import progress
            </Button>
            <Button onClick={onImportQuestions}>
              <Import data-icon="inline-start" />
              Import bank
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export local learning data</CardTitle>
          <CardDescription>
            导出包含 bank、answers、results、mockSessions、exportedAt 和 version。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            readOnly
            value={exportText}
            className="min-h-72 font-mono"
            placeholder="Click export to generate local learning JSON."
          />
          <Button onClick={onExportLearningData}>
            <Download data-icon="inline-start" />
            Export JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
