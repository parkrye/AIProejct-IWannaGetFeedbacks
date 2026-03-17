import { createApp, loadData, loadModel } from "./app.ts";

const PORT = 3001;

async function main(): Promise<void> {
  loadData();
  await loadModel();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`서버 시작: http://localhost:${PORT}`);
  });
}

main().catch(console.error);
