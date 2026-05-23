# PET Practice Studio Roadmap

PET Practice Studio is local-first in Sprint 1. The product priority is real browser use by a child and practical parent feedback, not commercial infrastructure.

## Sprint 1: End-to-End Local Practice Loop

Implemented scope:

- Paper / part / topic / difficulty navigation
- Original sample bank covering all required PET papers and parts
- Reading objective checking with richer explanations
- Listening v0 using browser `speechSynthesis`
- Listening transcript reveal after answering
- Listening mistake reason tags
- Rule-based Writing scoring
- Lightweight Speaking feedback
- Coverage Mock mode
- Diagnosis and parent feedback panels
- Local learning data export/import
- localStorage persistence

Explicitly out of scope:

- Login
- Database
- Server-side AI API
- Payment
- Complex permissions
- Commercial deployment infrastructure
- Copyrighted real exam-paper content

## Sprint 2 Candidates

1. AI-generated mock paper blueprint
   - Define safe prompt inputs and output schema.
   - Keep generated items reviewable before saving.

2. AI explanation API placeholder
   - Add service boundary and request/response types.
   - Do not require a provider key for local MVP use.

3. Real audio file support
   - Add audio URL/file fields to question schema.
   - Keep browser TTS as fallback.

4. Review mode / wrong answer notebook
   - Collect wrong objective answers and weak tags.
   - Add “redo later” flow.

5. Spaced repetition for vocabulary and mistakes
   - Track repeated tags and missed words.
   - Suggest short next-day review sets.

6. Database and user profiles
   - Add only after local flow stabilizes.
   - Preserve import/export as a backup path.

7. Weekly parent report
   - Summarize completed work, repeated weak parts, and next-week tasks.

## Later Direction

- Teacher/classroom assignment mode
- Full timed mock-test mode
- Printable family reports
- Audio recording support for Speaking practice
- More granular PET rubric mapping

## Completed

### v0.1.2 — Sprint 1.2 Baseline
Status: completed

Focus:
Child-usable Practice Experience.
