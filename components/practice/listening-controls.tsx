"use client";

import { useState } from "react";
import { Eye, EyeOff, Play, Repeat2, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PracticeQuestion } from "@/types/question";

export function ListeningControls({
  question,
  canReveal,
}: {
  question: PracticeQuestion;
  canReveal: boolean;
}) {
  const [showTranscript, setShowTranscript] = useState(false);
  const text = question.transcript ?? question.passage ?? "";

  function speak(times: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();

    for (let index = 0; index < times; index += 1) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  }

  function stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => speak(1)}>
          <Play data-icon="inline-start" />
          Play once
        </Button>
        <Button size="sm" variant="outline" onClick={() => speak(2)}>
          <Repeat2 data-icon="inline-start" />
          Play twice
        </Button>
        <Button size="sm" variant="outline" onClick={stop}>
          <Square data-icon="inline-start" />
          Stop
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!canReveal}
          onClick={() => setShowTranscript((current) => !current)}
        >
          {showTranscript ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
          {showTranscript ? "Hide transcript" : "Show transcript after answering"}
        </Button>
      </div>
      <p className="text-sm font-medium text-foreground">
        Listen first. Do not read the transcript before answering.
      </p>
      {showTranscript && canReveal ? (
        <p className="text-sm leading-6 text-muted-foreground">Transcript: {text}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Transcript is hidden now. Use Play once or Play twice first.
        </p>
      )}
    </div>
  );
}
