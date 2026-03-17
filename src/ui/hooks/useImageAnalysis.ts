import { useState, useCallback } from "react";
import type { ImageAnalysisResult } from "../../shared/types.ts";
import { analyzeImage, disposeClassifier } from "../../domains/image-analysis/index.ts";

interface UseImageAnalysisReturn {
  readonly result: ImageAnalysisResult | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly analyze: (imageElement: HTMLImageElement) => Promise<void>;
  readonly reset: () => void;
}

export function useImageAnalysis(): UseImageAnalysisReturn {
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (imageElement: HTMLImageElement) => {
    setIsLoading(true);
    setError(null);

    try {
      const analysisResult = await analyzeImage(imageElement);
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 분석에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    disposeClassifier();
  }, []);

  return { result, isLoading, error, analyze, reset };
}
