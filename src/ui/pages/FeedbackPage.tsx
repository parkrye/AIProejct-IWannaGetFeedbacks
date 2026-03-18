import { useState, useRef, useCallback } from "react";
import type { SnsPost, ImageLabel, TextAnalysisResult, GenerationParams, SelectionMode } from "../../shared/types.ts";
import { DEFAULT_GENERATION_PARAMS } from "../../shared/types.ts";
import { PostInput } from "../components/PostInput/index.ts";
import { ImagePreview } from "../components/ImagePreview/index.ts";
import { PersonaGroupSelector } from "../components/PersonaGroupSelector/index.ts";
import { GenerationParamsPanel } from "../components/GenerationParams/index.ts";
import { FeedbackDisplay } from "../components/FeedbackDisplay/index.ts";
import { ErrorBanner } from "../components/ErrorBanner/index.ts";
import { useImageAnalysis } from "../hooks/useImageAnalysis.ts";
import { useTextAnalysis } from "../hooks/useTextAnalysis.ts";
import { useGeneration } from "../hooks/useGeneration.ts";
import { usePersonas } from "../hooks/usePersonas.ts";
import { usePersonaGroups } from "../hooks/usePersonaGroups.ts";
import "./FeedbackPage.css";

const MODE_LABELS: Record<SelectionMode, string> = {
  dynamic: "동적 선택",
  group: "그룹 선택",
  manual: "직접 선택",
};

const MODE_DESCS: Record<SelectionMode, string> = {
  dynamic: "게시글 내용을 분석하여 관심사가 일치하는 페르소나를 자동 선택합니다.",
  group: "미리 만들어둔 페르소나 그룹을 선택합니다.",
  manual: "원하는 페르소나를 직접 선택합니다.",
};

export function FeedbackPage() {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [genParams, setGenParams] = useState<GenerationParams>(DEFAULT_GENERATION_PARAMS);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("manual");
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lastPostRef = useRef<SnsPost | null>(null);

  const imageAnalysis = useImageAnalysis();
  const textAnalysis = useTextAnalysis();
  const generation = useGeneration();
  const personas = usePersonas();
  const personaGroups = usePersonaGroups();

  const handleSelectGroup = useCallback((personaIds: readonly string[]) => {
    personas.setSelectedIds([...personaIds]);
  }, [personas]);

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

      if (selectionMode !== "dynamic" && personas.selected.length === 0) return;

      await generation.generate({
        postText: post.text,
        imageLabels,
        textAnalysis: textResult,
        personaIds: selectionMode === "dynamic" ? [] : personas.selected,
        selectionMode,
        generationParams: genParams,
      });
    },
    [imageAnalysis, textAnalysis, generation, personas.selected, genParams, selectionMode],
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

          <div className="feedback-page__mode-selector">
            <div className="feedback-page__mode-tabs">
              {(Object.entries(MODE_LABELS) as [SelectionMode, string][]).map(([mode, label]) => (
                <button
                  key={mode}
                  className={`feedback-page__mode-tab ${selectionMode === mode ? "feedback-page__mode-tab--active" : ""}`}
                  onClick={() => setSelectionMode(mode)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="feedback-page__mode-desc">{MODE_DESCS[selectionMode]}</p>
          </div>

          {selectionMode !== "dynamic" && (
            <PersonaGroupSelector
              personas={personas.personas}
              groups={personaGroups.groups}
              selected={personas.selected}
              onSelectGroup={handleSelectGroup}
              onTogglePersona={personas.togglePersona}
              onSelectAll={personas.selectAll}
              onDeselectAll={personas.deselectAll}
              isLoading={personas.isLoading}
              showGroups={selectionMode === "group"}
            />
          )}

          <GenerationParamsPanel params={genParams} onChange={setGenParams} />
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
