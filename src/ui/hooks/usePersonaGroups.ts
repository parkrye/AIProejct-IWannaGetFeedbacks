import { useState, useEffect, useCallback } from "react";
import type { PersonaGroup } from "../../shared/types.ts";
import { API_ROUTES } from "../../shared/constants.ts";

interface UsePersonaGroupsReturn {
  readonly groups: PersonaGroup[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly createGroup: (name: string, personaIds?: string[]) => Promise<PersonaGroup | null>;
  readonly updateGroup: (id: string, updates: { name?: string; personaIds?: string[] }) => Promise<PersonaGroup | null>;
  readonly deleteGroup: (id: string) => Promise<boolean>;
  readonly refresh: () => void;
}

export function usePersonaGroups(): UsePersonaGroupsReturn {
  const [groups, setGroups] = useState<PersonaGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTES.PERSONA_GROUPS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGroups(data.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "그룹 로딩 실패");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const createGroup = useCallback(async (name: string, personaIds: string[] = []): Promise<PersonaGroup | null> => {
    try {
      const res = await fetch(API_ROUTES.PERSONA_GROUPS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, personaIds }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setGroups((prev) => [...prev, data.group]);
      return data.group;
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성 실패");
      return null;
    }
  }, []);

  const updateGroup = useCallback(async (id: string, updates: { name?: string; personaIds?: string[] }): Promise<PersonaGroup | null> => {
    try {
      const res = await fetch(API_ROUTES.PERSONA_GROUP_BY_ID(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setGroups((prev) => prev.map((g) => (g.id === id ? data.group : g)));
      return data.group;
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정 실패");
      return null;
    }
  }, []);

  const deleteGroup = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(API_ROUTES.PERSONA_GROUP_BY_ID(id), { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
      return false;
    }
  }, []);

  return { groups, isLoading, error, createGroup, updateGroup, deleteGroup, refresh: fetchGroups };
}
