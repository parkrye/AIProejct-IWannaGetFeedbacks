import type { NormalizedDialogue, RawDataAdapter } from "../types.ts";

interface OnlineColloquialRaw {
  readonly header: {
    readonly identifier: string;
    readonly subject: string;
  };
  readonly named_entity: readonly {
    readonly content: readonly {
      readonly sentence: string;
      readonly labels: readonly {
        readonly label?: string;
      }[];
    }[];
    readonly writer: string;
    readonly write_date: string;
    readonly url: string;
    readonly parent_url: string;
    readonly source_site: string;
  }[];
}

export interface OnlineColloquialEntry {
  readonly fileId: string;
  readonly category: string;
  readonly sentence: string;
  readonly labels: readonly string[];
  readonly sourceSite: string;
  readonly writeDate: string;
}

export function extractEntries(raw: OnlineColloquialRaw, category: string): OnlineColloquialEntry[] {
  const fileId = raw.header.identifier;
  const entries: OnlineColloquialEntry[] = [];

  for (const entity of raw.named_entity) {
    for (const content of entity.content) {
      const sentence = content.sentence.trim();
      if (sentence.length < 5) continue;

      entries.push({
        fileId,
        category,
        sentence,
        labels: content.labels
          .map((l) => l.label)
          .filter((l): l is string => l !== undefined),
        sourceSite: entity.source_site,
        writeDate: entity.write_date,
      });
    }
  }

  return entries;
}

export const onlineColloquialAdapter: RawDataAdapter<OnlineColloquialEntry> = {
  name: "online-colloquial",

  normalize(raw: OnlineColloquialEntry): NormalizedDialogue {
    const topics = [raw.category, ...raw.labels];

    return {
      id: `oc-${raw.fileId}-${hashCode(raw.sentence)}`,
      topics,
      singleTopic: raw.category,
      utterances: [raw.sentence],
      speakerProfiles: [],
      source: raw.sourceSite,
      combinedText: `${raw.category} ${raw.labels.join(" ")} ${raw.sentence}`,
    };
  },
};

function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}
