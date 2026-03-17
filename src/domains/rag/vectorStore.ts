import { readFileSync, writeFileSync, existsSync } from "fs";
import type { VectorEntry, VectorMetadata } from "./types.ts";

interface SerializedStore {
  readonly dimension: number;
  readonly entries: readonly {
    readonly id: string;
    readonly vector: readonly number[];
    readonly metadata: VectorMetadata;
  }[];
}

const entries: VectorEntry[] = [];
let dimension = 0;

export function addEntry(id: string, vector: Float32Array, metadata: VectorMetadata): void {
  if (dimension === 0) {
    dimension = vector.length;
  } else if (vector.length !== dimension) {
    throw new Error(`벡터 차원 불일치: expected ${dimension}, got ${vector.length}`);
  }
  entries.push({ id, vector, metadata });
}

export function addEntries(newEntries: readonly VectorEntry[]): void {
  for (const entry of newEntries) {
    addEntry(entry.id, entry.vector, entry.metadata);
  }
}

export function getEntryCount(): number {
  return entries.length;
}

export function getAllEntries(): readonly VectorEntry[] {
  return entries;
}

export function clearStore(): void {
  entries.length = 0;
  dimension = 0;
}

export function saveToDisk(filePath: string): void {
  const serialized: SerializedStore = {
    dimension,
    entries: entries.map((e) => ({
      id: e.id,
      vector: [...e.vector],
      metadata: e.metadata,
    })),
  };

  writeFileSync(filePath, JSON.stringify(serialized));
}

export function loadFromDisk(filePath: string): void {
  if (!existsSync(filePath)) {
    throw new Error(`벡터 스토어 파일을 찾을 수 없습니다: ${filePath}`);
  }

  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as SerializedStore;

  clearStore();
  dimension = data.dimension;

  for (const entry of data.entries) {
    entries.push({
      id: entry.id,
      vector: new Float32Array(entry.vector),
      metadata: entry.metadata,
    });
  }
}

export function saveToBinary(filePath: string): void {
  const metadataJson = JSON.stringify({
    dimension,
    count: entries.length,
    metadata: entries.map((e) => ({ id: e.id, metadata: e.metadata })),
  });

  const metadataBytes = Buffer.from(metadataJson, "utf-8");
  const metadataLength = Buffer.alloc(4);
  metadataLength.writeUInt32LE(metadataBytes.length);

  const vectorBuffer = Buffer.alloc(entries.length * dimension * 4);
  for (let i = 0; i < entries.length; i++) {
    for (let j = 0; j < dimension; j++) {
      vectorBuffer.writeFloatLE(entries[i].vector[j], (i * dimension + j) * 4);
    }
  }

  const combined = Buffer.concat([metadataLength, metadataBytes, vectorBuffer]);
  writeFileSync(filePath, combined);
}

export function loadFromBinary(filePath: string): void {
  if (!existsSync(filePath)) {
    throw new Error(`벡터 스토어 파일을 찾을 수 없습니다: ${filePath}`);
  }

  const buffer = readFileSync(filePath);

  const metadataLength = buffer.readUInt32LE(0);
  const metadataJson = buffer.subarray(4, 4 + metadataLength).toString("utf-8");
  const meta = JSON.parse(metadataJson);

  clearStore();
  dimension = meta.dimension;

  const vectorStart = 4 + metadataLength;
  for (let i = 0; i < meta.count; i++) {
    const offset = vectorStart + i * dimension * 4;
    const vector = new Float32Array(dimension);
    for (let j = 0; j < dimension; j++) {
      vector[j] = buffer.readFloatLE(offset + j * 4);
    }
    entries.push({
      id: meta.metadata[i].id,
      vector,
      metadata: meta.metadata[i].metadata,
    });
  }
}
