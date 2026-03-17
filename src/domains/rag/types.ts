export interface SpeakerProfile {
  readonly gender?: string;
  readonly age?: string;
  readonly region?: string;
}

export interface NormalizedDialogue {
  readonly id: string;
  readonly topics: readonly string[];
  readonly singleTopic: string;
  readonly utterances: readonly string[];
  readonly speakerProfiles: readonly SpeakerProfile[];
  readonly source: string;
  readonly combinedText: string;
}

export interface VectorEntry {
  readonly id: string;
  readonly vector: Float32Array;
  readonly metadata: VectorMetadata;
}

export interface VectorMetadata {
  readonly singleTopic: string;
  readonly topics: readonly string[];
  readonly speakerGenders: readonly string[];
  readonly speakerAges: readonly string[];
  readonly utteranceCount: number;
  readonly sampleUtterances: readonly string[];
}

export interface SearchResult {
  readonly entry: VectorEntry;
  readonly score: number;
}

export interface SearchFilter {
  readonly topic?: string;
  readonly gender?: string;
  readonly age?: string;
}

export interface RawDataAdapter<T> {
  readonly name: string;
  normalize(raw: T): NormalizedDialogue;
}
