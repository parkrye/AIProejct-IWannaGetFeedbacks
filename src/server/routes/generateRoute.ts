import type { Request, Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import type { GenerateRequest, PromptTemplate, ModelConfig } from "../../shared/types.ts";
import { getPersonasByIds } from "../../domains/persona/index.ts";
import { getFewShotExamples } from "../../domains/feedback-data/index.ts";
import { buildPrompt } from "../../domains/generation/promptBuilder.ts";
import { generateWithCallback } from "../../domains/generation/llmEngine.ts";
import { search, getEntryCount } from "../../domains/rag/index.ts";
import { embed, initEmbedder } from "../../domains/rag/embedder.ts";
import type { SearchResult } from "../../domains/rag/types.ts";

const RAG_TOP_K = 3;

let embedderReady = false;

function loadJsonFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

async function getRagResults(postText: string): Promise<SearchResult[]> {
  if (getEntryCount() === 0) return [];

  try {
    if (!embedderReady) {
      await initEmbedder();
      embedderReady = true;
    }
    const queryVector = await embed(postText);
    return search(queryVector, RAG_TOP_K);
  } catch (error) {
    console.warn("RAG 검색 실패:", (error as Error).message);
    return [];
  }
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

  const ragResults = await getRagResults(body.postText);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const totalPersonas = personas.length;
  const maxTokens = modelConfig.maxTokens;

  for (let i = 0; i < personas.length; i++) {
    const persona = personas[i];
    const fewShotExamples = getFewShotExamples(persona.id);
    const prompt = buildPrompt({
      postText: body.postText,
      imageLabels: body.imageLabels,
      textAnalysis: body.textAnalysis,
      persona,
      fewShotExamples,
      template,
      ragResults,
      generationParams: body.generationParams,
    });

    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent({
      personaId: persona.id,
      personaName: persona.name,
      token: "",
      done: false,
      progress: { current: i, total: totalPersonas, tokenCount: 0, maxTokens },
    });

    let tokenCount = 0;
    try {
      await generateWithCallback(prompt.system, prompt.user, modelConfig, (token) => {
        tokenCount++;
        sendEvent({
          personaId: persona.id,
          token,
          done: false,
          progress: { current: i, total: totalPersonas, tokenCount, maxTokens },
        });
      });
    } catch (error) {
      console.error(`생성 오류 [${persona.id}]:`, error);
      const fallback = generateFallbackResponse(persona.name, error);
      sendEvent({ personaId: persona.id, token: fallback, done: false });
    }

    sendEvent({
      personaId: persona.id,
      token: "",
      done: true,
      progress: { current: i + 1, total: totalPersonas, tokenCount, maxTokens },
    });
  }

  res.write("data: [DONE]\n\n");
  res.end();
}

function generateFallbackResponse(personaName: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `[${personaName}] 생성 실패: ${message}`;
}
