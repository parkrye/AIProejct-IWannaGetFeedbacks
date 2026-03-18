import type { Request, Response } from "express";
import {
  getAllGroups,
  getGroupById,
  addGroup,
  updateGroup,
  removeGroup,
} from "../../domains/persona-group/index.ts";

function generateGroupId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40)
    + "-" + Date.now().toString(36);
}

export function listGroupsRoute(_req: Request, res: Response): void {
  res.json({ groups: getAllGroups() });
}

export function getGroupRoute(req: Request, res: Response): void {
  const group = getGroupById(req.params.id as string);
  if (!group) {
    res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
    return;
  }
  res.json({ group });
}

export function createGroupRoute(req: Request, res: Response): void {
  const { name, personaIds } = req.body;
  if (!name) {
    res.status(400).json({ error: "name은 필수입니다." });
    return;
  }
  const group = {
    id: generateGroupId(name),
    name,
    personaIds: personaIds ?? [],
  };
  addGroup(group);
  res.status(201).json({ group });
}

export function updateGroupRoute(req: Request, res: Response): void {
  const id = req.params.id as string;
  const updated = updateGroup(id, req.body);
  if (!updated) {
    res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
    return;
  }
  res.json({ group: updated });
}

export function deleteGroupRoute(req: Request, res: Response): void {
  const id = req.params.id as string;
  if (!removeGroup(id)) {
    res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
    return;
  }
  res.json({ success: true });
}
