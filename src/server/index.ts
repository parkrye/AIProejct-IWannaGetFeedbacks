import { createApp, loadData, loadModel } from "./app.ts";

const PORT = 3001;

async function main(): Promise<void> {
  loadData();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`서버 시작: http://localhost:${PORT}`);
  });

  // 모델은 서버 시작 후 백그라운드에서 로딩
  loadModel().then(() => {
    console.log("LLM 준비 완료 — 피드백 생성 가능");
  }).catch((error) => {
    console.warn("LLM 로딩 실패:", error);
  });
}

main().catch(console.error);
