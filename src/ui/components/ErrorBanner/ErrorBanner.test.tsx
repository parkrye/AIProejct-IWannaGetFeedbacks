import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ErrorBanner } from "./ErrorBanner.tsx";

afterEach(cleanup);

describe("ErrorBanner", () => {
  it("should display error message", () => {
    // given / when
    render(<ErrorBanner message="서버 오류가 발생했습니다." />);

    // then
    expect(screen.getByText("서버 오류가 발생했습니다.")).toBeInTheDocument();
  });

  it("should show retry button when onRetry is provided", () => {
    // given
    const onRetry = vi.fn();

    // when
    render(<ErrorBanner message="오류" onRetry={onRetry} />);
    fireEvent.click(screen.getByText("다시 시도"));

    // then
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("should show dismiss button when onDismiss is provided", () => {
    // given
    const onDismiss = vi.fn();

    // when
    render(<ErrorBanner message="오류" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText("닫기"));

    // then
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("should not show buttons when callbacks are not provided", () => {
    // when
    render(<ErrorBanner message="오류" />);

    // then
    expect(screen.queryByText("다시 시도")).not.toBeInTheDocument();
    expect(screen.queryByText("닫기")).not.toBeInTheDocument();
  });

  it("should have alert role for accessibility", () => {
    // when
    render(<ErrorBanner message="오류" />);

    // then
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
