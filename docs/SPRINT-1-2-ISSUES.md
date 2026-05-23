# Sprint 1.2 Issues

GitHub CLI was unavailable in this workspace because `gh pr view 1` returned `HTTP 401: Requires authentication`. These are the Sprint 1.2 issues to track locally.

## Issue 1: Polish Practice Workbench UX for child-friendly use

Priority: P0

- Add a clear "What to do now" instruction at the top of each question.
- Make the answer flow obvious before selection, after selection, and after submit.
- Make selected options visually obvious.
- Disable objective submit before selection.
- Use "Check my answer" before submit and "Checked" after submit.
- Add a clear "Next question" primary button after feedback.
- Remove remaining dev/debug wording.

Acceptance: A child can tell what to do next, objective flow is visually obvious, no debug text appears, and `npm run build` passes.

## Issue 2: Improve Reading explanation layout using PET coaching structure

Priority: P0

- Show Reading objective explanations in this order: 这题在考什么, 定位词, 为什么这个答案对, 为什么其他答案错, 下一次怎么做.
- Use separate short sections.
- Highlight locator words.
- Add a disabled "Try a similar question later" placeholder.

Acceptance: Reading feedback is parent-readable and not a long dense block.

## Issue 3: Make Listening v0 usable with browser TTS and error tagging

Priority: P0

- Hide transcript by default.
- Provide Play once, Play twice, Stop, and Show transcript after answering controls.
- Tell the child to listen first and not read the transcript before answering.
- Prompt a wrong-answer listening error reason: 没听到, 反应慢, 词不会, 选项混淆.
- Store and show the selected listening error reason.

Acceptance: Listening can be completed without reading first, and parent feedback can mention listening error type.

## Issue 4: Improve Writing feedback for low-pressure PET training

Priority: P1

- Show live word count.
- Show completed and missing task points.
- Give one short improvement suggestion.
- Show a "可以这样写" section with 1-2 sentence frames.
- Avoid heavy grammar correction.

Acceptance: Writing feedback is gentle, actionable, and task-point based.

## Issue 5: Improve Speaking practice with answer frame and expansion feedback

Priority: P1

- Show "Say it first, then type the key words".
- Add sentence starters.
- Add checklist: answered the question, gave a reason, gave an example/detail.
- After submit, give one expansion suggestion.
- Add disabled "Record voice later" button with "coming soon".

Acceptance: Speaking encourages oral output first and focuses on expansion.

## Issue 6: Improve Coverage Mock flow and final summary

Priority: P1

- Add an intro screen with coverage and estimated time.
- Add "Question X of 13" progress.
- At finish show completed questions, correct objective questions, weakest paper, top 3 diagnosis tags, and recommended next training.
- Add "Review practice result".
- Save latest coverage mock result locally.

Acceptance: Coverage Mock has beginning, middle, and end without claiming official equivalence.

## Issue 7: Upgrade parent feedback to PET Coach format

Priority: P0

- Always use: 今日完成内容, 今日最明显进步, 今日三个关键问题, 明日建议任务, 家长是否需要介入，以及如何介入.
- Be concise, prioritize Reading and Listening, mention listening error reason, writing task completion, and speaking expansion when available.

Acceptance: Parent can read it in under one minute and knows what to do tomorrow.

## Issue 8: Add safer local data reset and quick test mode

Priority: P2

- Add "Reset practice progress only".
- Add "Reset all local data".
- Confirm before deleting.
- Add "Load sample data" if the bank is empty.
- Keep JSON import/export working.

Acceptance: Parent can reset progress without accidental silent data loss.

## Issue 9: Clean UI copy for child and parent use

Priority: P1

- Keep nav simple: Practice, Coverage Mock, Diagnosis, Parent Feedback, Import / Export.
- Use short English plus Chinese where helpful for child-facing instructions.
- Avoid payload, schema, debug, active question loaded, and similar developer wording in child-facing UI.

Acceptance: The app feels like a learning app, not a developer demo.

## Issue 10: Add manual QA checklist for Sprint 1.2

Priority: P2

- Create `docs/QA-Sprint-1-2.md`.
- Cover Practice, Listening, Writing, Speaking, Coverage Mock, Parent Feedback, and Import/Export checks.
- Link it from `README.md`.

Acceptance: QA checklist is committed and linked.
