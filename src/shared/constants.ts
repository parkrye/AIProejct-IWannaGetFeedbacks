export const API_ROUTES = {
  ANALYZE: "/api/analyze",
  GENERATE: "/api/generate",
  PERSONAS: "/api/personas",
  PERSONA_BY_ID: (id: string) => `/api/personas/${id}`,
  PERSONA_GROUPS: "/api/persona-groups",
  PERSONA_GROUP_BY_ID: (id: string) => `/api/persona-groups/${id}`,
} as const;

export const DEFAULT_MODEL_PATH = "./models/qwen2.5-7b-instruct-q4_k_m.gguf";

export const GENERATION_DEFAULTS = {
  CONTEXT_SIZE: 4096,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
  MAX_TOKENS: 512,
} as const;

export const TEXT_ANALYSIS = {
  MIN_KEYWORD_LENGTH: 2,
  MAX_KEYWORDS: 10,
  SENTIMENT_POSITIVE_THRESHOLD: 0.3,
  SENTIMENT_NEGATIVE_THRESHOLD: -0.3,
} as const;
