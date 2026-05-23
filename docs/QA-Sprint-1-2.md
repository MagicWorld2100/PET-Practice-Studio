# Sprint 1.2 Manual QA Checklist

Use this checklist after `npm run build` and local browser testing.

## Practice

- [ ] Reading Part 1 answer flow starts with a clear "What to do now" instruction.
- [ ] Reading option selection is visually obvious.
- [ ] Check button is disabled before an objective answer is selected.
- [ ] Feedback changes the next action to reading feedback and going next.
- [ ] Reading explanation display uses PET coaching sections.
- [ ] Next and Previous keep the active question consistent.
- [ ] Filters update the visible question list without a blank main area.

## Listening

- [ ] Play once starts browser TTS.
- [ ] Play twice queues two browser TTS reads.
- [ ] Stop cancels browser TTS.
- [ ] Transcript is hidden before answering.
- [ ] Show transcript is only useful after answering.
- [ ] Wrong answer prompts a listening error reason.
- [ ] Selected listening error reason appears in diagnosis or parent feedback.

## Writing

- [ ] Textarea accepts the child's answer.
- [ ] Live word count updates while typing.
- [ ] Feedback shows completed and missing task points.
- [ ] Feedback gives only one short improvement suggestion.
- [ ] "可以这样写" gives short sentence frames, not a full rewrite.

## Speaking

- [ ] Task says to speak first, then type key words.
- [ ] Sentence starter appears before answering.
- [ ] Disabled "Record voice later" button is visible with a coming soon note.
- [ ] Feedback shows answered/reason/detail checklist.
- [ ] Feedback gives one expansion suggestion.

## Coverage Mock

- [ ] Start screen explains the coverage and estimated time.
- [ ] Progress shows "Question X of 13".
- [ ] Finish screen appears after completing the mock.
- [ ] Summary shows completed questions and correct objective questions.
- [ ] Summary shows weakest paper, top diagnosis tags, and recommended next training.
- [ ] Review practice result button moves back to the result view.

## Parent Feedback

- [ ] Parent Feedback uses the five-section PET Coach structure.
- [ ] Feedback is readable in under one minute.
- [ ] Tomorrow task is specific and actionable.
- [ ] Listening error reason is mentioned when available.
- [ ] Writing task completion is mentioned when available.
- [ ] Speaking length or expansion is mentioned when available.

## Import/Export

- [ ] Export local data generates JSON.
- [ ] Import valid learning JSON restores answers, listening reasons, and mock sessions.
- [ ] Import valid question JSON adds questions.
- [ ] Invalid JSON shows an error message.
- [ ] Reset practice progress only keeps imported questions.
- [ ] Reset all local data shows a confirmation before deleting.
