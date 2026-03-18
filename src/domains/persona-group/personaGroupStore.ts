import { readFileSync, writeFileSync, existsSync } from "fs";
import type { PersonaGroup } from "../../shared/types.ts";

let storePath = "";
const groups: PersonaGroup[] = [];

export function loadGroups(filePath: string): void {
  storePath = filePath;
  groups.length = 0;
  if (existsSync(filePath)) {
    const data = JSON.parse(readFileSync(filePath, "utf-8")) as PersonaGroup[];
    groups.push(...data);
  }
}

export function saveGroups(): void {
  if (!storePath) return;
  writeFileSync(storePath, JSON.stringify(groups, null, 2), "utf-8");
}

export function getAllGroups(): PersonaGroup[] {
  return [...groups];
}

export function getGroupById(id: string): PersonaGroup | undefined {
  return groups.find((g) => g.id === id);
}

export function addGroup(group: PersonaGroup): void {
  groups.push(group);
  saveGroups();
}

export function updateGroup(id: string, updates: { name?: string; personaIds?: readonly string[] }): PersonaGroup | undefined {
  const idx = groups.findIndex((g) => g.id === id);
  if (idx === -1) return undefined;

  const updated: PersonaGroup = {
    ...groups[idx],
    ...updates,
  };
  groups[idx] = updated;
  saveGroups();
  return updated;
}

export function removeGroup(id: string): boolean {
  const idx = groups.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  groups.splice(idx, 1);
  saveGroups();
  return true;
}

export function clearGroups(): void {
  groups.length = 0;
}
