"use client";

import { Bot, CheckCircle2, Database, Download, FileUp, Import, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
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
  onResetProgressOnly,
  onResetAllLocalData,
  onLoadSampleData,
  bankIsEmpty,
  totalQuestions,
  importedQuestions,
}: {
  importText: string;
  exportText: string;
  message: string;
  onImportTextChange: (value: string) => void;
  onImportQuestions: () => void;
  onExportLearningData: () => void;
  onImportLearningData: () => void;
  onResetProgressOnly: () => void;
  onResetAllLocalData: () => void;
  onLoadSampleData: () => void;
  bankIsEmpty: boolean;
  totalQuestions: number;
  importedQuestions: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Question Bank</CardTitle>
          <CardDescription>
            Create, import, review, and approve PET practice questions before they enter the live bank.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <BankStat title="Live questions" value={String(totalQuestions)} detail="Demo and approved imported items" />
          <BankStat title="Imported locally" value={String(importedQuestions)} detail="Stored in this browser" />
          <BankStat title="Draft queue" value="0" detail="Needs backend AI/file processing" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <WorkflowCard
          icon={<Bot data-icon="inline-start" />}
          title="Generate with AI"
          status="Planned backend"
          body="Generate PET-aligned questions by paper, part, topic, difficulty, answer key, explanation, and diagnosis tags."
          actions={["Choose PET scope", "Generate draft set", "Review before publishing"]}
        />
        <WorkflowCard
          icon={<FileUp data-icon="inline-start" />}
          title="Import from file"
          status="Needs parser/OCR"
          body="Accept PDF, images, Word files, or scanned worksheets. The backend should extract text, structure questions, and return drafts."
          actions={["Upload file", "Extract with OCR/parser", "Map to PET schema"]}
        />
        <WorkflowCard
          icon={<CheckCircle2 data-icon="inline-start" />}
          title="Review drafts"
          status="Quality gate"
          body="AI-generated and file-recognized items should stay in a draft queue until a user confirms the question, answer, and explanation."
          actions={["Preview question", "Edit metadata", "Approve into bank"]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File intake design</CardTitle>
          <CardDescription>
            This local UI now shows the intended product flow. Actual PDF/image/Word recognition needs a backend endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="font-medium">Accepted sources</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">PDF</Badge>
              <Badge variant="secondary">Image OCR</Badge>
              <Badge variant="secondary">Word DOCX</Badge>
              <Badge variant="secondary">AI generated</Badge>
            </div>
            <div className="mt-4 rounded-md border bg-background p-3 text-sm text-muted-foreground">
              Uploads should become editable drafts first. Nothing should go directly into the live question bank.
            </div>
          </div>
          <div className="grid gap-3">
            <PipelineStep step="1" title="Extract" body="Read text and layout from PDF, image, or Word." />
            <PipelineStep step="2" title="Structure" body="Convert content into the PracticeQuestion schema with options, answer, explanation, and tags." />
            <PipelineStep step="3" title="Approve" body="User confirms quality before the question becomes available in Practice or Mock." />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Advanced local tools</CardTitle>
            <CardDescription>
              Temporary developer import path. This should not be the main product workflow.
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
              <Button variant="outline" onClick={onResetProgressOnly}>
                <RotateCcw data-icon="inline-start" />
                Reset practice progress only
              </Button>
              <Button variant="outline" onClick={onResetAllLocalData}>
                <RotateCcw data-icon="inline-start" />
                Reset all local data
              </Button>
              {bankIsEmpty ? (
                <Button variant="outline" onClick={onLoadSampleData}>
                  Load sample data
                </Button>
              ) : null}
              <Button variant="outline" onClick={onImportLearningData}>
                <Import data-icon="inline-start" />
                Import progress
              </Button>
              <Button onClick={onImportQuestions}>
                <Import data-icon="inline-start" />
                Import bank JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export local learning data</CardTitle>
            <CardDescription>
              The export includes the question bank, answers, history, mock sessions, timestamp, and version.
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
    </div>
  );
}

function BankStat({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Database data-icon="inline-start" />
        {title}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function WorkflowCard({
  icon,
  title,
  status,
  body,
  actions,
}: {
  icon: ReactNode;
  title: string;
  status: string;
  body: string;
  actions: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          <Badge variant="outline">{status}</Badge>
        </div>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action, index) => (
          <div key={action} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-foreground">
              {index + 1}
            </span>
            {action}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PipelineStep({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-lg border bg-card p-3">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {step}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
