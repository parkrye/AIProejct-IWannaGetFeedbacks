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

export function addPersona(categoryName: string, persona: Persona): void {
  registry.set(persona.id, persona);

  const existing = categories.find((c) => c.category === categoryName);
  if (existing) {
    const idx = categories.indexOf(existing);
    categories[idx] = {
      category: categoryName,
      personas: [...existing.personas, persona],
    };
  } else {
    categories.push({ category: categoryName, personas: [persona] });
  }
}

export function updatePersona(id: string, updates: { name?: string; traits?: Partial<Persona["traits"]>; promptHint?: string; examplePatterns?: readonly string[] }): Persona | undefined {
  const existing = registry.get(id);
  if (!existing) return undefined;

  const updated: Persona = {
    ...existing,
    ...updates,
    traits: updates.traits ? { ...existing.traits, ...updates.traits } : existing.traits,
  };

  registry.set(id, updated);

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const personaIdx = cat.personas.findIndex((p) => p.id === id);
    if (personaIdx !== -1) {
      const newPersonas = [...cat.personas];
      newPersonas[personaIdx] = updated;
      categories[i] = { category: cat.category, personas: newPersonas };
      break;
    }
  }

  return updated;
}

export function removePersona(id: string): boolean {
  if (!registry.has(id)) return false;
  registry.delete(id);

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const filtered = cat.personas.filter((p) => p.id !== id);
    if (filtered.length !== cat.personas.length) {
      categories[i] = { category: cat.category, personas: filtered };
      break;
    }
  }

  return true;
}

export function clearRegistry(): void {
  registry.clear();
  categories.length = 0;
}
