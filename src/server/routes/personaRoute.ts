import type { Request, Response } from "express";
import { getAllPersonas, getAllCategories } from "../../domains/persona/index.ts";

export function listPersonasRoute(_req: Request, res: Response): void {
  const personas = getAllPersonas();
  res.json({ personas });
}

export function listCategoriesRoute(_req: Request, res: Response): void {
  const categories = getAllCategories();
  res.json({ categories });
}
