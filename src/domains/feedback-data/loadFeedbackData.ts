import { readFileSync } from "fs";
import type { FeedbackExample } from "../../shared/types.ts";
import { loadFeedbackExamples } from "./feedbackRepository.ts";

export function loadFeedbackDataFromFile(filePath: string): void {
  const content = readFileSync(filePath, "utf-8");
  const data = JSON.parse(content) as FeedbackExample[];
  loadFeedbackExamples(data);
}
