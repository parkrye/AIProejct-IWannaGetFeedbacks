import { useState, useCallback, useRef } from "react";
import type {
  GeneratedFeedback,
  ImageLabel,
  TextAnalysisResult,
} from "../../shared/types.ts";
import { API_ROUTES } from "../../shared/constants.ts";

export interface GenerationProgress {
  readonly currentPersona: number;
  readonly totalPersonas: number;
  readonly tokenCount: number;
  readonly maxTokens: number;
}

interface UseGenerationReturn {
  readonly feedbacks: ReadonlyMap<string, GeneratedFeedback>;
  readonly isGenerating: boolean;
  readonly error: string | null;
  readonly progress: GenerationProgress | null;
  readonly generate: (params: GenerateParams) => Promise<void>;
  readonly cancel: () => void;
  readonly reset: () => void;
}

interface GenerateParams {
  readonly postText: string;
  readonly imageLabels: readonly ImageLabel[];
  readonly textAnalysis: TextAnalysisResult;
  readonly personaIds: readonly string[];
}

interface StreamEvent {
  personaId: string;
  personaName?: string;
  token: string;
  done: boolean;
  progress?: {
    current: number;
    total: number;
    tokenCount: number;
    maxTokens: number;
  };
}

export function useGeneration(): UseGenerationReturn {
  const [feedbacks, setFeedbacks] = useState<Map<string, GeneratedFeedback>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    setError(null);
    setFeedbacks(new Map());
    setProgress(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(API_ROUTES.GENERATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("스트림을 읽을 수 없습니다.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data) as StreamEvent;

            if (event.progress) {
              setProgress({
                currentPersona: event.progress.current,
                totalPersonas: event.progress.total,
                tokenCount: event.progress.tokenCount,
                maxTokens: event.progress.maxTokens,
              });
            }

            setFeedbacks((prev) => {
              const next = new Map(prev);
              const existing = next.get(event.personaId);
              next.set(event.personaId, {
                personaId: event.personaId,
                personaName: event.personaName ?? existing?.personaName ?? event.personaId,
                content: (existing?.content ?? "") + event.token,
              });
              return next;
            });
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "생성에 실패했습니다.");
      }
    } finally {
      setIsGenerating(false);
      setProgress(null);
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    cancel();
    setFeedbacks(new Map());
    setError(null);
    setProgress(null);
  }, [cancel]);

  return { feedbacks, isGenerating, error, progress, generate, cancel, reset };
}
