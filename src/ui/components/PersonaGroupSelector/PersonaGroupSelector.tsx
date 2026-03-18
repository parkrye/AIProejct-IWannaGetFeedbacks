import { useState } from "react";
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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="pg-selector__loading">페르소나 로딩 중...</div>;
  }

  const handleGroupClick = (group: PersonaGroup) => {
    setSelectedGroupId(group.id);
    onSelectGroup(group.personaIds);
  };

  const selectedGroup = selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null;
  const displayPersonas = showGroups && selectedGroup
    ? personas.filter((p) => selectedGroup.personaIds.includes(p.id))
    : personas;

  return (
    <div className="pg-selector">
      {showGroups && groups.length > 0 && (
        <div className="pg-selector__groups">
          <span className="pg-selector__groups-label">그룹:</span>
          {groups.map((group) => (
            <button
              key={group.id}
              className={`pg-selector__group-btn ${selectedGroupId === group.id ? "pg-selector__group-btn--active" : ""}`}
              onClick={() => handleGroupClick(group)}
            >
              {group.name} ({group.personaIds.length})
            </button>
          ))}
        </div>
      )}

      {!showGroups && (
        <div className="pg-selector__header">
          <h3 className="pg-selector__title">페르소나 선택</h3>
          <div className="pg-selector__actions">
            <button onClick={onSelectAll} className="pg-selector__action-btn">전체 선택</button>
            <button onClick={onDeselectAll} className="pg-selector__action-btn">전체 해제</button>
          </div>
        </div>
      )}

      {showGroups && !selectedGroup && (
        <p className="pg-selector__hint">그룹을 선택하세요</p>
      )}

      {displayPersonas.length > 0 && (showGroups ? selectedGroup : true) && (
        <>
          {showGroups && selectedGroup && (
            <p className="pg-selector__group-info">
              {selectedGroup.name} — {displayPersonas.length}명
            </p>
          )}
          <div className="pg-selector__grid">
            {displayPersonas.map((persona) => (
              <button
                key={persona.id}
                className={`pg-selector__card ${selected.includes(persona.id) ? "pg-selector__card--selected" : ""}`}
                onClick={() => onTogglePersona(persona.id)}
              >
                <span className="pg-selector__name">{persona.name}</span>
                <span className="pg-selector__hint-text">{persona.promptHint.slice(0, 40)}...</span>
              </button>
            ))}
          </div>
        </>
      )}

      <p className="pg-selector__count">{selected.length}명 선택됨</p>
    </div>
  );
}
