import type { Persona, TextAnalysisResult } from "../../shared/types.ts";
import { getAllPersonas } from "./personaRegistry.ts";

const MIN_MATCH_SCORE = 0.1;
const DEFAULT_DYNAMIC_COUNT = 3;

interface ScoredPersona {
  readonly persona: Persona;
  readonly score: number;
}

export function matchPersonasByContent(
  textAnalysis: TextAnalysisResult,
  postText: string,
  maxCount: number = DEFAULT_DYNAMIC_COUNT,
): Persona[] {
  const allPersonas = getAllPersonas();
  if (allPersonas.length === 0) return [];

  const postKeywords = new Set([
    ...textAnalysis.keywords.map((k) => k.toLowerCase()),
    ...textAnalysis.topics.map((t) => t.toLowerCase()),
  ]);
  const postTextLower = postText.toLowerCase();

  const scored: ScoredPersona[] = allPersonas.map((persona) => ({
    persona,
    score: calculateMatchScore(persona, postKeywords, postTextLower),
  }));

  scored.sort((a, b) => b.score - a.score);

  const matched = scored.filter((s) => s.score >= MIN_MATCH_SCORE).slice(0, maxCount);

  if (matched.length === 0) {
    return scored.slice(0, Math.min(maxCount, allPersonas.length)).map((s) => s.persona);
  }

  return matched.map((s) => s.persona);
}

function calculateMatchScore(
  persona: Persona,
  postKeywords: Set<string>,
  postTextLower: string,
): number {
  let score = 0;

  const interests = persona.profile?.interests ?? [];
  for (const interest of interests) {
    const interestLower = interest.toLowerCase();

    if (postKeywords.has(interestLower)) {
      score += 3;
    } else if (postTextLower.includes(interestLower)) {
      score += 2;
    } else if (hasPartialMatch(interestLower, postKeywords)) {
      score += 1;
    }
  }

  if (interests.length > 0) {
    score = score / interests.length;
  }

  return score;
}

function hasPartialMatch(interest: string, keywords: Set<string>): boolean {
  for (const keyword of keywords) {
    if (keyword.includes(interest) || interest.includes(keyword)) {
      return true;
    }
  }
  return false;
}
