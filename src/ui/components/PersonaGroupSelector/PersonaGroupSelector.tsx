import type { Persona, PersonaGroup } from "../../../shared/types.ts";
import "./PersonaGroupSelector.css";

interface PersonaGroupSelectorProps {
  readonly personas: readonly Persona[];
  readonly groups: readonly PersonaGroup[];
  readonly selected: readonly string[];
  readonly onSelectGroup: (personaIds: readonly string[]) => void;
  readonly onTogglePersona: (id: string) => void;
  readonly onSelectAll: () => void;
  readonly onDeselectAll: () => void;
  readonly isLoading: boolean;
  readonly showGroups?: boolean;
}

export function PersonaGroupSelector({
  personas,
  groups,
  selected,
  onSelectGroup,
  onTogglePersona,
  onSelectAll,
  onDeselectAll,
  isLoading,
  showGroups = true,
}: PersonaGroupSelectorProps) {
  if (isLoading) {
    return <div className="pg-selector__loading">페르소나 로딩 중...</div>;
  }

  return (
    <div className="pg-selector">
      <div className="pg-selector__header">
        <h3 className="pg-selector__title">페르소나 선택</h3>
        <div className="pg-selector__actions">
          <button onClick={onSelectAll} className="pg-selector__action-btn">전체 선택</button>
          <button onClick={onDeselectAll} className="pg-selector__action-btn">전체 해제</button>
        </div>
      </div>

      {showGroups && groups.length > 0 && (
        <div className="pg-selector__groups">
          <span className="pg-selector__groups-label">그룹:</span>
          {groups.map((group) => (
            <button
              key={group.id}
              className="pg-selector__group-btn"
              onClick={() => onSelectGroup(group.personaIds)}
            >
              {group.name} ({group.personaIds.length})
            </button>
          ))}
        </div>
      )}

      <div className="pg-selector__grid">
        {personas.map((persona) => (
          <button
            key={persona.id}
            className={`pg-selector__card ${selected.includes(persona.id) ? "pg-selector__card--selected" : ""}`}
            onClick={() => onTogglePersona(persona.id)}
          >
            <span className="pg-selector__name">{persona.name}</span>
            <span className="pg-selector__hint">{persona.promptHint.slice(0, 40)}...</span>
          </button>
        ))}
      </div>

      <p className="pg-selector__count">{selected.length}명 선택됨</p>
    </div>
  );
}
