import { describe, it, expect, beforeEach } from "vitest";
import { search } from "./search.ts";
import { addEntry, clearStore } from "./vectorStore.ts";
import type { VectorMetadata } from "./types.ts";

function makeVector(values: number[]): Float32Array {
  return new Float32Array(values);
}

function makeMeta(overrides: Partial<VectorMetadata> = {}): VectorMetadata {
  return {
    singleTopic: "일상",
    topics: ["안부/일상_일상공유"],
    speakerGenders: ["여성"],
    speakerAges: ["30대"],
    utteranceCount: 5,
    sampleUtterances: ["안녕"],
    ...overrides,
  };
}

describe("search", () => {
  beforeEach(() => {
    clearStore();
  });

  it("should return top-K results by cosine similarity", () => {
    // given
    const queryVec = makeVector([1, 0, 0]);
    addEntry("a", makeVector([1, 0, 0]), makeMeta());
    addEntry("b", makeVector([0, 1, 0]), makeMeta());
    addEntry("c", makeVector([0.9, 0.1, 0]), makeMeta());

    // when
    const results = search(queryVec, 2);

    // then
    expect(results).toHaveLength(2);
    expect(results[0].entry.id).toBe("a");
    expect(results[1].entry.id).toBe("c");
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it("should filter by topic", () => {
    // given
    const queryVec = makeVector([1, 0, 0]);
    addEntry("a", makeVector([0.8, 0.2, 0]), makeMeta({ singleTopic: "쇼핑" }));
    addEntry("b", makeVector([0.9, 0.1, 0]), makeMeta({ singleTopic: "연애" }));
    addEntry("c", makeVector([0.7, 0.3, 0]), makeMeta({ singleTopic: "쇼핑" }));

    // when
    const results = search(queryVec, 2, { topic: "쇼핑" });

    // then
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.entry.metadata.singleTopic === "쇼핑")).toBe(true);
  });

  it("should filter by gender", () => {
    // given
    const queryVec = makeVector([1, 0, 0]);
    addEntry("a", makeVector([0.9, 0.1, 0]), makeMeta({ speakerGenders: ["남성"] }));
    addEntry("b", makeVector([0.8, 0.2, 0]), makeMeta({ speakerGenders: ["여성"] }));

    // when
    const results = search(queryVec, 1, { gender: "여성" });

    // then
    expect(results).toHaveLength(1);
    expect(results[0].entry.id).toBe("b");
  });

  it("should fallback to all entries when filter matches nothing", () => {
    // given
    const queryVec = makeVector([1, 0, 0]);
    addEntry("a", makeVector([0.9, 0.1, 0]), makeMeta({ singleTopic: "일상" }));

    // when
    const results = search(queryVec, 1, { topic: "존재하지않는주제" });

    // then
    expect(results).toHaveLength(1);
    expect(results[0].entry.id).toBe("a");
  });
});
