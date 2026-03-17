import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import {
  addEntry,
  getEntryCount,
  clearStore,
  saveToBinary,
  loadFromBinary,
  getAllEntries,
} from "./vectorStore.ts";
import type { VectorMetadata } from "./types.ts";
import { tmpdir } from "os";

const TEST_FILE = join(tmpdir(), "test-vectors.bin");

function makeMeta(): VectorMetadata {
  return {
    singleTopic: "테스트",
    topics: ["테스트/토픽"],
    speakerGenders: ["여성"],
    speakerAges: ["20대"],
    utteranceCount: 3,
    sampleUtterances: ["안녕하세요"],
  };
}

describe("vectorStore", () => {
  beforeEach(() => {
    clearStore();
  });

  afterEach(() => {
    if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE);
  });

  it("should add and count entries", () => {
    // given
    addEntry("a", new Float32Array([1, 2, 3]), makeMeta());
    addEntry("b", new Float32Array([4, 5, 6]), makeMeta());

    // then
    expect(getEntryCount()).toBe(2);
  });

  it("should reject mismatched vector dimensions", () => {
    // given
    addEntry("a", new Float32Array([1, 2, 3]), makeMeta());

    // then
    expect(() => addEntry("b", new Float32Array([1, 2]), makeMeta())).toThrow("차원 불일치");
  });

  it("should save and load from binary file", () => {
    // given
    const vec1 = new Float32Array([0.1, 0.2, 0.3]);
    const vec2 = new Float32Array([0.4, 0.5, 0.6]);
    addEntry("x", vec1, makeMeta());
    addEntry("y", vec2, makeMeta());

    // when
    saveToBinary(TEST_FILE);
    clearStore();
    expect(getEntryCount()).toBe(0);
    loadFromBinary(TEST_FILE);

    // then
    expect(getEntryCount()).toBe(2);
    const entries = getAllEntries();
    expect(entries[0].id).toBe("x");
    expect(entries[1].id).toBe("y");
    expect(Math.abs(entries[0].vector[0] - 0.1)).toBeLessThan(0.001);
    expect(Math.abs(entries[1].vector[2] - 0.6)).toBeLessThan(0.001);
  });
});
