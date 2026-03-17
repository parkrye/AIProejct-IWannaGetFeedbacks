import { describe, it, expect } from "vitest";
import { cultureTermUsageAdapter } from "./cultureTermUsageAdapter.ts";

const SAMPLE_RAW = {
  id: 1557602,
  sentence: "참고로 저거랑 별개로 저 리포지드 예구한거 환불받았을떼 수수료 떼고 입금받았습니다.",
  tokens: [
    { start: 14, length: 4, sub: "리포지드", facet: "시즌", term_id: 170577, sense_no: 1 },
  ],
  sense_no: 1,
  source: {
    uri: "https://www.inven.co.kr/board/wow/4739/122300",
    text: "참고로 저거랑 별개로 저 리포지드 예구한거 환불받았을떼 수수료 떼고 입금받았습니다. 문의해봐야할듯.",
    written_at: "2020-11-11T21:28:54",
  },
};

describe("cultureTermUsageAdapter", () => {
  it("should normalize term usage data", () => {
    // when
    const result = cultureTermUsageAdapter.normalize(SAMPLE_RAW);

    // then
    expect(result.id).toBe("ctu-1557602");
    expect(result.singleTopic).toBe("시즌");
    expect(result.topics).toEqual(["시즌"]);
    expect(result.utterances.length).toBeGreaterThan(0);
    expect(result.utterances[0]).toContain("리포지드");
    expect(result.source).toBe("www.inven.co.kr");
  });

  it("should include term and facet in combined text", () => {
    // when
    const result = cultureTermUsageAdapter.normalize(SAMPLE_RAW);

    // then
    expect(result.combinedText).toContain("리포지드");
    expect(result.combinedText).toContain("시즌");
  });
});
