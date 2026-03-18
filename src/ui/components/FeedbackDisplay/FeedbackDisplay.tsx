import type { GeneratedFeedback } from "../../../shared/types.ts";
import type { GenerationProgress } from "../../hooks/useGeneration.ts";
import { FeedbackCard } from "../FeedbackCard/index.ts";
import { ErrorBanner } from "../ErrorBanner/index.ts";
import "./FeedbackDisplay.css";

interface FeedbackDisplayProps {
  readonly feedbacks: ReadonlyMap<string, GeneratedFeedback>;
  readonly errors: ReadonlyMap<string, string>;
  readonly isGenerating: boolean;
  readonly progress: GenerationProgress | null;
  readonly onRetry?: () => void;
  readonly onDismissError?: () => void;
}

function ProgressBar({ progress }: { progress: GenerationProgress }) {
  const percent = progress.totalPersonas > 0
    ? (progress.currentPersona / progress.totalPersonas) * 100
    : 0;

  return (
    <div className="feedback-progress">
      <div className="feedback-progress__info">
        <span>
          {progress.currentPersonaName
            ? `생성 중: ${progress.currentPersonaName}`
            : `${progress.currentPersona}/${progress.totalPersonas} 완료`}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="feedback-progress__bar">
        <div className="feedback-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="feedback-progress__detail">
        {progress.currentPersona}/{progress.totalPersonas} 페르소나 완료
      </div>
    </div>
  );
}

export function FeedbackDisplay({
  feedbacks,
  errors,
  isGenerating,
  progress,
  onRetry,
  onDismissError,
}: FeedbackDisplayProps) {
  const feedbackList = [...feedbacks.values()];
  const globalError = errors.get("__global__");
  const personaErrors = [...errors.entries()].filter(([k]) => k !== "__global__");

  if (globalError) {
    return (
      <div className="feedback-display">
        <ErrorBanner message={globalError} onRetry={onRetry} onDismiss={onDismissError} />
      </div>
    );
  }

  if (isGenerating && feedbackList.length === 0) {
    return (
      <div className="feedback-display">
        <div className="feedback-display__loading">
          <div className="feedback-display__spinner" />
          <p>피드백 생성 중...</p>
        </div>
        {progress && <ProgressBar progress={progress} />}
      </div>
    );
  }

  if (feedbackList.length === 0 && personaErrors.length === 0) {
    return (
      <div className="feedback-display__empty">
        게시글을 입력하고 피드백을 생성해보세요.
      </div>
    );
  }

  return (
    <div className="feedback-display">
      {isGenerating && progress && <ProgressBar progress={progress} />}

      <h3 className="feedback-display__title">
        피드백 ({feedbackList.length}개)
        {personaErrors.length > 0 && (
          <span className="feedback-display__error-count"> / 오류 {personaErrors.length}건</span>
        )}
      </h3>

      <div className="feedback-display__grid">
        {feedbackList.map((feedback) => (
          <FeedbackCard key={feedback.personaId} feedback={feedback} />
        ))}
        {personaErrors.map(([personaId, message]) => (
          <div key={personaId} className="feedback-display__error-card">
            <span className="feedback-display__error-name">{personaId}</span>
            <span className="feedback-display__error-msg">{message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
