import { describe, it, expect } from "vitest";
import { analyzeText } from "./analyzeText.ts";

describe("analyzeText", () => {
  it("should extract keywords from text", () => {
    // given
    const text = "오늘 카페에서 커피를 마셨다. 카페 분위기가 좋았다.";

    // when
    const result = analyzeText(text);

    // then
    expect(result.keywords).toContain("카페에서");
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  it("should detect positive sentiment", () => {
    // given
    const text = "너무 좋아! 행복하다! 최고!";

    // when
    const result = analyzeText(text);

    // then
    expect(result.sentiment).toBe("positive");
  });

  it("should detect negative sentiment", () => {
    // given
    const text = "너무 힘들다. 실망이야. 최악이었어.";

    // when
    const result = analyzeText(text);

    // then
    expect(result.sentiment).toBe("negative");
  });

  it("should detect neutral sentiment for factual text", () => {
    // given
    const text = "오늘 서울에서 회의가 있었다.";

    // when
    const result = analyzeText(text);

    // then
    expect(result.sentiment).toBe("neutral");
  });

  it("should return empty keywords for empty text", () => {
    // given
    const text = "";

    // when
    const result = analyzeText(text);

    // then
    expect(result.keywords).toHaveLength(0);
    expect(result.sentiment).toBe("neutral");
  });
});
