export { snsDialogueAdapter } from "./adapters/snsDialogueAdapter.ts";
export { cultureTermUsageAdapter } from "./adapters/cultureTermUsageAdapter.ts";
export { cultureTermDefAdapter } from "./adapters/cultureTermDefAdapter.ts";
export { initEmbedder, embed, embedBatch, disposeEmbedder, getEmbeddingDim } from "./embedder.ts";
export {
  addEntry,
  addEntries,
  getEntryCount,
  getAllEntries,
  clearStore,
  saveToBinary,
  loadFromBinary,
  saveToDisk,
  loadFromDisk,
} from "./vectorStore.ts";
export { search } from "./search.ts";
export type {
  NormalizedDialogue,
  VectorEntry,
  VectorMetadata,
  SearchResult,
  SearchFilter,
  SpeakerProfile,
  RawDataAdapter,
} from "./types.ts";
