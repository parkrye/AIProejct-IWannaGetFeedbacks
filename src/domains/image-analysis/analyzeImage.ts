import { ImageClassifier, FilesetResolver } from "@mediapipe/tasks-vision";
import type { ImageAnalysisResult, ImageLabel } from "../../shared/types.ts";

const CONFIDENCE_THRESHOLD = 0.1;
const MAX_LABELS = 5;

let classifierInstance: ImageClassifier | null = null;

async function getClassifier(): Promise<ImageClassifier> {
  if (classifierInstance) return classifierInstance;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );

  classifierInstance = await ImageClassifier.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.tflite",
    },
    maxResults: MAX_LABELS,
    scoreThreshold: CONFIDENCE_THRESHOLD,
  });

  return classifierInstance;
}

export async function analyzeImage(imageElement: HTMLImageElement): Promise<ImageAnalysisResult> {
  const classifier = await getClassifier();
  const result = classifier.classify(imageElement);

  const labels: ImageLabel[] =
    result.classifications[0]?.categories.map((cat) => ({
      label: cat.categoryName ?? "unknown",
      confidence: cat.score,
    })) ?? [];

  const dominantColors = extractDominantColors(imageElement);

  return { labels, dominantColors };
}

function extractDominantColors(img: HTMLImageElement): string[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const sampleSize = 50;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const colorCounts = new Map<string, number>();

  for (let i = 0; i < imageData.data.length; i += 16) {
    const r = Math.round(imageData.data[i] / 51) * 51;
    const g = Math.round(imageData.data[i + 1] / 51) * 51;
    const b = Math.round(imageData.data[i + 2] / 51) * 51;
    const key = `rgb(${r},${g},${b})`;
    colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1);
  }

  return [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color]) => color);
}

export function disposeClassifier(): void {
  classifierInstance?.close();
  classifierInstance = null;
}
