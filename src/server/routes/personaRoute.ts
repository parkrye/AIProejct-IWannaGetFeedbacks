import type { Request, Response } from "express";
import { join } from "path";
import {
  getAllPersonas,
  getAllCategories,
  getPersonaById,
  addPersona,
  updatePersona,
  removePersona,
} from "../../domains/persona/index.ts";
import { savePersonasToDirectory } from "../../domains/persona/savePersonas.ts";
import type { CreatePersonaRequest, UpdatePersonaRequest } from "../../shared/types.ts";

const PERSONAS_DIR = join(process.cwd(), "data", "personas");

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40)
    + "-" + Date.now().toString(36);
}

function persistPersonas(): void {
  savePersonasToDirectory(PERSONAS_DIR);
}

export function listPersonasRoute(_req: Request, res: Response): void {
  const personas = getAllPersonas();
  res.json({ personas });
}

export function listCategoriesRoute(_req: Request, res: Response): void {
  const categories = getAllCategories();
  res.json({ categories });
}

export function getPersonaRoute(req: Request, res: Response): void {
  const persona = getPersonaById(req.params.id as string);
  if (!persona) {
    res.status(404).json({ error: "페르소나를 찾을 수 없습니다." });
    return;
  }
  res.json({ persona });
}

export function createPersonaRoute(req: Request, res: Response): void {
  const body = req.body as CreatePersonaRequest;

  if (!body.name || !body.traits || !body.promptHint) {
    res.status(400).json({ error: "name, traits, promptHint는 필수입니다." });
    return;
  }

  const id = generateId(body.name);
  const category = body.category || "personality";

  const persona = {
    id,
    name: body.name,
    traits: body.traits,
    promptHint: body.promptHint,
    examplePatterns: body.examplePatterns ?? [],
  };

  addPersona(category, persona);
  persistPersonas();

  res.status(201).json({ persona });
}

export function updatePersonaRoute(req: Request, res: Response): void {
  const id = req.params.id as string;
  const body = req.body as UpdatePersonaRequest;

  const existing = getPersonaById(id);
  if (!existing) {
    res.status(404).json({ error: "페르소나를 찾을 수 없습니다." });
    return;
  }

  const updated = updatePersona(id, body);
  persistPersonas();

  res.json({ persona: updated });
}

export function deletePersonaRoute(req: Request, res: Response): void {
  const id = req.params.id as string;

  const removed = removePersona(id);
  if (!removed) {
    res.status(404).json({ error: "페르소나를 찾을 수 없습니다." });
    return;
  }

  persistPersonas();

  res.json({ success: true });
}
