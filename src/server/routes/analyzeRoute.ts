import type { Request, Response } from "express";
import { analyzeText } from "../../domains/text-analysis/index.ts";
import type { AnalyzeRequest, AnalyzeResponse } from "../../shared/types.ts";

export function analyzeRoute(req: Request, res: Response): void {
  const { text } = req.body as AnalyzeRequest;

  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "text 필드는 필수입니다." });
    return;
  }

  const analysis = analyzeText(text);
  const response: AnalyzeResponse = { analysis };
  res.json(response);
}
