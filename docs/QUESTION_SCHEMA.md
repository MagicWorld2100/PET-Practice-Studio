# Question Schema

Question data is local TypeScript data in Sprint 1. The schema is designed so future database rows, AI-generated items, and audio-file-backed listening questions can use the same shape.

## Core Type

```ts
type PracticeQuestion = {
  id: string;
  paper: "Reading" | "Listening" | "Writing" | "Speaking";
  part: string;
  skill: "reading" | "listening" | "writing" | "speaking";
  type: "single_choice" | "true_false" | "gap_fill" | "writing" | "speaking";
  difficulty: "foundation" | "standard" | "stretch";
  topic: string;
  title: string;
  prompt: string;
  passage?: string;
  transcript?: string;
  question?: string;
  options?: { id: string; label: string }[];
  answer?: string | boolean;
  explanation?: string;
  explanationDetails?: {
    tests?: string;
    locatorWords?: string[];
    whyCorrect?: string;
    whyWrong?: string;
  };
  diagnosisTags?: string[];
  checklist?: WritingChecklistItem[];
  support?: string[];
  assessmentFocus?: string[];
  minWords?: number;
  idealWords?: number;
  audioLabel?: string;
};
```

## Writing Checklist

Writing does not match Chinese checklist labels against student answers. It uses rule-based checklist items:

```ts
type WritingChecklistItem = {
  id: string;
  label: string;
  patterns?: string[];
  required?: boolean;
  advice?: string;
};
```

Patterns are simple English phrases or slash-delimited regular expressions, for example:

```ts
{
  id: "reason",
  label: "Explain why you like it",
  patterns: ["because", "so", "i enjoy", "i like"],
  required: true,
  advice: "Add one reason using because, so, or a clear opinion phrase."
}
```

Scoring returns:

- word count
- completed checklist items
- missing required items
- score
- short advice

## Listening Fields

Sprint 1 Listening uses browser TTS:

- `transcript` is read with `speechSynthesis`
- `audioLabel` describes the demo audio
- transcript is hidden before answering
- future real audio support can add an audio file URL without removing TTS fallback

## Objective Items

Objective items should include:

- `options` for multiple-choice or true/false
- `answer`
- `explanation`
- `explanationDetails.tests`
- `explanationDetails.locatorWords`
- `explanationDetails.whyCorrect`
- `explanationDetails.whyWrong`

## Import Notes

The Import tab accepts a single question object or an array of question objects. A valid imported question must include at least:

- `id`
- `paper`
- `part`
- `skill`
- `type`
- `topic`
- `title`
- `prompt`

Sprint 1 validation is intentionally light. Stronger schema validation is a Sprint 2 candidate.
