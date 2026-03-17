import type { Request, Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import type { GenerateRequest, PromptTemplate, ModelConfig } from "../../shared/types.ts";
import { getPersonasByIds } from "../../domains/persona/index.ts";
import { getFewShotExamples } from "../../domains/feedback-data/index.ts";
import { buildPrompt } from "../../domains/generation/promptBuilder.ts";
import { generateWithCallback } from "../../domains/generation/llmEngine.ts";

function loadJsonFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

export async function generateRoute(req: Request, res: Response): Promise<void> {
  const body = req.body as GenerateRequest;

  if (!body.personaIds || body.personaIds.length === 0) {
    res.status(400).json({ error: "personaIds는 필수입니다." });
    return;
  }

  const personas = getPersonasByIds(body.personaIds);
  if (personas.length === 0) {
    res.status(404).json({ error: "유효한 페르소나를 찾을 수 없습니다." });
    return;
  }

  const dataDir = join(process.cwd(), "data");
  const template = loadJsonFile<PromptTemplate>(join(dataDir, "config", "prompt-templates.json"));
  const modelConfig = loadJsonFile<ModelConfig>(join(dataDir, "config", "model.json"));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  for (const persona of personas) {
    const fewShotExamples = getFewShotExamples(persona.id);
    const prompt = buildPrompt({
      postText: body.postText,
      imageLabels: body.imageLabels,
      textAnalysis: body.textAnalysis,
      persona,
      fewShotExamples,
      template,
    });

    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent({ personaId: persona.id, personaName: persona.name, token: "", done: false });

    try {
      await generateWithCallback(prompt.system, prompt.user, modelConfig, (token) => {
        sendEvent({ personaId: persona.id, token, done: false });
      });
    } catch (error) {
      const fallback = generateFallbackResponse(persona.name);
      sendEvent({ personaId: persona.id, token: fallback, done: false });
    }

    sendEvent({ personaId: persona.id, token: "", done: true });
  }

  res.write("data: [DONE]\n\n");
  res.end();
}

function generateFallbackResponse(personaName: string): string {
  return `[${personaName}] 모델이 로드되지 않았습니다. models/ 디렉터리에 GGUF 모델을 배치해주세요.`;
}
