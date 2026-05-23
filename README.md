# PET Practice Studio

## Current Status

**v0.1.2 — Sprint 1.2 Baseline**

The app now supports a child-usable PET practice loop:
Practice → Check → Feedback → Diagnosis → Parent Feedback.
PET Practice Studio is a browser-based Cambridge B1 Preliminary for Schools practice app for family use. Sprint 1 focuses on making the full local learning loop usable by a child in the browser, then giving parents a concise view of progress and next steps.

This is not a commercial public launch and not an official Cambridge mock-test product. All sample practice content in this repository is original demo content, not copied from copyrighted past papers.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style local components
- lucide-react
- framer-motion
- localStorage persistence

## Run Locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Run checks:

```bash
npm run lint
npm run build
```

## Sprint 1 MVP Scope

A child can:

- Choose PET paper, part, topic, and difficulty
- Complete Reading, Listening, Writing, and Speaking practice
- Get instant checking and explanations for objective questions
- Use browser TTS playback for Listening v0
- Tag Listening mistakes as `没听到`, `反应慢`, `词不会`, or `选项混淆`
- Get rule-based Writing feedback with word count, task-point hits, missing points, score, and advice
- Get lightweight Speaking feedback based on output length
- Start a small Coverage Mock session across PET skills
- Export/import local learning data as JSON

A parent can:

- See today’s completed work
- See the most obvious progress
- See three key problems
- See tomorrow’s suggested tasks
- See whether parent intervention is needed

## Local-First Storage

Sprint 1 intentionally uses localStorage only. There is no login, database, payment, permissions system, or commercial deployment layer.

Stored local data includes:

- answers
- Listening mistake reasons
- every submitted attempt
- practice session history
- parent report snapshots
- imported local questions
- latest Coverage Mock sessions

The Import / Export tab can export a local learning JSON object:

```ts
{
  version: "0.1.3",
  exportedAt,
  questionBank,
  answers,
  attempts,
  sessions,
  mockSessions,
  parentReports,
  settings
}
```

## Coverage Mock

Coverage Mock is a short learning-flow check, not an official timed mock and not equivalent to a real Cambridge exam paper. It currently selects:

- Reading: 6 questions, one per Reading part
- Listening: 4 questions, one per Listening part
- Writing: 1 task
- Speaking: 2 tasks

## Project Structure

```text
app/
components/
  analytics/
  diagnosis/
  import/
  layout/
  mock/
  parent/
  practice/
  ui/
data/
docs/
lib/
types/
```

Key files:

- `components/pet-practice-studio.tsx` - state orchestration and tab layout
- `data/sample-bank.ts` - original local sample bank
- `lib/scoring.ts` - objective, writing, and speaking scoring
- `lib/diagnostics.ts` - child diagnosis and parent feedback
- `lib/mock.ts` - Coverage Mock session helpers
- `lib/storage.ts` - localStorage helpers
- `types/question.ts` - question, result, progress, and export types

## Documentation

- [Roadmap](docs/ROADMAP.md)
- [Question schema](docs/QUESTION_SCHEMA.md)
- [Sprint 1 issue backlog](docs/SPRINT-1-ISSUES.md)
- [Sprint 1.2 local issue backlog](docs/SPRINT-1-2-ISSUES.md)
- [Sprint 1.2 manual QA checklist](docs/QA-Sprint-1-2.md)
- [Sprint 1.3 issue links](docs/SPRINT-1-3-ISSUES.md)
- [Sprint 1.3 manual QA checklist](docs/QA-Sprint-1-3.md)
- [Family trial log template](docs/TRIAL-LOG.md)

## Future Roadmap

Sprint 2 candidates:

- AI-generated mock paper blueprint
- AI explanation API placeholder
- Real audio file support
- Review mode / wrong answer notebook
- Spaced repetition for vocabulary and mistakes
- Database and user profiles
- Weekly parent report
