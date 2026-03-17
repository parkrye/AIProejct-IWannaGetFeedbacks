import type { GeneratedFeedback } from "../../../shared/types.ts";
import { FeedbackCard } from "../FeedbackCard/index.ts";
import { ErrorBanner } from "../ErrorBanner/index.ts";
import { LoadingSpinner } from "../LoadingSpinner/index.ts";
import "./FeedbackDisplay.css";

interface FeedbackDisplayProps {
  readonly feedbacks: ReadonlyMap<string, GeneratedFeedback>;
  readonly isGenerating: boolean;
  readonly error: string | null;
  readonly onRetry?: () => void;
  readonly onDismissError?: () => void;
}

export function FeedbackDisplay({
  feedbacks,
  isGenerating,
  error,
  onRetry,
  onDismissError,
}: FeedbackDisplayProps) {
  const feedbackList = [...feedbacks.values()];

  if (error) {
    return (
      <div className="feedback-display">
        <ErrorBanner message={error} onRetry={onRetry} onDismiss={onDismissError} />
        {feedbackList.length > 0 && (
          <div className="feedback-display__grid">
            {feedbackList.map((feedback) => (
              <FeedbackCard key={feedback.personaId} feedback={feedback} isStreaming={false} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isGenerating && feedbackList.length === 0) {
    return <LoadingSpinner message="피드백 생성 준비 중..." />;
  }

  if (feedbackList.length === 0) {
    return (
      <div className="feedback-display__empty">
        게시글을 입력하고 피드백을 생성해보세요.
      </div>
    );
  }

  return (
    <div className="feedback-display">
      <h3 className="feedback-display__title">
        피드백 ({feedbackList.length}개)
        {isGenerating && <span className="feedback-display__generating"> 생성 중...</span>}
      </h3>
      <div className="feedback-display__grid">
        {feedbackList.map((feedback) => (
          <FeedbackCard
            key={feedback.personaId}
            feedback={feedback}
            isStreaming={isGenerating}
          />
        ))}
      </div>
    </div>
  );
}
