import type { NormalizedDialogue, RawDataAdapter } from "../types.ts";

interface TermDefRaw {
  readonly id: number;
  readonly term: string;
  readonly sense_no: number;
  readonly definition: string;
  readonly pos: string;
  readonly bts?: readonly { readonly term: string }[];
  readonly nts?: readonly { readonly term: string }[];
  readonly rts?: readonly { readonly type: string; readonly term: string }[];
  readonly facets?: readonly string[];
}

export const cultureTermDefAdapter: RawDataAdapter<TermDefRaw> = {
  name: "culture-term-def",

  normalize(raw: TermDefRaw): NormalizedDialogue {
    const relatedTerms = [
      ...(raw.bts ?? []).map((r) => r.term),
      ...(raw.nts ?? []).map((r) => r.term),
      ...(raw.rts ?? []).map((r) => r.term),
    ];

    const facets = raw.facets ?? [];
    const topics = facets.length > 0 ? facets : ["문화/게임용어"];

    const combinedText = [
      raw.term,
      raw.definition,
      ...relatedTerms,
      ...topics,
    ].join(" ");

    return {
      id: `ctd-${raw.id}`,
      topics,
      singleTopic: topics[0],
      utterances: [
        `${raw.term}: ${raw.definition}`,
        ...relatedTerms.map((t) => `관련어: ${t}`),
      ],
      speakerProfiles: [],
      source: "용어사전",
      combinedText,
    };
  },
};
