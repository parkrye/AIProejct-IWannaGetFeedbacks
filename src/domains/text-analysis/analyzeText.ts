import type { TextAnalysisResult, Sentiment } from "../../shared/types.ts";
import { TEXT_ANALYSIS } from "../../shared/constants.ts";
import { POSITIVE_WORDS, NEGATIVE_WORDS, STOP_WORDS } from "./sentimentWords.ts";

export function analyzeText(text: string): TextAnalysisResult {
  const tokens = tokenize(text);
  const keywords = extractKeywords(tokens);
  const sentiment = analyzeSentiment(tokens);
  const topics = extractTopics(tokens);

  return { keywords, sentiment, topics };
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= TEXT_ANALYSIS.MIN_KEYWORD_LENGTH);
}

function extractKeywords(tokens: string[]): string[] {
  const frequency = new Map<string, number>();

  for (const token of tokens) {
    if (STOP_WORDS.has(token)) continue;
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TEXT_ANALYSIS.MAX_KEYWORDS)
    .map(([word]) => word);
}

function analyzeSentiment(tokens: string[]): Sentiment {
  let score = 0;

  for (const token of tokens) {
    if (matchesWordSet(token, POSITIVE_WORDS)) score += 1;
    if (matchesWordSet(token, NEGATIVE_WORDS)) score -= 1;
  }

  const totalRelevant = tokens.length || 1;
  const normalizedScore = score / totalRelevant;

  if (normalizedScore > TEXT_ANALYSIS.SENTIMENT_POSITIVE_THRESHOLD) return "positive";
  if (normalizedScore < TEXT_ANALYSIS.SENTIMENT_NEGATIVE_THRESHOLD) return "negative";
  if (score !== 0) return "mixed";
  return "neutral";
}

function matchesWordSet(token: string, wordSet: ReadonlySet<string>): boolean {
  for (const word of wordSet) {
    if (token.includes(word)) return true;
  }
  return false;
}

function extractTopics(tokens: string[]): string[] {
  const nounLikeTokens = tokens.filter(
    (t) => t.length >= 2 && !STOP_WORDS.has(t) && /[가-힣]/.test(t),
  );

  const frequency = new Map<string, number>();
  for (const token of nounLikeTokens) {
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}
