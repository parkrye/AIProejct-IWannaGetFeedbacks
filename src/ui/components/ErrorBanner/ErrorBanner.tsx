import "./ErrorBanner.css";

interface ErrorBannerProps {
  readonly message: string;
  readonly onRetry?: () => void;
  readonly onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <p className="error-banner__message">{message}</p>
      <div className="error-banner__actions">
        {onRetry && (
          <button className="error-banner__btn error-banner__btn--retry" onClick={onRetry}>
            다시 시도
          </button>
        )}
        {onDismiss && (
          <button className="error-banner__btn error-banner__btn--dismiss" onClick={onDismiss}>
            닫기
          </button>
        )}
      </div>
    </div>
  );
}
