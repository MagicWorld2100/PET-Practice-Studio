# PET Practice Studio

PET Practice Studio is a browser-based practice app for Cambridge B1 Preliminary for Schools (PET). It is designed for children, parents, and tutors who want short, focused Reading, Listening, Writing, and Speaking practice with instant checking and simple feedback.

This repository is initialized as a clean Next.js App Router project with TypeScript, Tailwind CSS, shadcn-style UI primitives, lucide-react icons, and framer-motion.

## Current MVP Scope

- PET practice dashboard with module summary cards.
- Local sample question bank in `data/sample-bank.ts`.
- Support for `single_choice`, `true_false`, `gap_fill`, `writing`, and `speaking` items.
- Per-paper filtering for Reading, Listening, Writing, and Speaking.
- Instant checking for objective questions.
- Simple heuristic scoring for Writing and Speaking.
- Listening error reason tags: `没听到`, `反应慢`, `词不会`, `选项混淆`.
- Explanation panel after answers are entered.
- Lightweight diagnosis summary.
- Parent feedback summary.
- JSON import textarea for local question-bank trials.
- localStorage persistence for answers, imported questions, and listening reason tags.

The MVP does not implement backend services yet. Audio playback, database persistence, authentication, mock-test generation, and AI explanations are intentionally left as future integration points.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Project Structure

```text
app/
  page.tsx
  layout.tsx
  globals.css
components/
  pet-practice-studio.tsx
  ui/
data/
  sample-bank.ts
docs/
  ROADMAP.md
lib/
  diagnostics.ts
  scoring.ts
  storage.ts
  utils.ts
types/
  question.ts
```

## Question Model

The local question type supports:

- `id`
- `paper`
- `part`
- `skill`
- `type`
- `topic`
- `title`
- `prompt`
- `passage`
- `question`
- `options`
- `answer`
- `explanation`
- `diagnosisTags`
- `checklist`
- `support`
- `minWords`
- `idealWords`
- `audioLabel`

## Future Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).

Suggested follow-up issues:

- Add real Listening audio playback and transcript fixtures.
- Add a review mode for wrong answers and weak diagnosis tags.
- Add a typed question-bank validator for imported JSON.
- Add database persistence after the local MVP is stable.
- Add an AI explanation API behind a clear service boundary.
