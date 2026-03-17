import type { NormalizedDialogue, RawDataAdapter, SpeakerProfile } from "../types.ts";

interface MultiSessionRaw {
  readonly FileInfo: {
    readonly filename: string;
  };
  readonly participantsInfo: {
    readonly speaker1: {
      readonly gender: string;
      readonly age: string;
      readonly occupation: string;
      readonly rPlace: string;
    };
    readonly speaker2: {
      readonly gender: string;
      readonly age: string;
      readonly occupation: string;
      readonly rPlace: string;
    };
  };
  readonly personaInfo: {
    readonly clInfo: {
      readonly personaFeatures: readonly string[];
    };
    readonly cpInfo: {
      readonly personaFeatures: readonly string[];
    };
  };
  readonly topicInfo: {
    readonly topicID: string;
    readonly topicType: string;
    readonly topicTitle: string;
  };
  readonly sessionInfo: readonly {
    readonly dialog: readonly {
      readonly utterance: string;
      readonly speaker: string;
    }[];
  }[];
}

export const multiSessionDialogueAdapter: RawDataAdapter<MultiSessionRaw> = {
  name: "multi-session-dialogue",

  normalize(raw: MultiSessionRaw): NormalizedDialogue {
    const topic = raw.topicInfo;
    const allUtterances: string[] = [];

    for (const session of raw.sessionInfo) {
      for (const turn of session.dialog) {
        allUtterances.push(turn.utterance);
      }
    }

    const speakerProfiles: SpeakerProfile[] = [
      {
        gender: raw.participantsInfo.speaker1.gender,
        age: raw.participantsInfo.speaker1.age,
        region: raw.participantsInfo.speaker1.rPlace,
      },
      {
        gender: raw.participantsInfo.speaker2.gender,
        age: raw.participantsInfo.speaker2.age,
        region: raw.participantsInfo.speaker2.rPlace,
      },
    ];

    const personaFeatures = [
      ...raw.personaInfo.clInfo.personaFeatures,
      ...raw.personaInfo.cpInfo.personaFeatures,
    ];

    const topics = [topic.topicType, topic.topicTitle];

    const combinedText = [
      topic.topicType,
      topic.topicTitle,
      ...personaFeatures,
      ...allUtterances,
    ].join(" ");

    const fileId = raw.FileInfo.filename.replace(".json", "");

    return {
      id: `msd-${fileId}`,
      topics,
      singleTopic: topic.topicType,
      utterances: allUtterances,
      speakerProfiles,
      source: "한국어멀티세션대화",
      combinedText,
    };
  },
};
