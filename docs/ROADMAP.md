# PET Practice Studio Roadmap

PET Practice Studio starts as a local-first practice prototype. The first phase intentionally avoids backend services so the product shape can be tested quickly with children, parents, and tutors.

## Phase 1: Local MVP

- Next.js App Router application with TypeScript.
- Local sample question bank for Reading, Listening, Writing, and Speaking.
- Per-paper filtering, instant checking, simple heuristic scoring, and localStorage progress.
- Diagnosis and parent feedback panels based on answer state and error tags.
- JSON import textarea for trial question-bank additions.

## Phase 2: Practice Quality

- Expand PET question coverage by part and difficulty.
- Add richer writing and speaking rubrics.
- Add real audio playback and transcript support for Listening.
- Add review mode for wrong answers and weak tags.
- Add exportable parent report snapshots.

## Phase 3: Accounts and Persistence

- Add authentication for families, teachers, or small classes.
- Move progress from localStorage into a database.
- Add question-bank versioning and migration tools.
- Add role-specific views for child, parent, and tutor.

## Phase 4: AI-Assisted Learning

- Add an AI explanation service for wrong answers and writing feedback.
- Add mock-test generation with explicit PET paper/part constraints.
- Add guardrails for age-appropriate explanations.
- Keep generated content reviewable before it becomes part of a saved bank.

## Phase 5: Classroom and Mock Tests

- Timed mock-test mode.
- Printable and shareable reports.
- Teacher assignment workflow.
- Longitudinal skill diagnosis across multiple sessions.
