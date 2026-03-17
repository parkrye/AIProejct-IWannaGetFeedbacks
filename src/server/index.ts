import express from "express";
import { join } from "path";
import { existsSync } from "fs";
import { analyzeRoute } from "./routes/analyzeRoute.ts";
import { generateRoute } from "./routes/generateRoute.ts";
import { listPersonasRoute, listCategoriesRoute } from "./routes/personaRoute.ts";
import { loadPersonasFromDirectory } from "../domains/persona/index.ts";
import { loadFeedbackDataFromFile } from "../domains/feedback-data/index.ts";
import { initializeModel } from "../domains/generation/index.ts";
import type { ModelConfig } from "../shared/types.ts";

const PORT = 3001;

export function createApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  app.post("/api/analyze", analyzeRoute);
  app.post("/api/generate", generateRoute);
  app.get("/api/personas", listPersonasRoute);
  app.get("/api/personas/categories", listCategoriesRoute);

  return app;
}

async function loadData(): Promise<void> {
  const dataDir = join(process.cwd(), "data");

  loadPersonasFromDirectory(join(dataDir, "personas"));
  loadFeedbackDataFromFile(join(dataDir, "feedback-examples", "examples.json"));

  const modelConfigPath = join(dataDir, "config", "model.json");
  const modelConfig: ModelConfig = JSON.parse(
    (await import("fs")).readFileSync(modelConfigPath, "utf-8"),
  );

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

async function main(): Promise<void> {
  await loadData();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`서버 시작: http://localhost:${PORT}`);
  });
}

main().catch(console.error);
