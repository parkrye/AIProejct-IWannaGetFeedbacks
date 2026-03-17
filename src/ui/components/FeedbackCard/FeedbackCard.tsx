import type { GeneratedFeedback } from "../../../shared/types.ts";
import "./FeedbackCard.css";

interface FeedbackCardProps {
  readonly feedback: GeneratedFeedback;
  readonly isStreaming: boolean;
}

export function FeedbackCard({ feedback, isStreaming }: FeedbackCardProps) {
  return (
    <div className="feedback-card">
      <div className="feedback-card__header">
        <div className="feedback-card__avatar">
          {feedback.personaName.charAt(0)}
        </div>
        <span className="feedback-card__name">{feedback.personaName}</span>
        {isStreaming && <span className="feedback-card__typing">입력 중...</span>}
      </div>
      <p className="feedback-card__content">
        {feedback.content}
        {isStreaming && <span className="feedback-card__cursor">|</span>}
      </p>
    </div>
  );
}
