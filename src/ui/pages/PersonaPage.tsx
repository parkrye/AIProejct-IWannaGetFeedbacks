import { useState } from "react";
import type { Persona, PersonaProfile, PersonaParams } from "../../shared/types.ts";
import { PersonaList } from "../components/PersonaList/index.ts";
import { PersonaForm, type PersonaFormData } from "../components/PersonaForm/index.ts";
import { ErrorBanner } from "../components/ErrorBanner/index.ts";
import { LoadingSpinner } from "../components/LoadingSpinner/index.ts";
import { usePersonaCrud } from "../hooks/usePersonaCrud.ts";
import "./PersonaPage.css";

type PageMode = "list" | "create" | "edit";

function buildProfile(data: PersonaFormData): PersonaProfile | undefined {
  const profile: PersonaProfile = {
    age: data.age,
    gender: data.gender,
    interests: data.interests.length > 0 ? data.interests : undefined,
  };
  if (!profile.age && !profile.gender && !profile.interests) return undefined;
  return profile;
}

function buildParams(data: PersonaFormData): PersonaParams | undefined {
  const params: PersonaParams = {
    positivity: data.paramPositivity,
    nonsense: data.paramNonsense,
    verbosity: data.paramVerbosity,
    emoji: data.paramEmoji,
    formality: data.paramFormality,
  };
  const hasAny = Object.values(params).some((v) => v !== undefined);
  return hasAny ? params : undefined;
}

export function PersonaPage() {
  const crud = usePersonaCrud();
  const [mode, setMode] = useState<PageMode>("list");
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Persona | null>(null);

  const handleAdd = () => {
    setMode("create");
    setEditingPersona(null);
  };

  const handleEdit = (persona: Persona) => {
    setMode("edit");
    setEditingPersona(persona);
  };

  const handleDelete = (persona: Persona) => {
    setDeleteTarget(persona);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await crud.deletePersona(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleFormSubmit = async (data: PersonaFormData) => {
    if (mode === "create") {
      await crud.createPersona({
        category: data.category,
        name: data.name,
        traits: { tone: data.tone, emotionBias: data.emotionBias, formality: data.formality },
        profile: buildProfile(data),
        params: buildParams(data),
        promptHint: data.promptHint,
        examplePatterns: data.examplePatterns,
      });
    } else if (mode === "edit" && editingPersona) {
      await crud.updatePersona(editingPersona.id, {
        name: data.name,
        traits: { tone: data.tone, emotionBias: data.emotionBias, formality: data.formality },
        profile: buildProfile(data),
        params: buildParams(data),
        promptHint: data.promptHint,
        examplePatterns: data.examplePatterns,
      });
    }
    setMode("list");
    setEditingPersona(null);
  };

  const handleCancel = () => {
    setMode("list");
    setEditingPersona(null);
  };

  if (crud.isLoading) {
    return <LoadingSpinner message="페르소나 로딩 중..." />;
  }

  return (
    <div className="persona-page">
      {crud.error && <ErrorBanner message={crud.error} onDismiss={() => crud.refresh()} />}

      {deleteTarget && (
        <div className="persona-page__overlay">
          <div className="persona-page__confirm">
            <p>"{deleteTarget.name}" 페르소나를 삭제하시겠습니까?</p>
            <div className="persona-page__confirm-actions">
              <button className="persona-page__confirm-btn persona-page__confirm-btn--delete" onClick={confirmDelete}>
                삭제
              </button>
              <button className="persona-page__confirm-btn persona-page__confirm-btn--cancel" onClick={() => setDeleteTarget(null)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "list" && (
        <PersonaList
          personas={crud.personas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      )}

      {(mode === "create" || mode === "edit") && (
        <PersonaForm
          initialData={editingPersona ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
