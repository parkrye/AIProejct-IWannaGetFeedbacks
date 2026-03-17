import type { NormalizedDialogue, RawDataAdapter, SpeakerProfile } from "../types.ts";

interface SnsDialogueRaw {
  readonly header: {
    readonly dialogueInfo: {
      readonly dialogueID: string;
      readonly numberOfUtterances: number;
      readonly source: string;
      readonly single_topic: string;
      readonly multi_topic: readonly string[];
    };
    readonly participantsInfo: readonly {
      readonly participantID: string;
      readonly gender: string;
      readonly age: string;
      readonly residentialProvince: string;
    }[];
  };
  readonly body: readonly {
    readonly utteranceID: string;
    readonly participantID: string;
    readonly utterance: string;
  }[];
}

export const snsDialogueAdapter: RawDataAdapter<SnsDialogueRaw> = {
  name: "sns-dialogue",

  normalize(raw: SnsDialogueRaw): NormalizedDialogue {
    const info = raw.header.dialogueInfo;
    const utterances = raw.body.map((u) => u.utterance);

    const speakerProfiles: SpeakerProfile[] = raw.header.participantsInfo.map(
      (p) => ({
        gender: p.gender,
        age: p.age,
        region: p.residentialProvince,
      }),
    );

    const combinedText = [
      info.single_topic,
      ...info.multi_topic,
      ...utterances,
    ].join(" ");

    return {
      id: info.dialogueID,
      topics: info.multi_topic,
      singleTopic: info.single_topic,
      utterances,
      speakerProfiles,
      source: info.source,
      combinedText,
    };
  },
};
