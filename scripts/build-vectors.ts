import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { snsDialogueAdapter } from "../src/domains/rag/adapters/snsDialogueAdapter.ts";
import { cultureTermUsageAdapter } from "../src/domains/rag/adapters/cultureTermUsageAdapter.ts";
import { cultureTermDefAdapter } from "../src/domains/rag/adapters/cultureTermDefAdapter.ts";
import { multiSessionDialogueAdapter } from "../src/domains/rag/adapters/multiSessionDialogueAdapter.ts";
import { initEmbedder, embed, disposeEmbedder } from "../src/domains/rag/embedder.ts";
import { addEntry, saveToBinary, getEntryCount, loadFromBinary } from "../src/domains/rag/vectorStore.ts";
import type { VectorMetadata, NormalizedDialogue, RawDataAdapter } from "../src/domains/rag/types.ts";
import { existsSync } from "fs";

const OUTPUT_PATH = join(process.cwd(), "data", "vector-store", "dialogues.bin");
const BATCH_LOG_INTERVAL = 1000;

type SourceType = "sns-dialogue" | "culture-usage" | "culture-def" | "multi-session";

const SOURCE_TYPES: Record<SourceType, string> = {
  "sns-dialogue": "SNS 대화 데이터 (파일당 1건 JSON)",
  "culture-usage": "문화/게임 용례 데이터 (배열 JSON)",
  "culture-def": "문화/게임 용어 정의 데이터 (배열 JSON)",
  "multi-session": "한국어 멀티세션 대화 데이터 (파일당 1건 JSON)",
};

function printUsage(): void {
  console.log("Usage: tsx scripts/build-vectors.ts <source-type> <data-dir>");
  console.log("");
  console.log("Source types:");
  for (const [key, desc] of Object.entries(SOURCE_TYPES)) {
    console.log(`  ${key.padEnd(20)} ${desc}`);
  }
  console.log("");
  console.log("Options:");
  console.log("  --append    기존 벡터 스토어에 추가 (기본: 덮어쓰기)");
  console.log("");
  console.log("Examples:");
  console.log("  tsx scripts/build-vectors.ts sns-dialogue 'C:\\path\\to\\VL'");
  console.log("  tsx scripts/build-vectors.ts culture-usage 'C:\\path\\to\\VL' --append");
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

async function processEntry(dialogue: NormalizedDialogue): Promise<void> {
  const metadata = toMetadata(dialogue);
  const textForEmbedding = truncateText(dialogue.combinedText);
  const vector = await embed(textForEmbedding);
  addEntry(dialogue.id, vector, metadata);
}

async function processSingleFileJson<T>(
  dataDir: string,
  adapter: RawDataAdapter<T>,
): Promise<{ processed: number; errors: number }> {
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  console.log(`JSON 파일 수: ${files.length}`);

  const startTime = Date.now();
  let processed = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const raw = JSON.parse(readFileSync(join(dataDir, file), "utf-8"));
      const dialogue = adapter.normalize(raw);
      await processEntry(dialogue);
      processed++;
      logProgress(processed, files.length, startTime);
    } catch (error) {
      errors++;
      if (errors <= 10) console.warn(`오류 (${file}):`, (error as Error).message);
    }
  }

  return { processed, errors };
}

async function processArrayJson<T>(
  dataDir: string,
  adapter: RawDataAdapter<T>,
): Promise<{ processed: number; errors: number }> {
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  console.log(`JSON 파일 수: ${files.length}`);

  let totalItems = 0;
  const allItems: { raw: T; fileName: string }[] = [];

  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(dataDir, file), "utf-8"));
    if (Array.isArray(raw)) {
      for (const item of raw) {
        allItems.push({ raw: item as T, fileName: file });
      }
      totalItems += raw.length;
    }
  }

  console.log(`총 항목 수: ${totalItems}`);

  const startTime = Date.now();
  let processed = 0;
  let errors = 0;

  for (const { raw, fileName } of allItems) {
    try {
      const dialogue = adapter.normalize(raw);
      await processEntry(dialogue);
      processed++;
      logProgress(processed, totalItems, startTime);
    } catch (error) {
      errors++;
      if (errors <= 10) console.warn(`오류 (${fileName}):`, (error as Error).message);
    }
  }

  return { processed, errors };
}

function logProgress(processed: number, total: number, startTime: number): void {
  if (processed % BATCH_LOG_INTERVAL !== 0) return;
  const elapsed = (Date.now() - startTime) / 1000;
  const rate = processed / elapsed;
  const remaining = (total - processed) / rate;
  console.log(
    `진행: ${processed}/${total} (${((processed / total) * 100).toFixed(1)}%) ` +
    `| ${rate.toFixed(1)}건/초 | 예상 잔여: ${formatTime(remaining)}`,
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}초`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}분`;
  return `${(seconds / 3600).toFixed(1)}시간`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
  const append = flags.includes("--append");

  if (args.length < 2) {
    printUsage();
    process.exit(1);
  }

  const sourceType = args[0] as SourceType;
  const dataDir = args[1];

  if (!SOURCE_TYPES[sourceType]) {
    console.error(`알 수 없는 소스 타입: ${sourceType}`);
    printUsage();
    process.exit(1);
  }

  console.log(`소스 타입: ${sourceType} (${SOURCE_TYPES[sourceType]})`);
  console.log(`데이터 디렉터리: ${dataDir}`);
  console.log(`모드: ${append ? "추가(append)" : "새로 생성"}`);
  console.log(`출력 파일: ${OUTPUT_PATH}`);
  console.log("");

  if (append && existsSync(OUTPUT_PATH)) {
    console.log("기존 벡터 스토어 로딩 중...");
    loadFromBinary(OUTPUT_PATH);
    console.log(`기존 데이터: ${getEntryCount()}건`);
  }

  console.log("임베딩 모델 초기화 중...");
  await initEmbedder();
  console.log("임베딩 모델 준비 완료\n");

  let result: { processed: number; errors: number };

  switch (sourceType) {
    case "sns-dialogue":
      result = await processSingleFileJson(dataDir, snsDialogueAdapter);
      break;
    case "multi-session":
      result = await processSingleFileJson(dataDir, multiSessionDialogueAdapter);
      break;
    case "culture-usage":
      result = await processArrayJson(dataDir, cultureTermUsageAdapter);
      break;
    case "culture-def":
      result = await processArrayJson(dataDir, cultureTermDefAdapter);
      break;
  }

  console.log(`\n처리 완료: ${result.processed}건 성공, ${result.errors}건 오류`);
  console.log(`총 벡터 수: ${getEntryCount()}건`);

  console.log("벡터 스토어 저장 중...");
  saveToBinary(OUTPUT_PATH);
  console.log(`저장 완료: ${OUTPUT_PATH}`);

  disposeEmbedder();
}

main().catch((error) => {
  console.error("치명적 오류:", error);
  process.exit(1);
});
