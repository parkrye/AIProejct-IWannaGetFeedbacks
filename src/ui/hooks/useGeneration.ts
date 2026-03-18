import { useState, useCallback, useRef } from "react";
import type {
  GeneratedFeedback,
  ImageLabel,
  TextAnalysisResult,
  GenerationParams,
  SelectionMode,
} from "../../shared/types.ts";
import { API_ROUTES } from "../../shared/constants.ts";

export interface GenerationProgress {
  readonly currentPersona: number;
  readonly totalPersonas: number;
  readonly status: "generating" | "done" | "error";
  readonly currentPersonaName?: string;
}

interface UseGenerationReturn {
  readonly feedbacks: ReadonlyMap<string, GeneratedFeedback>;
  readonly errors: ReadonlyMap<string, string>;
  readonly isGenerating: boolean;
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
  readonly selectionMode?: SelectionMode;
  readonly feedbackCount?: number;
  readonly generationParams?: GenerationParams;
}

interface StreamEvent {
  type: "progress" | "feedback" | "error";
  personaId?: string;
  personaName?: string;
  content?: string;
  message?: string;
  current?: number;
  total?: number;
  status?: string;
}

export function useGeneration(): UseGenerationReturn {
  const [feedbacks, setFeedbacks] = useState<Map<string, GeneratedFeedback>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    setFeedbacks(new Map());
    setErrors(new Map());
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

            if (event.type === "progress") {
              setProgress({
                currentPersona: event.current ?? 0,
                totalPersonas: event.total ?? 0,
                status: (event.status as GenerationProgress["status"]) ?? "generating",
                currentPersonaName: event.personaName,
              });
            } else if (event.type === "feedback" && event.personaId) {
              setFeedbacks((prev) => {
                const next = new Map(prev);
                next.set(event.personaId!, {
                  personaId: event.personaId!,
                  personaName: event.personaName ?? event.personaId!,
                  content: event.content ?? "",
                });
                return next;
              });
            } else if (event.type === "error" && event.personaId) {
              setErrors((prev) => {
                const next = new Map(prev);
                next.set(event.personaId!, event.message ?? "생성 실패");
                return next;
              });
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setErrors((prev) => {
          const next = new Map(prev);
          next.set("__global__", err instanceof Error ? err.message : "생성에 실패했습니다.");
          return next;
        });
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    cancel();
    setFeedbacks(new Map());
    setErrors(new Map());
    setProgress(null);
  }, [cancel]);

  return { feedbacks, errors, isGenerating, progress, generate, cancel, reset };
}
