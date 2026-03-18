import type {
  Persona,
  PersonaProfile,
  PersonaParams,
  TextAnalysisResult,
  ImageLabel,
  PromptTemplate,
  FeedbackExample,
  GenerationParams,
} from "../../shared/types.ts";
import type { SearchResult } from "../rag/types.ts";

interface PromptContext {
  readonly postText: string;
  readonly imageLabels: readonly ImageLabel[];
  readonly textAnalysis: TextAnalysisResult;
  readonly persona: Persona;
  readonly fewShotExamples: readonly FeedbackExample[];
  readonly template: PromptTemplate;
  readonly ragResults?: readonly SearchResult[];
  readonly generationParams?: GenerationParams;
}

export function buildPrompt(context: PromptContext): { system: string; user: string } {
  const imageInfo = formatImageLabels(context.imageLabels);
  const fewShotSection = formatFewShotExamples(context.fewShotExamples);

  const user = context.template.userTemplate
    .replace("{{postText}}", context.postText || "(텍스트 없음)")
    .replace("{{imageInfo}}", imageInfo || "(이미지 없음)")
    .replace("{{keywords}}", context.textAnalysis.keywords.join(", ") || "(없음)")
    .replace("{{sentiment}}", translateSentiment(context.textAnalysis.sentiment))
    .replace("{{personaName}}", context.persona.name)
    .replace("{{promptHint}}", context.persona.promptHint)
    .replace("{{examplePatterns}}", context.persona.examplePatterns.join(" / "));

  const ragSection = formatRagResults(context.ragResults ?? []);
  const profileSection = formatPersonaProfile(context.persona.profile);
  const mergedParams = mergeParams(context.generationParams, context.persona.params);
  const paramsSection = formatGenerationParams(mergedParams);
  const sections = [ragSection, fewShotSection, profileSection, paramsSection, user].filter(Boolean);
  const fullUser = sections.join("\n\n");

  return {
    system: context.template.system,
    user: fullUser,
  };
}

function formatImageLabels(labels: readonly ImageLabel[]): string {
  if (labels.length === 0) return "";
  return labels.map((l) => `${l.label} (${(l.confidence * 100).toFixed(0)}%)`).join(", ");
}

function formatFewShotExamples(examples: readonly FeedbackExample[]): string {
  if (examples.length === 0) return "";

  const lines = examples.map(
    (e, i) => `예시 ${i + 1}:\n상황: ${e.context}\n댓글: ${e.feedback}`,
  );
  return `[참고 예시]\n${lines.join("\n\n")}`;
}

function formatRagResults(results: readonly SearchResult[]): string {
  if (results.length === 0) return "";

  const lines = results.map((r, i) => {
    const topic = r.entry.metadata.singleTopic;
    const utterances = r.entry.metadata.sampleUtterances.join(" / ");
    return `대화 ${i + 1} (주제: ${topic}):\n${utterances}`;
  });
  return `[실제 SNS 대화 참고]\n${lines.join("\n\n")}`;
}

function formatGenerationParams(params?: GenerationParams): string {
  if (!params) return "";

  const instructions: string[] = [];

  if (params.positivity <= 2) instructions.push("매우 부정적이고 비판적인 톤으로 작성하세요.");
  else if (params.positivity <= 4) instructions.push("다소 부정적인 톤으로 작성하세요.");
  else if (params.positivity >= 8) instructions.push("매우 긍정적이고 칭찬하는 톤으로 작성하세요.");
  else if (params.positivity >= 6) instructions.push("긍정적인 톤으로 작성하세요.");

  if (params.nonsense >= 8) instructions.push("게시글 내용과 상관없이 자유롭게 연상되는 내용을 작성하세요.");
  else if (params.nonsense >= 5) instructions.push("게시글 내용을 참고하되 자유롭게 벗어나도 됩니다.");
  else if (params.nonsense <= 2) instructions.push("게시글 내용에 충실하게 반응하세요.");

  if (params.verbosity <= 2) instructions.push("한 줄 이내로 아주 짧게 작성하세요.");
  else if (params.verbosity <= 4) instructions.push("짧게 작성하세요.");
  else if (params.verbosity >= 8) instructions.push("길고 상세하게 작성하세요.");

  if (params.emoji >= 8) instructions.push("이모지를 많이 사용하세요.");
  else if (params.emoji >= 5) instructions.push("이모지를 적절히 사용하세요.");
  else if (params.emoji <= 1) instructions.push("이모지를 사용하지 마세요.");

  if (params.formality <= 2) instructions.push("반말과 인터넷 은어를 사용하세요.");
  else if (params.formality <= 4) instructions.push("캐주얼한 말투로 작성하세요.");
  else if (params.formality >= 8) instructions.push("격식체를 사용하세요.");

  if (instructions.length === 0) return "";
  return `[댓글 스타일 지시]\n${instructions.join("\n")}`;
}

function formatPersonaProfile(profile?: PersonaProfile): string {
  if (!profile) return "";

  const lines: string[] = [];
  if (profile.age) lines.push(`나이: ${profile.age}세`);
  if (profile.gender) lines.push(`성별: ${profile.gender}`);
  if (profile.interests && profile.interests.length > 0) {
    lines.push(`관심사: ${profile.interests.join(", ")}`);
  }

  if (lines.length === 0) return "";
  return `[댓글 작성자 프로필]\n${lines.join("\n")}`;
}

function mergeParams(
  globalParams?: GenerationParams,
  personaParams?: PersonaParams,
): GenerationParams | undefined {
  if (!globalParams && !personaParams) return undefined;
  if (!globalParams) return personaParams as GenerationParams;
  if (!personaParams) return globalParams;

  return {
    positivity: personaParams.positivity ?? globalParams.positivity,
    nonsense: personaParams.nonsense ?? globalParams.nonsense,
    verbosity: personaParams.verbosity ?? globalParams.verbosity,
    emoji: personaParams.emoji ?? globalParams.emoji,
    formality: personaParams.formality ?? globalParams.formality,
  };
}

function translateSentiment(sentiment: string): string {
  const map: Record<string, string> = {
    positive: "긍정적",
    negative: "부정적",
    neutral: "중립적",
    mixed: "복합적",
  };
  return map[sentiment] ?? sentiment;
}
