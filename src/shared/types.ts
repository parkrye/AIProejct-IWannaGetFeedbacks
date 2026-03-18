// ── Document Input ──

export interface SnsPost {
  readonly text: string;
  readonly imageFile: File | null;
  readonly imageUrl: string | null;
}

export interface ParsedPost {
  readonly text: string;
  readonly hasImage: boolean;
  readonly imageDataUrl: string | null;
}

// ── Image Analysis (브라우저 MediaPipe) ──

export interface ImageLabel {
  readonly label: string;
  readonly confidence: number;
}

export interface ImageAnalysisResult {
  readonly labels: readonly ImageLabel[];
  readonly dominantColors: readonly string[];
}

// ── Text Analysis (서버) ──

export type Sentiment = "positive" | "negative" | "neutral" | "mixed";

export interface TextAnalysisResult {
  readonly keywords: readonly string[];
  readonly sentiment: Sentiment;
  readonly topics: readonly string[];
}

// ── Persona ──

export type ToneType = "enthusiastic" | "calm" | "sarcastic" | "analytical" | "friendly";
export type EmotionBias = "positive" | "negative" | "neutral";
export type FormalityLevel = "formal" | "casual" | "mixed";
export type GenderType = "남성" | "여성" | "중성적";

export const INTEREST_OPTIONS = [
  "음식", "여행", "패션", "뷰티", "운동", "게임", "음악", "영화", "독서",
  "반려동물", "IT/테크", "경제", "정치", "연애", "육아", "요리", "사진",
  "자동차", "인테리어", "주식/투자", "학업", "직장생활",
] as const;

export type InterestType = typeof INTEREST_OPTIONS[number] | string;

export interface PersonaTraits {
  readonly tone: ToneType;
  readonly emotionBias: EmotionBias;
  readonly formality: FormalityLevel;
}

export interface PersonaProfile {
  readonly age?: number;
  readonly gender?: GenderType;
  readonly interests?: readonly string[];
}

export interface PersonaParams {
  readonly positivity?: number;
  readonly nonsense?: number;
  readonly verbosity?: number;
  readonly emoji?: number;
  readonly formality?: number;
}

export interface Persona {
  readonly id: string;
  readonly name: string;
  readonly traits: PersonaTraits;
  readonly profile?: PersonaProfile;
  readonly params?: PersonaParams;
  readonly promptHint: string;
  readonly examplePatterns: readonly string[];
}

export interface PersonaCategory {
  readonly category: string;
  readonly personas: readonly Persona[];
}

// ── Persona Group ──

export interface PersonaGroup {
  readonly id: string;
  readonly name: string;
  readonly personaIds: readonly string[];
}

// ── Generation Parameters ──

export interface GenerationParams {
  readonly positivity: number;
  readonly nonsense: number;
  readonly verbosity: number;
  readonly emoji: number;
  readonly formality: number;
}

export const DEFAULT_GENERATION_PARAMS: GenerationParams = {
  positivity: 5,
  nonsense: 0,
  verbosity: 5,
  emoji: 3,
  formality: 5,
};

// ── Selection Mode ──

export type SelectionMode = "dynamic" | "group" | "manual";

// ── Generation ──

export interface GenerationRequest {
  readonly postText: string;
  readonly imageLabels: readonly ImageLabel[];
  readonly textAnalysis: TextAnalysisResult;
  readonly personaIds: readonly string[];
  readonly selectionMode?: SelectionMode;
  readonly generationParams?: GenerationParams;
}

export interface GenerationStreamEvent {
  readonly personaId: string;
  readonly token: string;
  readonly done: boolean;
}

export interface GeneratedFeedback {
  readonly personaId: string;
  readonly personaName: string;
  readonly content: string;
}

// ── Feedback Data ──

export interface FeedbackExample {
  readonly personaId: string;
  readonly context: string;
  readonly feedback: string;
}

// ── API ──

export interface AnalyzeRequest {
  readonly text: string;
}

export interface AnalyzeResponse {
  readonly analysis: TextAnalysisResult;
}

export interface GenerateRequest {
  readonly postText: string;
  readonly imageLabels: readonly ImageLabel[];
  readonly textAnalysis: TextAnalysisResult;
  readonly personaIds: readonly string[];
  readonly selectionMode?: SelectionMode;
  readonly generationParams?: GenerationParams;
}

// ── Persona CRUD ──

export interface CreatePersonaRequest {
  readonly category: string;
  readonly name: string;
  readonly traits: PersonaTraits;
  readonly profile?: PersonaProfile;
  readonly params?: PersonaParams;
  readonly promptHint: string;
  readonly examplePatterns: readonly string[];
}

export interface UpdatePersonaRequest {
  readonly name?: string;
  readonly traits?: Partial<PersonaTraits>;
  readonly profile?: PersonaProfile;
  readonly params?: PersonaParams;
  readonly promptHint?: string;
  readonly examplePatterns?: readonly string[];
}

// ── Model Config ──

export interface ModelConfig {
  readonly modelPath: string;
  readonly contextSize: number;
  readonly temperature: number;
  readonly topP: number;
  readonly maxTokens: number;
}

export interface PromptTemplate {
  readonly system: string;
  readonly userTemplate: string;
}
