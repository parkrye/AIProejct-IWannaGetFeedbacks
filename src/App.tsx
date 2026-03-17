import { useRef } from "react";
import type { SnsPost, ImageLabel, TextAnalysisResult } from "./shared/types.ts";
import { PostInput } from "./ui/components/PostInput/index.ts";
import { ImagePreview } from "./ui/components/ImagePreview/index.ts";
import { PersonaSelector } from "./ui/components/PersonaSelector/index.ts";
import { FeedbackDisplay } from "./ui/components/FeedbackDisplay/index.ts";
import { useImageAnalysis } from "./ui/hooks/useImageAnalysis.ts";
import { useTextAnalysis } from "./ui/hooks/useTextAnalysis.ts";
import { useGeneration } from "./ui/hooks/useGeneration.ts";
import { usePersonas } from "./ui/hooks/usePersonas.ts";
import "./App.css";

function App() {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageAnalysis = useImageAnalysis();
  const textAnalysis = useTextAnalysis();
  const generation = useGeneration();
  const personas = usePersonas();

  const handleSubmit = async (post: SnsPost) => {
    let imageLabels: ImageLabel[] = [];
    let textResult: TextAnalysisResult = { keywords: [], sentiment: "neutral", topics: [] };

    if (post.imageFile && imageRef.current) {
      await imageAnalysis.analyze(imageRef.current);
      imageLabels = [...(imageAnalysis.result?.labels ?? [])];
    }

    if (post.text.trim()) {
      const result = await textAnalysis.analyze(post.text);
      if (result) textResult = result;
    }

    await generation.generate({
      postText: post.text,
      imageLabels,
      textAnalysis: textResult,
      personaIds: personas.selected,
    });
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">AI 피드백 생성기</h1>
        <p className="app__subtitle">SNS 게시글에 다양한 페르소나의 피드백을 생성합니다</p>
      </header>

      <main className="app__main">
        <section className="app__input-section">
          <PostInput onSubmit={handleSubmit} isDisabled={generation.isGenerating} />

          <ImagePreview
            imageUrl={null}
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
          />
        </section>
      </main>
    </div>
  );
}

export default App;
