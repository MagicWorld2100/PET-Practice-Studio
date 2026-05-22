"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExplanationPanel } from "@/components/practice/explanation-panel";
import { ListeningControls } from "@/components/practice/listening-controls";
import { ObjectiveQuestion } from "@/components/practice/objective-question";
import { SpeakingQuestion } from "@/components/practice/speaking-question";
import { WritingQuestion } from "@/components/practice/writing-question";
import type {
  ListeningErrorReason,
  ListeningReasonMap,
  PracticeQuestion,
  QuestionResult,
} from "@/types/question";

const listeningReasonOptions: ListeningErrorReason[] = ["没听到", "反应慢", "词不会", "选项混淆"];

export function QuestionCard({
  question,
  answer,
  result,
  listeningReasons,
  onAnswer,
  onToggleListeningReason,
}: {
  question: PracticeQuestion;
  answer: string;
  result?: QuestionResult;
  listeningReasons: ListeningReasonMap;
  onAnswer: (questionId: string, value: string) => void;
  onToggleListeningReason: (questionId: string, reason: ListeningErrorReason) => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{question.paper}</Badge>
                <Badge variant="outline">{question.part}</Badge>
                <Badge variant="outline">{question.difficulty}</Badge>
                <Badge variant="outline">{question.type}</Badge>
              </div>
              <CardTitle>{question.title}</CardTitle>
              <CardDescription>{question.topic}</CardDescription>
            </div>
            {result?.isAnswered ? (
              <Badge variant={result.isCorrect === false ? "outline" : "default"}>
                {result.isCorrect === null
                  ? `${result.score}/${result.maxScore}`
                  : result.isCorrect
                    ? "Correct"
                    : "Review"}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg bg-muted/60 p-4 text-sm leading-6">
            <p className="font-medium">{question.prompt}</p>
            {question.audioLabel ? (
              <p className="mt-2 text-muted-foreground">Audio: {question.audioLabel}</p>
            ) : null}
            {question.paper !== "Listening" && question.passage ? (
              <p className="mt-3 text-muted-foreground">{question.passage}</p>
            ) : null}
            {question.paper === "Listening" && question.passage ? (
              <p className="mt-3 text-muted-foreground">{question.passage}</p>
            ) : null}
            {question.question ? <p className="mt-3 font-medium">{question.question}</p> : null}
          </div>

          {question.paper === "Listening" ? (
            <ListeningControls question={question} canReveal={Boolean(result?.isAnswered)} />
          ) : null}

          {question.type === "writing" ? (
            <WritingQuestion question={question} answer={answer} result={result} onAnswer={onAnswer} />
          ) : question.type === "speaking" ? (
            <SpeakingQuestion question={question} answer={answer} result={result} onAnswer={onAnswer} />
          ) : (
            <ObjectiveQuestion question={question} answer={answer} onAnswer={onAnswer} />
          )}

          {question.assessmentFocus?.length ? (
            <div className="flex flex-wrap gap-2">
              {question.assessmentFocus.map((focus) => (
                <Badge key={focus} variant="secondary">
                  {focus}
                </Badge>
              ))}
            </div>
          ) : null}

          {question.paper === "Listening" && result?.isAnswered && result.isCorrect === false ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">听力错误原因</p>
              <div className="flex flex-wrap gap-2">
                {listeningReasonOptions.map((reason) => {
                  const active = (listeningReasons[question.id] ?? []).includes(reason);
                  return (
                    <Button
                      key={reason}
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() => onToggleListeningReason(question.id, reason)}
                    >
                      {reason}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {result ? <ExplanationPanel question={question} result={result} /> : null}
        </CardContent>
      </Card>
    </motion.article>
  );
}
