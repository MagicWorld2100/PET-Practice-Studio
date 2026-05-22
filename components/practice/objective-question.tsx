import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PracticeQuestion } from "@/types/question";

export function ObjectiveQuestion({
  question,
  answer,
  onAnswer,
}: {
  question: PracticeQuestion;
  answer: string;
  onAnswer: (questionId: string, value: string) => void;
}) {
  if (question.options?.length) {
    return (
      <div className="grid gap-2">
        {question.options.map((option) => (
          <Button
            key={option.id}
            variant={answer === option.id ? "default" : "outline"}
            className="h-auto justify-start whitespace-normal py-3 text-left"
            onClick={() => onAnswer(question.id, option.id)}
          >
            <span className="font-semibold">{option.id}.</span>
            {option.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Textarea
      value={answer}
      onChange={(event) => onAnswer(question.id, event.target.value)}
      placeholder="Type your answer..."
      className="min-h-12"
    />
  );
}
