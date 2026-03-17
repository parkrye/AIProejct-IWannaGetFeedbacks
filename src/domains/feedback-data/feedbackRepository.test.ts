import { describe, it, expect, beforeEach } from "vitest";
import { loadFeedbackExamples, getFewShotExamples, getAllExamples } from "./feedbackRepository.ts";
import type { FeedbackExample } from "../../shared/types.ts";

const MOCK_EXAMPLES: FeedbackExample[] = [
  { personaId: "cheerful", context: "음식 사진", feedback: "맛있겠다!" },
  { personaId: "cheerful", context: "여행 사진", feedback: "부럽다!" },
  { personaId: "cheerful", context: "일상 게시글", feedback: "좋은 하루!" },
  { personaId: "analyst", context: "리뷰", feedback: "흥미로운 관점이네요." },
];

describe("feedbackRepository", () => {
  beforeEach(() => {
    loadFeedbackExamples(MOCK_EXAMPLES);
  });

  it("should load and retrieve all examples", () => {
    // when
    const all = getAllExamples();

    // then
    expect(all).toHaveLength(4);
  });

  it("should return few-shot examples filtered by persona id", () => {
    // when
    const examples = getFewShotExamples("cheerful", 2);

    // then
    expect(examples).toHaveLength(2);
    expect(examples.every((e) => e.personaId === "cheerful")).toBe(true);
  });

  it("should return empty array for unknown persona", () => {
    // when
    const examples = getFewShotExamples("unknown");

    // then
    expect(examples).toHaveLength(0);
  });
});
