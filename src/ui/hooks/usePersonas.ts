import { useState, useEffect } from "react";
import type { Persona } from "../../shared/types.ts";
import { API_ROUTES } from "../../shared/constants.ts";

interface UsePersonasReturn {
  readonly personas: readonly Persona[];
  readonly selected: readonly string[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly togglePersona: (id: string) => void;
  readonly selectAll: () => void;
  readonly deselectAll: () => void;
}

export function usePersonas(): UsePersonasReturn {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_ROUTES.PERSONAS)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPersonas(data.personas);
        setSelected(data.personas.map((p: Persona) => p.id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const togglePersona = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const selectAll = () => setSelected(personas.map((p) => p.id));
  const deselectAll = () => setSelected([]);

  return { personas, selected, isLoading, error, togglePersona, selectAll, deselectAll };
}
