# Sprint 1 Issues

GitHub CLI was available, but `gh auth status` reported an invalid token for the active account. These issues are recorded here so they can be copied into GitHub when authentication is restored.

## 1. Fix writing scoring: replace raw checklist string matching with rule-based checks

Current writing scoring may incorrectly check whether student text contains checklist labels. Replace it with rule-based checklist items.

Writing checklist item shape:

```ts
{
  id: string;
  label: string;
  patterns?: string[];
  required?: boolean;
  advice?: string;
}
```

Scoring should return word count, checklist hits, missing items, score, and advice.

Acceptance:

- English answers can hit information points correctly
- Chinese checklist labels are not matched directly against student answers
- UI shows word count, completed task points, missing points, and one short improvement suggestion
- build passes

## 2. Refactor PetPracticeStudio into smaller panels and reusable components

Current main component is too large for future expansion. Split it into smaller components while preserving current behavior.

Suggested structure:

- `components/layout/hero-panel.tsx`
- `components/layout/module-summary-cards.tsx`
- `components/practice/practice-panel.tsx`
- `components/practice/question-card.tsx`
- `components/practice/objective-question.tsx`
- `components/practice/writing-question.tsx`
- `components/practice/speaking-question.tsx`
- `components/practice/explanation-panel.tsx`
- `components/diagnosis/diagnosis-panel.tsx`
- `components/parent/parent-feedback-panel.tsx`
- `components/import/import-bank-panel.tsx`

Acceptance:

- Existing UI and behaviors still work
- Main component handles state orchestration and layout only
- Practice, diagnosis, parent feedback, and import panels are separated
- build passes

## 3. Expand sample bank to cover all PET papers and parts

Expand `data/sample-bank.ts` using original practice content only.

Minimum coverage:

Reading:

- Part 1 notice/message
- Part 2 matching
- Part 3 longer text multiple choice
- Part 4 gapped text
- Part 5 multiple-choice cloze
- Part 6 open cloze

Writing:

- Part 1 email
- Part 2 article or story, at least article first

Listening:

- Part 1 short dialogues
- Part 2 longer monologue/interview
- Part 3 gap fill / note completion
- Part 4 opinion true/false or multiple choice

Speaking:

- Part 1 personal questions
- Part 2 photo description
- Part 3 collaborative task
- Part 4 discussion

Acceptance:

- Every PET part has at least one original sample item
- Every item has topic, difficulty, diagnosisTags
- Objective items have answer and explanation
- Writing/speaking items have support and assessmentFocus
- No copyrighted past-paper content

## 4. Add PET part navigator for targeted practice

Add second-level filtering by Paper, Part, Topic, and Difficulty.

Acceptance:

- User can choose All / Reading / Listening / Writing / Speaking
- User can choose specific part after selecting a paper
- Progress and current index remain correct after filtering
- No index overflow errors

## 5. Add Listening v0 with browser TTS playback and transcript toggle

Listening currently uses visible transcript text. Add browser `speechSynthesis` playback for Listening items.

Requirements:

- Play once
- Play twice
- Stop
- Show transcript / hide transcript
- Transcript hidden by default before answer
- After submission, transcript can be revealed
- If wrong, user should select error type: 没听到 / 反应慢 / 词不会 / 选项混淆

Acceptance:

- Works in modern browsers using `speechSynthesis`
- No external audio file required
- Listening error reason is recorded in diagnosis

## 6. Add Coverage Mock Mode for full PET skill flow

Add a small mock mode that covers all PET skills without trying to be a full official timed mock.

Coverage Mock should include:

- Reading: 6 questions, one from each Reading part
- Listening: 4 questions, one from each Listening part
- Writing: 1 task
- Speaking: 2 tasks

Requirements:

- Randomly select from sample bank by part
- Create a mock session
- Show current question number
- Save results
- Show final summary
- Save latest mock session in localStorage

Acceptance:

- User can start Coverage Mock
- User can complete the queue
- Summary is generated at the end
- Existing normal practice mode still works

## 7. Improve diagnosis and parent feedback for actionability

Improve `lib/diagnostics.ts` so feedback is more useful.

Student diagnosis should show:

- 今日表现
- 完成了什么
- 正确率
- 最容易错的 part
- 最需要注意的技能点
- 下一题建议

Parent feedback must use this structure:

1. 今日完成内容
2. 今日最明显进步
3. 今日三个关键问题
4. 明日建议任务
5. 家长是否需要介入，以及如何介入

Acceptance:

- Feedback is concise and actionable
- Reading and Listening weaknesses are prioritized
- Listening error reasons are shown separately
- Writing and Speaking output quality are mentioned when available
- Insufficient data case is handled gently

## 8. Add JSON export/import for local learning data

Since no database is used in Sprint 1, add local data export/import.

Export object:

```ts
{
  bank,
  answers,
  results,
  mockSessions,
  exportedAt,
  version
}
```

Acceptance:

- User can export current progress as JSON
- User can import progress JSON and restore state
- Invalid JSON shows friendly error
- Existing question-bank import still works

## 9. Update README and Sprint 2 roadmap

Update README and docs.

README should explain:

- Project purpose
- How to run locally
- Current Sprint 1 MVP scope
- Local-first storage
- No real copyrighted past-paper content
- Coverage Mock is not an official equivalent mock
- Future roadmap: AI generator, database, audio files, auth, parent dashboard

Also add/update:

- `docs/ROADMAP.md`
- `docs/QUESTION_SCHEMA.md`

Acceptance:

- New developer can run the app from README
- Current project scope is clear
- Data schema is documented
- Sprint 2 backlog is clear
