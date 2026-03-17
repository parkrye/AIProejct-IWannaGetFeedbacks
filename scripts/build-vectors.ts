import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { snsDialogueAdapter } from "../src/domains/rag/adapters/snsDialogueAdapter.ts";
import { initEmbedder, embed, disposeEmbedder } from "../src/domains/rag/embedder.ts";
import { addEntry, saveToBinary, getEntryCount } from "../src/domains/rag/vectorStore.ts";
import type { VectorMetadata, NormalizedDialogue } from "../src/domains/rag/types.ts";

const DATA_DIR = process.argv[2];
const OUTPUT_PATH = process.argv[3] ?? join(process.cwd(), "data", "vector-store", "dialogues.bin");
const BATCH_LOG_INTERVAL = 1000;

if (!DATA_DIR) {
  console.error("Usage: tsx scripts/build-vectors.ts <data-dir> [output-path]");
  console.error("Example: tsx scripts/build-vectors.ts 'C:\\path\\to\\VL'");
  process.exit(1);
}

function toMetadata(dialogue: NormalizedDialogue): VectorMetadata {
  const maxSamples = 3;
  return {
    singleTopic: dialogue.singleTopic,
    topics: dialogue.topics,
    speakerGenders: dialogue.speakerProfiles.map((p) => p.gender ?? "unknown"),
    speakerAges: dialogue.speakerProfiles.map((p) => p.age ?? "unknown"),
    utteranceCount: dialogue.utterances.length,
    sampleUtterances: dialogue.utterances.slice(0, maxSamples),
  };
}

function truncateText(text: string, maxLength: number = 512): string {
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

async function main(): Promise<void> {
  console.log(`데이터 디렉터리: ${DATA_DIR}`);
  console.log(`출력 파일: ${OUTPUT_PATH}`);

  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  console.log(`JSON 파일 수: ${files.length}`);

  console.log("임베딩 모델 초기화 중...");
  await initEmbedder();
  console.log("임베딩 모델 준비 완료");

  const startTime = Date.now();
  let processed = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const filePath = join(DATA_DIR, file);
      const raw = JSON.parse(readFileSync(filePath, "utf-8"));
      const dialogue = snsDialogueAdapter.normalize(raw);
      const metadata = toMetadata(dialogue);

      const textForEmbedding = truncateText(dialogue.combinedText);
      const vector = await embed(textForEmbedding);

      addEntry(dialogue.id, vector, metadata);
      processed++;

      if (processed % BATCH_LOG_INTERVAL === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = processed / elapsed;
        const remaining = (files.length - processed) / rate;
        console.log(
          `진행: ${processed}/${files.length} (${((processed / files.length) * 100).toFixed(1)}%) ` +
          `| ${rate.toFixed(1)}건/초 | 예상 잔여: ${formatTime(remaining)}`,
        );
      }
    } catch (error) {
      errors++;
      if (errors <= 10) {
        console.warn(`오류 (${file}):`, (error as Error).message);
      }
    }
  }

  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`\n처리 완료: ${processed}건 성공, ${errors}건 오류`);
  console.log(`소요 시간: ${formatTime(totalTime)}`);

  console.log("벡터 스토어 저장 중...");
  saveToBinary(OUTPUT_PATH);
  console.log(`저장 완료: ${OUTPUT_PATH} (${getEntryCount()}건)`);

  disposeEmbedder();
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}초`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}분`;
  return `${(seconds / 3600).toFixed(1)}시간`;
}

main().catch((error) => {
  console.error("치명적 오류:", error);
  process.exit(1);
});
