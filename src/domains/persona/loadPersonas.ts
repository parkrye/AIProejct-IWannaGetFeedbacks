import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { PersonaCategory } from "../../shared/types.ts";
import { registerPersonaCategory } from "./personaRegistry.ts";

export function loadPersonasFromDirectory(dirPath: string): void {
  const files = readdirSync(dirPath).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = join(dirPath, file);
    const content = readFileSync(filePath, "utf-8");
    const category = JSON.parse(content) as PersonaCategory;
    registerPersonaCategory(category);
  }
}
