import { describe, it, expect, beforeEach } from "vitest";
import {
  registerPersonaCategory,
  getPersonaById,
  getAllPersonas,
  getPersonasByIds,
  clearRegistry,
} from "./personaRegistry.ts";
import type { PersonaCategory } from "../../shared/types.ts";

const TEST_CATEGORY: PersonaCategory = {
  category: "test",
  personas: [
    {
      id: "test-persona-1",
      name: "테스트 페르소나 1",
      traits: { tone: "friendly", emotionBias: "positive", formality: "casual" },
      promptHint: "테스트용 페르소나입니다.",
      examplePatterns: ["테스트!"],
    },
    {
      id: "test-persona-2",
      name: "테스트 페르소나 2",
      traits: { tone: "analytical", emotionBias: "neutral", formality: "formal" },
      promptHint: "분석적 테스트 페르소나입니다.",
      examplePatterns: ["분석합니다."],
    },
  ],
};

describe("personaRegistry", () => {
  beforeEach(() => {
    clearRegistry();
  });

  it("should register and retrieve persona by id", () => {
    // given
    registerPersonaCategory(TEST_CATEGORY);

    // when
    const persona = getPersonaById("test-persona-1");

    // then
    expect(persona).toBeDefined();
    expect(persona?.name).toBe("테스트 페르소나 1");
  });

  it("should return undefined for unknown id", () => {
    // given
    registerPersonaCategory(TEST_CATEGORY);

    // when
    const persona = getPersonaById("unknown");

    // then
    expect(persona).toBeUndefined();
  });

  it("should return all registered personas", () => {
    // given
    registerPersonaCategory(TEST_CATEGORY);

    // when
    const all = getAllPersonas();

    // then
    expect(all).toHaveLength(2);
  });

  it("should return personas by ids, filtering missing ones", () => {
    // given
    registerPersonaCategory(TEST_CATEGORY);

    // when
    const result = getPersonasByIds(["test-persona-1", "unknown", "test-persona-2"]);

    // then
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("test-persona-1");
    expect(result[1].id).toBe("test-persona-2");
  });
});
