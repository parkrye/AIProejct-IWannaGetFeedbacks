import type { FeedbackExample } from "../../shared/types.ts";

const examples: FeedbackExample[] = [];

export function loadFeedbackExamples(data: readonly FeedbackExample[]): void {
  examples.length = 0;
  examples.push(...data);
}

export function getFewShotExamples(personaId: string, maxCount: number = 2): FeedbackExample[] {
  return examples.filter((e) => e.personaId === personaId).slice(0, maxCount);
}

export function getAllExamples(): FeedbackExample[] {
  return [...examples];
}
