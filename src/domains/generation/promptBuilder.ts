import type {
  Persona,
  TextAnalysisResult,
  ImageLabel,
  PromptTemplate,
  FeedbackExample,
} from "../../shared/types.ts";

interface PromptContext {
  readonly postText: string;
  readonly imageLabels: readonly ImageLabel[];
  readonly textAnalysis: TextAnalysisResult;
  readonly persona: Persona;
  readonly fewShotExamples: readonly FeedbackExample[];
  readonly template: PromptTemplate;
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

  const fullUser = fewShotSection ? `${fewShotSection}\n\n${user}` : user;

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

function translateSentiment(sentiment: string): string {
  const map: Record<string, string> = {
    positive: "긍정적",
    negative: "부정적",
    neutral: "중립적",
    mixed: "복합적",
  };
  return map[sentiment] ?? sentiment;
}
