import type { GeneratedFeedback } from "../../../shared/types.ts";
import "./FeedbackCard.css";

interface FeedbackCardProps {
  readonly feedback: GeneratedFeedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <div className="feedback-card">
      <div className="feedback-card__header">
        <div className="feedback-card__avatar">
          {feedback.personaName.charAt(0)}
        </div>
        <span className="feedback-card__name">{feedback.personaName}</span>
      </div>
      <p className="feedback-card__content">{feedback.content}</p>
    </div>
  );
}
