import { describe, it, expect } from "vitest";
import { buildPrompt } from "./promptBuilder.ts";
import type { Persona, TextAnalysisResult, PromptTemplate } from "../../shared/types.ts";

const MOCK_PERSONA: Persona = {
  id: "test",
  name: "테스트",
  traits: { tone: "friendly", emotionBias: "positive", formality: "casual" },
  promptHint: "친근한 사람입니다.",
  examplePatterns: ["좋아요!", "대박!"],
};

const MOCK_ANALYSIS: TextAnalysisResult = {
  keywords: ["카페", "커피"],
  sentiment: "positive",
  topics: ["카페"],
};

const MOCK_TEMPLATE: PromptTemplate = {
  system: "시스템 프롬프트",
  userTemplate:
    "게시글: {{postText}}\n이미지: {{imageInfo}}\n키워드: {{keywords}}\n감정: {{sentiment}}\n페르소나: {{personaName}}\n힌트: {{promptHint}}\n패턴: {{examplePatterns}}",
};

describe("buildPrompt", () => {
  it("should replace all template placeholders", () => {
    // given
    const context = {
      postText: "카페에서 커피 한 잔",
      imageLabels: [{ label: "coffee", confidence: 0.95 }],
      textAnalysis: MOCK_ANALYSIS,
      persona: MOCK_PERSONA,
      fewShotExamples: [],
      template: MOCK_TEMPLATE,
    };

    // when
    const result = buildPrompt(context);

    // then
    expect(result.system).toBe("시스템 프롬프트");
    expect(result.user).toContain("카페에서 커피 한 잔");
    expect(result.user).toContain("coffee (95%)");
    expect(result.user).toContain("카페, 커피");
    expect(result.user).toContain("긍정적");
    expect(result.user).toContain("테스트");
    expect(result.user).toContain("친근한 사람입니다.");
  });

  it("should include few-shot examples when provided", () => {
    // given
    const context = {
      postText: "테스트",
      imageLabels: [],
      textAnalysis: MOCK_ANALYSIS,
      persona: MOCK_PERSONA,
      fewShotExamples: [{ personaId: "test", context: "음식 사진", feedback: "맛있겠다!" }],
      template: MOCK_TEMPLATE,
    };

    // when
    const result = buildPrompt(context);

    // then
    expect(result.user).toContain("[참고 예시]");
    expect(result.user).toContain("맛있겠다!");
  });

  it("should handle empty post text", () => {
    // given
    const context = {
      postText: "",
      imageLabels: [],
      textAnalysis: { keywords: [], sentiment: "neutral" as const, topics: [] },
      persona: MOCK_PERSONA,
      fewShotExamples: [],
      template: MOCK_TEMPLATE,
    };

    // when
    const result = buildPrompt(context);

    // then
    expect(result.user).toContain("(텍스트 없음)");
    expect(result.user).toContain("(이미지 없음)");
  });
});
