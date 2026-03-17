import { describe, it, expect } from "vitest";
import { multiSessionDialogueAdapter } from "./multiSessionDialogueAdapter.ts";

const SAMPLE_RAW = {
  FileInfo: { filename: "K2-00006-test.json", sessionLevel: "2" },
  participantsInfo: {
    numberOfParticipants: "2",
    speaker1: {
      participantID: "24113", gender: "여성", age: "20대",
      occupation: "학생", bPlace: "서울", gPlace: "서울", rPlace: "서울/경기/인천", educationLevel: "대졸",
    },
    speaker2: {
      participantID: "24915", gender: "여성", age: "40대",
      occupation: "주부", bPlace: "광주", gPlace: "광주", rPlace: "광주/전라/제주", educationLevel: "고졸",
    },
  },
  multisessionInfo: { multisessionID: "2-00006" },
  personaInfo: {
    clInfo: {
      personaID: "01979",
      personaFeatures: ["나는 여자이다.", "나는 20대이다."],
      speakerType: "speaker1",
    },
    cpInfo: {
      personaID: "03724",
      personaFeatures: ["나는 여자이다.", "나는 40대이다."],
      speakerType: "speaker2",
    },
  },
  topicInfo: { topicID: "06-09", topicType: "교육", topicTitle: "전공" },
  sessionInfo: [
    {
      prevSessionID: null,
      nthSession: "1",
      numberOfUtterances: "3",
      numberOfTurns: "2",
      sessionID: "2-00006-1",
      dialog: [
        { speaker: "speaker1", personaID: "01979", participantID: "24113", utterance: "안녕하세요!", summary: "", date: "2022-09-06", time: "14:16:45", terminate: "false" },
        { speaker: "speaker2", personaID: "03724", participantID: "24915", utterance: "네 반갑습니다~", summary: "", date: "2022-09-06", time: "14:16:56", terminate: "false" },
        { speaker: "speaker1", personaID: "01979", participantID: "24113", utterance: "전공이 뭐예요?", summary: "", date: "2022-09-06", time: "14:17:04", terminate: "false" },
      ],
    },
  ],
};

describe("multiSessionDialogueAdapter", () => {
  it("should normalize multi-session dialogue data", () => {
    // when
    const result = multiSessionDialogueAdapter.normalize(SAMPLE_RAW);

    // then
    expect(result.id).toBe("msd-K2-00006-test");
    expect(result.singleTopic).toBe("교육");
    expect(result.topics).toEqual(["교육", "전공"]);
    expect(result.utterances).toEqual(["안녕하세요!", "네 반갑습니다~", "전공이 뭐예요?"]);
    expect(result.speakerProfiles).toHaveLength(2);
    expect(result.speakerProfiles[0].gender).toBe("여성");
    expect(result.speakerProfiles[0].age).toBe("20대");
    expect(result.speakerProfiles[1].age).toBe("40대");
    expect(result.source).toBe("한국어멀티세션대화");
  });

  it("should include persona features and topic in combined text", () => {
    // when
    const result = multiSessionDialogueAdapter.normalize(SAMPLE_RAW);

    // then
    expect(result.combinedText).toContain("교육");
    expect(result.combinedText).toContain("전공");
    expect(result.combinedText).toContain("나는 20대이다.");
    expect(result.combinedText).toContain("안녕하세요!");
  });
});
