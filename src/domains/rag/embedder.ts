import { pipeline } from "@huggingface/transformers";

const MODEL_NAME = "Xenova/multilingual-e5-small";
const EMBEDDING_DIM = 384;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractor: any = null;

export async function initEmbedder(): Promise<void> {
  if (extractor) return;
  extractor = await pipeline("feature-extraction", MODEL_NAME, {
    dtype: "fp32",
  });
}

export async function embed(text: string): Promise<Float32Array> {
  if (!extractor) {
    throw new Error("Embedder가 초기화되지 않았습니다. initEmbedder()를 먼저 호출하세요.");
  }

  const prefixed = `query: ${text}`;
  const output = await extractor(prefixed, { pooling: "mean", normalize: true });
  return new Float32Array(output.data as ArrayLike<number>);
}

export async function embedBatch(texts: readonly string[], batchSize: number = 32): Promise<Float32Array[]> {
  const results: Float32Array[] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map((t) => `passage: ${t}`);
    const outputs = await Promise.all(
      batch.map(async (text) => {
        const output = await extractor(text, { pooling: "mean", normalize: true });
        return new Float32Array(output.data as ArrayLike<number>);
      }),
    );
    results.push(...outputs);
  }

  return results;
}

export function getEmbeddingDim(): number {
  return EMBEDDING_DIM;
}

export function disposeEmbedder(): void {
  extractor = null;
}
