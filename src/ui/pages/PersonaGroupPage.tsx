import { useState } from "react";
import type { Persona, PersonaGroup } from "../../shared/types.ts";
import { ErrorBanner } from "../components/ErrorBanner/index.ts";
import { LoadingSpinner } from "../components/LoadingSpinner/index.ts";
import { usePersonaGroups } from "../hooks/usePersonaGroups.ts";
import { usePersonas } from "../hooks/usePersonas.ts";
import "./PersonaGroupPage.css";

type PageMode = "list" | "edit";

export function PersonaGroupPage() {
  const groups = usePersonaGroups();
  const personas = usePersonas();
  const [mode, setMode] = useState<PageMode>("list");
  const [editingGroup, setEditingGroup] = useState<PersonaGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [editName, setEditName] = useState("");
  const [editPersonaIds, setEditPersonaIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<PersonaGroup | null>(null);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    await groups.createGroup(newGroupName.trim());
    setNewGroupName("");
  };

  const handleStartEdit = (group: PersonaGroup) => {
    setEditingGroup(group);
    setEditName(group.name);
    setEditPersonaIds([...group.personaIds]);
    setMode("edit");
  };

  const handleSaveEdit = async () => {
    if (!editingGroup) return;
    await groups.updateGroup(editingGroup.id, { name: editName, personaIds: editPersonaIds });
    setMode("list");
    setEditingGroup(null);
  };

  const handleTogglePersona = (id: string) => {
    setEditPersonaIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await groups.deleteGroup(deleteTarget.id);
    setDeleteTarget(null);
  };

  const getPersonaName = (id: string): string => {
    return personas.personas.find((p) => p.id === id)?.name ?? id;
  };

  if (groups.isLoading || personas.isLoading) {
    return <LoadingSpinner message="로딩 중..." />;
  }

  return (
    <div className="pg-page">
      {groups.error && <ErrorBanner message={groups.error} />}

      {deleteTarget && (
        <div className="pg-page__overlay">
          <div className="pg-page__confirm">
            <p>"{deleteTarget.name}" 그룹을 삭제하시겠습니까?</p>
            <div className="pg-page__confirm-actions">
              <button className="pg-page__confirm-btn pg-page__confirm-btn--delete" onClick={confirmDelete}>삭제</button>
              <button className="pg-page__confirm-btn pg-page__confirm-btn--cancel" onClick={() => setDeleteTarget(null)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {mode === "list" && (
        <>
          <div className="pg-page__header">
            <h2 className="pg-page__title">페르소나 그룹 ({groups.groups.length})</h2>
          </div>

          <div className="pg-page__create">
            <input
              type="text"
              placeholder="새 그룹 이름..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="pg-page__create-input"
              onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
            />
            <button onClick={handleCreateGroup} className="pg-page__create-btn">그룹 추가</button>
          </div>

          <div className="pg-page__list">
            {groups.groups.map((group) => (
              <div key={group.id} className="pg-page__card">
                <div className="pg-page__card-header">
                  <h3 className="pg-page__card-name">{group.name}</h3>
                  <span className="pg-page__card-count">{group.personaIds.length}명</span>
                </div>
                <div className="pg-page__card-members">
                  {group.personaIds.length === 0
                    ? <span className="pg-page__card-empty">멤버 없음</span>
                    : group.personaIds.map((id) => (
                        <span key={id} className="pg-page__member-tag">{getPersonaName(id)}</span>
                      ))
                  }
                </div>
                <div className="pg-page__card-actions">
                  <button className="pg-page__btn pg-page__btn--edit" onClick={() => handleStartEdit(group)}>편집</button>
                  <button className="pg-page__btn pg-page__btn--delete" onClick={() => setDeleteTarget(group)}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {mode === "edit" && editingGroup && (
        <div className="pg-page__edit">
          <h2 className="pg-page__title">그룹 편집</h2>
          <label className="pg-page__edit-field">
            <span>그룹 이름</span>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </label>

          <h3 className="pg-page__edit-subtitle">
            페르소나 선택 ({editPersonaIds.length}명)
          </h3>
          <div className="pg-page__edit-grid">
            {personas.personas.map((p: Persona) => (
              <button
                key={p.id}
                className={`pg-page__edit-card ${editPersonaIds.includes(p.id) ? "pg-page__edit-card--selected" : ""}`}
                onClick={() => handleTogglePersona(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="pg-page__edit-actions">
            <button className="pg-page__btn pg-page__btn--save" onClick={handleSaveEdit}>저장</button>
            <button className="pg-page__btn pg-page__btn--cancel" onClick={() => setMode("list")}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
}
