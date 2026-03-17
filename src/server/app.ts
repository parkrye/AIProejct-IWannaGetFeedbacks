import express from "express";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { analyzeRoute } from "./routes/analyzeRoute.ts";
import { generateRoute } from "./routes/generateRoute.ts";
import { listPersonasRoute, listCategoriesRoute } from "./routes/personaRoute.ts";
import { loadPersonasFromDirectory } from "../domains/persona/index.ts";
import { loadFeedbackDataFromFile } from "../domains/feedback-data/index.ts";
import { initializeModel } from "../domains/generation/index.ts";
import { loadFromBinary, getEntryCount } from "../domains/rag/index.ts";
import type { ModelConfig } from "../shared/types.ts";

const VECTOR_STORE_PATH = "data/vector-store/dialogues.bin";

export function createApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  app.post("/api/analyze", analyzeRoute);
  app.post("/api/generate", generateRoute);
  app.get("/api/personas", listPersonasRoute);
  app.get("/api/personas/categories", listCategoriesRoute);

  return app;
}

export function loadData(dataDir?: string): void {
  const dir = dataDir ?? join(process.cwd(), "data");

  loadPersonasFromDirectory(join(dir, "personas"));
  loadFeedbackDataFromFile(join(dir, "feedback-examples", "examples.json"));

  const vectorStorePath = join(process.cwd(), VECTOR_STORE_PATH);
  if (existsSync(vectorStorePath)) {
    console.log("벡터 스토어 로딩 중...");
    loadFromBinary(vectorStorePath);
    console.log(`벡터 스토어 로딩 완료: ${getEntryCount()}건`);
  } else {
    console.warn("벡터 스토어 없음 — RAG 비활성화 (scripts/build-vectors.ts를 실행하세요)");
  }
}

export async function loadModel(dataDir?: string): Promise<void> {
  const dir = dataDir ?? join(process.cwd(), "data");
  const modelConfigPath = join(dir, "config", "model.json");
  const modelConfig: ModelConfig = JSON.parse(readFileSync(modelConfigPath, "utf-8"));

  if (existsSync(modelConfig.modelPath)) {
    console.log(`모델 로딩 중: ${modelConfig.modelPath}`);
    try {
      await initializeModel(modelConfig);
      console.log("모델 로딩 완료");
    } catch (error) {
      console.warn("모델 로딩 실패 — 폴백 모드로 실행됩니다:", error);
    }
  } else {
    console.warn(`모델 파일을 찾을 수 없습니다: ${modelConfig.modelPath}`);
    console.warn("models/ 디렉터리에 GGUF 모델을 배치해주세요.");
    console.warn("폴백 모드로 실행됩니다.");
  }
}

export function createTestApp(dataDir?: string): express.Express {
  loadData(dataDir);
  return createApp();
}
