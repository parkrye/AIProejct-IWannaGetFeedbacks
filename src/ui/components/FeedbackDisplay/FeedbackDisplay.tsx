import type { GeneratedFeedback } from "../../../shared/types.ts";
import type { GenerationProgress } from "../../hooks/useGeneration.ts";
import { FeedbackCard } from "../FeedbackCard/index.ts";
import { ErrorBanner } from "../ErrorBanner/index.ts";
import { LoadingSpinner } from "../LoadingSpinner/index.ts";
import "./FeedbackDisplay.css";

interface FeedbackDisplayProps {
  readonly feedbacks: ReadonlyMap<string, GeneratedFeedback>;
  readonly isGenerating: boolean;
  readonly error: string | null;
  readonly progress: GenerationProgress | null;
  readonly onRetry?: () => void;
  readonly onDismissError?: () => void;
}

function ProgressBar({ progress }: { progress: GenerationProgress }) {
  const tokenPercent = progress.maxTokens > 0
    ? Math.min((progress.tokenCount / progress.maxTokens) * 100, 100)
    : 0;
  const overallPercent = progress.totalPersonas > 0
    ? ((progress.currentPersona + tokenPercent / 100) / progress.totalPersonas) * 100
    : 0;

  return (
    <div className="feedback-progress">
      <div className="feedback-progress__info">
        <span>
          {progress.currentPersona + 1}/{progress.totalPersonas} 페르소나
        </span>
        <span>{Math.round(overallPercent)}%</span>
      </div>
      <div className="feedback-progress__bar">
        <div
          className="feedback-progress__fill"
          style={{ width: `${overallPercent}%` }}
        />
      </div>
      <div className="feedback-progress__detail">
        토큰: {progress.tokenCount}/{progress.maxTokens}
      </div>
    </div>
  );
}

export function FeedbackDisplay({
  feedbacks,
  isGenerating,
  error,
  progress,
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

      {isGenerating && progress && <ProgressBar progress={progress} />}

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
