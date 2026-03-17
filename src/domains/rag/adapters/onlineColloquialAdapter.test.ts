import { describe, it, expect } from "vitest";
import { onlineColloquialAdapter, extractEntries } from "./onlineColloquialAdapter.ts";

const SAMPLE_RAW = {
  header: {
    identifier: "텍스트_구어체_0001",
    name: "test",
    type: "0",
    source_file: "BOGA001",
    subject: "GA",
  },
  named_entity: [
    {
      content: [
        { sentence: "이거 진짜 대박이다 ㅋㅋㅋ", labels: [{ label: "감탄" }] },
        { sentence: "ㅎㅎ", labels: [] },
      ],
      writer: "user1",
      write_date: "2020-01-01",
      url: "https://youtube.com/test",
      parent_url: "https://youtube.com/watch?v=test",
      source_site: "https://www.youtube.com/",
    },
    {
      content: [
        { sentence: "나도 해봐야지 이거", labels: [] },
      ],
      writer: "user2",
      write_date: "2020-01-02",
      url: "https://youtube.com/test2",
      parent_url: "https://youtube.com/watch?v=test",
      source_site: "https://www.youtube.com/",
    },
  ],
};

describe("extractEntries", () => {
  it("should extract entries from raw data", () => {
    // when
    const entries = extractEntries(SAMPLE_RAW, "게임");

    // then — "ㅎㅎ" filtered out (length < 5)
    expect(entries).toHaveLength(2);
    expect(entries[0].sentence).toBe("이거 진짜 대박이다 ㅋㅋㅋ");
    expect(entries[0].category).toBe("게임");
    expect(entries[0].labels).toEqual(["감탄"]);
    expect(entries[1].sentence).toBe("나도 해봐야지 이거");
  });
});

describe("onlineColloquialAdapter", () => {
  it("should normalize extracted entry", () => {
    // given
    const entries = extractEntries(SAMPLE_RAW, "게임");

    // when
    const result = onlineColloquialAdapter.normalize(entries[0]);

    // then
    expect(result.singleTopic).toBe("게임");
    expect(result.topics).toContain("게임");
    expect(result.topics).toContain("감탄");
    expect(result.utterances).toEqual(["이거 진짜 대박이다 ㅋㅋㅋ"]);
    expect(result.combinedText).toContain("게임");
    expect(result.combinedText).toContain("이거 진짜 대박이다");
  });
});
