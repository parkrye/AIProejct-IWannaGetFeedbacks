import { describe, it, expect } from "vitest";
import { snsDialogueAdapter } from "./snsDialogueAdapter.ts";

const SAMPLE_RAW = {
  header: {
    dialogueInfo: {
      dialogueID: "test-id-001",
      numberOfParticipants: 2,
      numberOfUtterances: 3,
      numberOfTurns: 2,
      source: "한국어SNS",
      single_topic: "개인 및 관계",
      multi_topic: ["사람/관계_관계_연인"],
    },
    participantsInfo: [
      { participantID: "P01", gender: "여성", age: "30대", residentialProvince: "서울특별시" },
      { participantID: "P02", gender: "남성", age: "20대", residentialProvince: "경기도" },
    ],
  },
  body: [
    { utteranceID: "U01", turnID: "T01", participantID: "P01", date: "2019-01-01", time: "10:00:00", utterance: "오늘 뭐해?" },
    { utteranceID: "U02", turnID: "T01", participantID: "P02", date: "2019-01-01", time: "10:01:00", utterance: "집에 있어" },
    { utteranceID: "U03", turnID: "T02", participantID: "P01", date: "2019-01-01", time: "10:01:00", utterance: "ㅋㅋ 나도" },
  ],
};

describe("snsDialogueAdapter", () => {
  it("should normalize raw SNS dialogue data", () => {
    // when
    const result = snsDialogueAdapter.normalize(SAMPLE_RAW);

    // then
    expect(result.id).toBe("test-id-001");
    expect(result.singleTopic).toBe("개인 및 관계");
    expect(result.topics).toEqual(["사람/관계_관계_연인"]);
    expect(result.utterances).toEqual(["오늘 뭐해?", "집에 있어", "ㅋㅋ 나도"]);
    expect(result.speakerProfiles).toHaveLength(2);
    expect(result.speakerProfiles[0].gender).toBe("여성");
    expect(result.speakerProfiles[1].age).toBe("20대");
    expect(result.source).toBe("한국어SNS");
  });

  it("should create combined text from topic and utterances", () => {
    // when
    const result = snsDialogueAdapter.normalize(SAMPLE_RAW);

    // then
    expect(result.combinedText).toContain("개인 및 관계");
    expect(result.combinedText).toContain("오늘 뭐해?");
    expect(result.combinedText).toContain("ㅋㅋ 나도");
  });
});
