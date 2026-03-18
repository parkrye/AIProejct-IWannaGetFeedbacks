import type { Persona, TextAnalysisResult } from "../../shared/types.ts";
import { getAllPersonas } from "./personaRegistry.ts";

const MIN_MATCH_SCORE = 0.1;
const DEFAULT_DYNAMIC_COUNT = 3;

const GROUP_THRESHOLD_SMALL = 5;
const GROUP_THRESHOLD_MEDIUM = 10;
const GROUP_SELECT_MEDIUM = 5;
const GROUP_SELECT_LARGE_MATCHED = 4;
const GROUP_SELECT_LARGE_RANDOM = 4;

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

  const scored = scorePersonas(allPersonas, textAnalysis, postText);
  const matched = scored.filter((s) => s.score >= MIN_MATCH_SCORE).slice(0, maxCount);

  if (matched.length === 0) {
    return scored.slice(0, Math.min(maxCount, allPersonas.length)).map((s) => s.persona);
  }

  return matched.map((s) => s.persona);
}

export function selectFromGroup(
  groupPersonas: Persona[],
  textAnalysis: TextAnalysisResult,
  postText: string,
): Persona[] {
  if (groupPersonas.length <= GROUP_THRESHOLD_SMALL) {
    return groupPersonas;
  }

  const scored = scorePersonas(groupPersonas, textAnalysis, postText);

  if (groupPersonas.length <= GROUP_THRESHOLD_MEDIUM) {
    return scored.slice(0, GROUP_SELECT_MEDIUM).map((s) => s.persona);
  }

  const matched = scored.slice(0, GROUP_SELECT_LARGE_MATCHED);
  const matchedIds = new Set(matched.map((s) => s.persona.id));

  const remaining = groupPersonas.filter((p) => !matchedIds.has(p.id));
  const randomPicks = shuffleArray([...remaining]).slice(0, GROUP_SELECT_LARGE_RANDOM);

  return [...matched.map((s) => s.persona), ...randomPicks];
}

function scorePersonas(
  personas: Persona[],
  textAnalysis: TextAnalysisResult,
  postText: string,
): ScoredPersona[] {
  const postKeywords = new Set([
    ...textAnalysis.keywords.map((k) => k.toLowerCase()),
    ...textAnalysis.topics.map((t) => t.toLowerCase()),
  ]);
  const postTextLower = postText.toLowerCase();

  const scored: ScoredPersona[] = personas.map((persona) => ({
    persona,
    score: calculateMatchScore(persona, postKeywords, postTextLower),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored;
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

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
