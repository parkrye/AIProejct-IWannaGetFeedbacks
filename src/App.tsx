import { useState, useRef, useCallback } from "react";
import type { SnsPost, ImageLabel, TextAnalysisResult } from "./shared/types.ts";
import { PostInput } from "./ui/components/PostInput/index.ts";
import { ImagePreview } from "./ui/components/ImagePreview/index.ts";
import { PersonaSelector } from "./ui/components/PersonaSelector/index.ts";
import { FeedbackDisplay } from "./ui/components/FeedbackDisplay/index.ts";
import { ErrorBanner } from "./ui/components/ErrorBanner/index.ts";
import { useImageAnalysis } from "./ui/hooks/useImageAnalysis.ts";
import { useTextAnalysis } from "./ui/hooks/useTextAnalysis.ts";
import { useGeneration } from "./ui/hooks/useGeneration.ts";
import { usePersonas } from "./ui/hooks/usePersonas.ts";
import "./App.css";

function App() {
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
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });
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

      if (personas.selected.length === 0) {
        return;
      }

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
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">AI 피드백 생성기</h1>
        <p className="app__subtitle">SNS 게시글에 다양한 페르소나의 피드백을 생성합니다</p>
      </header>

      {globalError && (
        <div className="app__error-container">
          <ErrorBanner message={globalError} />
        </div>
      )}

      <main className="app__main">
        <section className="app__input-section">
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

        <section className="app__output-section">
          <FeedbackDisplay
            feedbacks={generation.feedbacks}
            isGenerating={generation.isGenerating}
            error={generation.error}
            onRetry={handleRetry}
            onDismissError={handleDismissError}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
