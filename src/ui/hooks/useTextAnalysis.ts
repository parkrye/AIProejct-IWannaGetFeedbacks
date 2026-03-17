import { useState, useCallback } from "react";
import type { TextAnalysisResult } from "../../shared/types.ts";
import { API_ROUTES } from "../../shared/constants.ts";

interface UseTextAnalysisReturn {
  readonly result: TextAnalysisResult | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly analyze: (text: string) => Promise<TextAnalysisResult | null>;
  readonly reset: () => void;
}

export function useTextAnalysis(): UseTextAnalysisReturn {
  const [result, setResult] = useState<TextAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (text: string): Promise<TextAnalysisResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ROUTES.ANALYZE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.analysis);
      return data.analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : "텍스트 분석에 실패했습니다.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, analyze, reset };
}
