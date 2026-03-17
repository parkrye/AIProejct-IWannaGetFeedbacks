import type { NormalizedDialogue, RawDataAdapter } from "../types.ts";

interface TermUsageRaw {
  readonly id: number;
  readonly sentence: string;
  readonly tokens: readonly {
    readonly sub: string;
    readonly facet: string;
  }[];
  readonly source: {
    readonly uri: string;
    readonly text: string;
    readonly written_at: string;
  };
}

export const cultureTermUsageAdapter: RawDataAdapter<TermUsageRaw> = {
  name: "culture-term-usage",

  normalize(raw: TermUsageRaw): NormalizedDialogue {
    const terms = raw.tokens.map((t) => t.sub);
    const facets = raw.tokens.map((t) => t.facet);
    const sentences = splitSentences(raw.source.text);

    const combinedText = [
      ...facets,
      ...terms,
      raw.source.text,
    ].join(" ");

    return {
      id: `ctu-${raw.id}`,
      topics: facets,
      singleTopic: facets[0] ?? "문화/게임",
      utterances: sentences,
      speakerProfiles: [],
      source: extractDomain(raw.source.uri),
      combinedText,
    };
  },
};

function splitSentences(text: string): string[] {
  return text
    .split(/[.\n!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function extractDomain(uri: string): string {
  try {
    const url = new URL(uri);
    return url.hostname;
  } catch {
    return "unknown";
  }
}
