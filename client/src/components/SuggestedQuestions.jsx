import { SUGGESTED_QUESTIONS } from "../data/constants.js";
import Button from "./ui/Button.jsx";
import Card from "./ui/Card.jsx";

export default function SuggestedQuestions({ onSelect, disabled }) {
  return (
    <Card
      title="Suggested questions"
      titleId="suggested-heading"
      className="suggested"
      description={<p className="helper">Choose a store question. These buttons do not collect your name or other personal details.</p>}
    >
      <div className="chip-row" role="group" aria-label="Suggested store questions">
        {SUGGESTED_QUESTIONS.map((question) => (
          <Button
            key={question}
            variant="chip"
            disabled={disabled}
            aria-disabled={disabled}
            onClick={() => {
              if (disabled) return;
              onSelect(question);
            }}
          >
            {question}
          </Button>
        ))}
      </div>
    </Card>
  );
}
