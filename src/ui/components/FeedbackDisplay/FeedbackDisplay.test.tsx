import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedbackDisplay } from "./FeedbackDisplay.tsx";
import type { GeneratedFeedback } from "../../../shared/types.ts";

function createFeedbackMap(entries: GeneratedFeedback[]): Map<string, GeneratedFeedback> {
  return new Map(entries.map((f) => [f.personaId, f]));
}

const emptyErrors = new Map<string, string>();

describe("FeedbackDisplay", () => {
  it("should show empty state when no feedbacks and not generating", () => {
    render(
      <FeedbackDisplay feedbacks={new Map()} errors={emptyErrors} isGenerating={false} progress={null} />,
    );
    expect(screen.getByText(/게시글을 입력하고/)).toBeInTheDocument();
  });

  it("should show loading when generating with no feedbacks yet", () => {
    render(
      <FeedbackDisplay feedbacks={new Map()} errors={emptyErrors} isGenerating={true} progress={null} />,
    );
    expect(screen.getByText("피드백 생성 중...")).toBeInTheDocument();
  });

  it("should show global error with retry button", () => {
    const onRetry = vi.fn();
    const errors = new Map([["__global__", "서버 연결 실패"]]);
    render(
      <FeedbackDisplay feedbacks={new Map()} errors={errors} isGenerating={false} progress={null} onRetry={onRetry} />,
    );
    expect(screen.getByText("서버 연결 실패")).toBeInTheDocument();
    fireEvent.click(screen.getByText("다시 시도"));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("should show feedback cards when feedbacks are available", () => {
    const feedbacks = createFeedbackMap([
      { personaId: "p1", personaName: "테스트1", content: "대박이다!" },
      { personaId: "p2", personaName: "테스트2", content: "흥미롭네요." },
    ]);
    render(
      <FeedbackDisplay feedbacks={feedbacks} errors={emptyErrors} isGenerating={false} progress={null} />,
    );
    expect(screen.getByText("테스트1")).toBeInTheDocument();
    expect(screen.getByText("대박이다!")).toBeInTheDocument();
    expect(screen.getByText("테스트2")).toBeInTheDocument();
  });

  it("should show error cards for per-persona errors", () => {
    const feedbacks = createFeedbackMap([
      { personaId: "p1", personaName: "테스트1", content: "성공" },
    ]);
    const errors = new Map([["p2", "생성 실패"]]);
    render(
      <FeedbackDisplay feedbacks={feedbacks} errors={errors} isGenerating={false} progress={null} />,
    );
    expect(screen.getByText("성공")).toBeInTheDocument();
    expect(screen.getByText("생성 실패")).toBeInTheDocument();
  });
});
