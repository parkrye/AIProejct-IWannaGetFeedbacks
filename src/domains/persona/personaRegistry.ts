import type { Persona, PersonaCategory } from "../../shared/types.ts";

const registry = new Map<string, Persona>();
const categories: PersonaCategory[] = [];

export function registerPersonaCategory(category: PersonaCategory): void {
  categories.push(category);
  for (const persona of category.personas) {
    registry.set(persona.id, persona);
  }
}

export function getPersonaById(id: string): Persona | undefined {
  return registry.get(id);
}

export function getAllPersonas(): Persona[] {
  return [...registry.values()];
}

export function getPersonasByIds(ids: readonly string[]): Persona[] {
  return ids.map((id) => registry.get(id)).filter((p): p is Persona => p !== undefined);
}

export function getAllCategories(): PersonaCategory[] {
  return [...categories];
}

export function clearRegistry(): void {
  registry.clear();
  categories.length = 0;
}
