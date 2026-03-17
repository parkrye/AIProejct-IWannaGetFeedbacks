import type { ImageAnalysisResult } from "../../../shared/types.ts";
import "./ImagePreview.css";

interface ImagePreviewProps {
  readonly imageUrl: string | null;
  readonly analysis: ImageAnalysisResult | null;
  readonly isLoading: boolean;
}

export function ImagePreview({ imageUrl, analysis, isLoading }: ImagePreviewProps) {
  if (!imageUrl) return null;

  return (
    <div className="image-preview">
      <img src={imageUrl} alt="업로드된 이미지" className="image-preview__img" />

      {isLoading && <p className="image-preview__loading">이미지 분석 중...</p>}

      {analysis && (
        <div className="image-preview__tags">
          <h4 className="image-preview__tags-title">감지된 태그</h4>
          <div className="image-preview__tag-list">
            {analysis.labels.map((label) => (
              <span key={label.label} className="image-preview__tag">
                {label.label} ({(label.confidence * 100).toFixed(0)}%)
              </span>
            ))}
          </div>

          {analysis.dominantColors.length > 0 && (
            <div className="image-preview__colors">
              <h4 className="image-preview__tags-title">주요 색상</h4>
              <div className="image-preview__color-list">
                {analysis.dominantColors.map((color) => (
                  <span
                    key={color}
                    className="image-preview__color-swatch"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
