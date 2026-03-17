import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  readonly message?: string;
}

export function LoadingSpinner({ message = "로딩 중..." }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner">
      <div className="loading-spinner__ring" />
      <p className="loading-spinner__message">{message}</p>
    </div>
  );
}
