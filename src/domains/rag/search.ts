import type { VectorEntry, SearchResult, SearchFilter } from "./types.ts";
import { getAllEntries } from "./vectorStore.ts";

const DEFAULT_TOP_K = 5;
const DEFAULT_PRE_FILTER_LIMIT = 3000;

export function search(
  queryVector: Float32Array,
  topK: number = DEFAULT_TOP_K,
  filter?: SearchFilter,
): SearchResult[] {
  const allEntries = getAllEntries();
  const candidates = filter
    ? filterByMetadata(allEntries, filter, DEFAULT_PRE_FILTER_LIMIT)
    : allEntries;

  return findTopK(candidates, queryVector, topK);
}

function filterByMetadata(
  entries: readonly VectorEntry[],
  filter: SearchFilter,
  limit: number,
): VectorEntry[] {
  const results: VectorEntry[] = [];

  for (const entry of entries) {
    if (results.length >= limit) break;

    if (filter.topic && !matchesTopic(entry, filter.topic)) continue;
    if (filter.gender && !entry.metadata.speakerGenders.includes(filter.gender)) continue;
    if (filter.age && !entry.metadata.speakerAges.includes(filter.age)) continue;

    results.push(entry);
  }

  return results.length > 0 ? results : entries.slice(0, limit);
}

function matchesTopic(entry: VectorEntry, topic: string): boolean {
  const lowerTopic = topic.toLowerCase();
  if (entry.metadata.singleTopic.toLowerCase().includes(lowerTopic)) return true;
  return entry.metadata.topics.some((t) => t.toLowerCase().includes(lowerTopic));
}

function findTopK(
  entries: readonly VectorEntry[],
  queryVector: Float32Array,
  topK: number,
): SearchResult[] {
  const scored: SearchResult[] = entries.map((entry) => ({
    entry,
    score: cosineSimilarity(queryVector, entry.vector),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}
