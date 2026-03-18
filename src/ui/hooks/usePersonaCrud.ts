import { useState, useEffect, useCallback } from "react";
import type { Persona, CreatePersonaRequest, UpdatePersonaRequest } from "../../shared/types.ts";
import { API_ROUTES } from "../../shared/constants.ts";

interface UsePersonaCrudReturn {
  readonly personas: Persona[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly createPersona: (data: CreatePersonaRequest) => Promise<Persona | null>;
  readonly updatePersona: (id: string, data: UpdatePersonaRequest) => Promise<Persona | null>;
  readonly deletePersona: (id: string) => Promise<boolean>;
  readonly refresh: () => void;
}

export function usePersonaCrud(): UsePersonaCrudReturn {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTES.PERSONAS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPersonas(data.personas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "페르소나 로딩 실패");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const createPersona = useCallback(async (data: CreatePersonaRequest): Promise<Persona | null> => {
    setError(null);
    try {
      const res = await fetch(API_ROUTES.PERSONAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const result = await res.json();
      setPersonas((prev) => [...prev, result.persona]);
      return result.persona;
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성 실패");
      return null;
    }
  }, []);

  const updatePersona = useCallback(async (id: string, data: UpdatePersonaRequest): Promise<Persona | null> => {
    setError(null);
    try {
      const res = await fetch(API_ROUTES.PERSONA_BY_ID(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const result = await res.json();
      setPersonas((prev) => prev.map((p) => (p.id === id ? result.persona : p)));
      return result.persona;
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정 실패");
      return null;
    }
  }, []);

  const deletePersona = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(API_ROUTES.PERSONA_BY_ID(id), { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setPersonas((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
      return false;
    }
  }, []);

  return { personas, isLoading, error, createPersona, updatePersona, deletePersona, refresh: fetchPersonas };
}
