import { describe, it, expect } from "vitest";
import { cultureTermDefAdapter } from "./cultureTermDefAdapter.ts";

const SAMPLE_RAW = {
  id: 162960,
  term: "라이아",
  sense_no: 1,
  definition: "리니지M 게임에 등장하는, 마령군왕의 집무실에 나오는 보스 몬스터.",
  pos: "일반명사(NNG)",
  bts: [{ id: 202209, term: "보스 몬스터", sense_no: 1 }],
  nts: [],
  rts: [
    { id: 172107, type: "original_word", term: "마령군왕 라이아", sense_no: 1 },
  ],
  facets: ["게임"],
};

describe("cultureTermDefAdapter", () => {
  it("should normalize term definition data", () => {
    // when
    const result = cultureTermDefAdapter.normalize(SAMPLE_RAW);

    // then
    expect(result.id).toBe("ctd-162960");
    expect(result.singleTopic).toBe("게임");
    expect(result.utterances[0]).toContain("라이아");
    expect(result.utterances[0]).toContain("보스 몬스터");
  });

  it("should include related terms in utterances", () => {
    // when
    const result = cultureTermDefAdapter.normalize(SAMPLE_RAW);

    // then
    const relatedUtterances = result.utterances.filter((u) => u.startsWith("관련어:"));
    expect(relatedUtterances.length).toBeGreaterThan(0);
    expect(result.combinedText).toContain("마령군왕 라이아");
  });
});
