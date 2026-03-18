import { useState, useRef, useCallback } from "react";
import type { SnsPost, ImageLabel, TextAnalysisResult } from "../../shared/types.ts";
import { PostInput } from "../components/PostInput/index.ts";
import { ImagePreview } from "../components/ImagePreview/index.ts";
import { PersonaSelector } from "../components/PersonaSelector/index.ts";
import { FeedbackDisplay } from "../components/FeedbackDisplay/index.ts";
import { ErrorBanner } from "../components/ErrorBanner/index.ts";
import { useImageAnalysis } from "../hooks/useImageAnalysis.ts";
import { useTextAnalysis } from "../hooks/useTextAnalysis.ts";
import { useGeneration } from "../hooks/useGeneration.ts";
import { usePersonas } from "../hooks/usePersonas.ts";
import "./FeedbackPage.css";

export function FeedbackPage() {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lastPostRef = useRef<SnsPost | null>(null);

  const imageAnalysis = useImageAnalysis();
  const textAnalysis = useTextAnalysis();
  const generation = useGeneration();
  const personas = usePersonas();

  const runGeneration = useCallback(
    async (post: SnsPost) => {
      let imageLabels: ImageLabel[] = [];
      let textResult: TextAnalysisResult = { keywords: [], sentiment: "neutral", topics: [] };

      if (post.imageFile) {
        const url = URL.createObjectURL(post.imageFile);
        setImagePreviewUrl(url);
        const img = new Image();
        img.src = url;
        await new Promise<void>((resolve) => { img.onload = () => resolve(); });
        imageRef.current = img;
        await imageAnalysis.analyze(img);
        imageLabels = [...(imageAnalysis.result?.labels ?? [])];
      } else {
        setImagePreviewUrl(post.imageUrl);
      }

      if (post.text.trim()) {
        const result = await textAnalysis.analyze(post.text);
        if (result) textResult = result;
      }

      if (personas.selected.length === 0) return;

      await generation.generate({
        postText: post.text,
        imageLabels,
        textAnalysis: textResult,
        personaIds: personas.selected,
      });
    },
    [imageAnalysis, textAnalysis, generation, personas.selected],
  );

  const handleSubmit = async (post: SnsPost) => {
    lastPostRef.current = post;
    await runGeneration(post);
  };

  const handleRetry = useCallback(() => {
    if (lastPostRef.current) {
      generation.reset();
      runGeneration(lastPostRef.current);
    }
  }, [generation, runGeneration]);

  const handleDismissError = useCallback(() => {
    generation.reset();
  }, [generation]);

  const globalError = personas.error || textAnalysis.error || imageAnalysis.error;

  return (
    <div className="feedback-page">
      {globalError && (
        <div className="feedback-page__error">
          <ErrorBanner message={globalError} />
        </div>
      )}

      <div className="feedback-page__content">
        <section className="feedback-page__input">
          <PostInput onSubmit={handleSubmit} isDisabled={generation.isGenerating} />

          <ImagePreview
            imageUrl={imagePreviewUrl}
            analysis={imageAnalysis.result}
            isLoading={imageAnalysis.isLoading}
          />

          <PersonaSelector
            personas={personas.personas}
            selected={personas.selected}
            onToggle={personas.togglePersona}
            onSelectAll={personas.selectAll}
            onDeselectAll={personas.deselectAll}
            isLoading={personas.isLoading}
          />
        </section>

        <section className="feedback-page__output">
          <FeedbackDisplay
            feedbacks={generation.feedbacks}
            isGenerating={generation.isGenerating}
            error={generation.error}
            progress={generation.progress}
            onRetry={handleRetry}
            onDismissError={handleDismissError}
          />
        </section>
      </div>
    </div>
  );
}
