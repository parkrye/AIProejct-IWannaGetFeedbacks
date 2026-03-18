import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedbackDisplay } from "./FeedbackDisplay.tsx";
import type { GeneratedFeedback } from "../../../shared/types.ts";

function createFeedbackMap(
  entries: GeneratedFeedback[],
): Map<string, GeneratedFeedback> {
  return new Map(entries.map((f) => [f.personaId, f]));
}

describe("FeedbackDisplay", () => {
  it("should show empty state when no feedbacks and not generating", () => {
    // when
    render(
      <FeedbackDisplay feedbacks={new Map()} isGenerating={false} error={null} progress={null} />,
    );

    // then
    expect(screen.getByText(/게시글을 입력하고/)).toBeInTheDocument();
  });

  it("should show loading spinner when generating with no feedbacks yet", () => {
    // when
    render(
      <FeedbackDisplay feedbacks={new Map()} isGenerating={true} error={null} progress={null} />,
    );

    // then
    expect(screen.getByText("피드백 생성 준비 중...")).toBeInTheDocument();
  });

  it("should show error banner with retry button", () => {
    // given
    const onRetry = vi.fn();

    // when
    render(
      <FeedbackDisplay
        feedbacks={new Map()}
        isGenerating={false}
        error="서버 연결 실패"
        progress={null}
        onRetry={onRetry}
      />,
    );

    // then
    expect(screen.getByText("서버 연결 실패")).toBeInTheDocument();
    fireEvent.click(screen.getByText("다시 시도"));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("should show feedback cards when feedbacks are available", () => {
    // given
    const feedbacks = createFeedbackMap([
      { personaId: "p1", personaName: "밝은 응원단", content: "대박이다!" },
      { personaId: "p2", personaName: "차분한 분석가", content: "흥미롭네요." },
    ]);

    // when
    render(
      <FeedbackDisplay feedbacks={feedbacks} isGenerating={false} error={null} progress={null} />,
    );

    // then
    expect(screen.getByText("밝은 응원단")).toBeInTheDocument();
    expect(screen.getByText("대박이다!")).toBeInTheDocument();
    expect(screen.getByText("차분한 분석가")).toBeInTheDocument();
    expect(screen.getByText("흥미롭네요.")).toBeInTheDocument();
  });

  it("should show generating indicator when streaming", () => {
    // given
    const feedbacks = createFeedbackMap([
      { personaId: "p1", personaName: "테스트", content: "생성중..." },
    ]);

    // when
    render(
      <FeedbackDisplay feedbacks={feedbacks} isGenerating={true} error={null} progress={null} />,
    );

    // then
    expect(screen.getByText("생성 중...")).toBeInTheDocument();
  });

  it("should show partial feedbacks even when error occurs", () => {
    // given
    const feedbacks = createFeedbackMap([
      { personaId: "p1", personaName: "밝은 응원단", content: "부분 결과" },
    ]);

    // when
    render(
      <FeedbackDisplay
        feedbacks={feedbacks}
        isGenerating={false}
        error="일부 생성 실패"
        progress={null}
      />,
    );

    // then
    expect(screen.getByText("일부 생성 실패")).toBeInTheDocument();
    expect(screen.getByText("부분 결과")).toBeInTheDocument();
  });
});
