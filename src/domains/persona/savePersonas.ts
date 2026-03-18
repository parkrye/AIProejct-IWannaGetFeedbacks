import { writeFileSync } from "fs";
import { join } from "path";
import { getAllCategories } from "./personaRegistry.ts";

export function savePersonasToDirectory(dirPath: string): void {
  const categories = getAllCategories();

  for (const category of categories) {
    const filePath = join(dirPath, `${category.category}.json`);
    const content = JSON.stringify(category, null, 2);
    writeFileSync(filePath, content, "utf-8");
  }
}
