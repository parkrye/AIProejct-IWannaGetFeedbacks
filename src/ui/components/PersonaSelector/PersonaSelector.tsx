import type { Persona } from "../../../shared/types.ts";
import "./PersonaSelector.css";

interface PersonaSelectorProps {
  readonly personas: readonly Persona[];
  readonly selected: readonly string[];
  readonly onToggle: (id: string) => void;
  readonly onSelectAll: () => void;
  readonly onDeselectAll: () => void;
  readonly isLoading: boolean;
}

export function PersonaSelector({
  personas,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
  isLoading,
}: PersonaSelectorProps) {
  if (isLoading) {
    return <div className="persona-selector__loading">페르소나 로딩 중...</div>;
  }

  return (
    <div className="persona-selector">
      <div className="persona-selector__header">
        <h3 className="persona-selector__title">페르소나 선택</h3>
        <div className="persona-selector__actions">
          <button onClick={onSelectAll} className="persona-selector__action-btn">
            전체 선택
          </button>
          <button onClick={onDeselectAll} className="persona-selector__action-btn">
            전체 해제
          </button>
        </div>
      </div>

      <div className="persona-selector__grid">
        {personas.map((persona) => (
          <button
            key={persona.id}
            className={`persona-selector__card ${
              selected.includes(persona.id) ? "persona-selector__card--selected" : ""
            }`}
            onClick={() => onToggle(persona.id)}
          >
            <span className="persona-selector__name">{persona.name}</span>
            <span className="persona-selector__hint">{persona.promptHint.slice(0, 40)}...</span>
          </button>
        ))}
      </div>

      <p className="persona-selector__count">{selected.length}명 선택됨</p>
    </div>
  );
}
