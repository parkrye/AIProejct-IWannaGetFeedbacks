import type { Persona } from "../../../shared/types.ts";
import "./PersonaList.css";

interface PersonaListProps {
  readonly personas: readonly Persona[];
  readonly onEdit: (persona: Persona) => void;
  readonly onDelete: (persona: Persona) => void;
  readonly onAdd: () => void;
}

const TONE_LABELS: Record<string, string> = {
  enthusiastic: "열정적",
  calm: "차분한",
  sarcastic: "위트있는",
  analytical: "분석적",
  friendly: "친근한",
};

const EMOTION_LABELS: Record<string, string> = {
  positive: "긍정",
  negative: "부정",
  neutral: "중립",
};

const FORMALITY_LABELS: Record<string, string> = {
  formal: "격식체",
  casual: "비격식체",
  mixed: "혼합",
};

export function PersonaList({ personas, onEdit, onDelete, onAdd }: PersonaListProps) {
  return (
    <div className="persona-list">
      <div className="persona-list__header">
        <h2 className="persona-list__title">페르소나 목록 ({personas.length})</h2>
        <button className="persona-list__add-btn" onClick={onAdd}>
          + 새 페르소나
        </button>
      </div>

      <div className="persona-list__grid">
        {personas.map((persona) => (
          <div key={persona.id} className="persona-list__card">
            <div className="persona-list__card-header">
              <div className="persona-list__avatar">{persona.name.charAt(0)}</div>
              <h3 className="persona-list__name">{persona.name}</h3>
            </div>

            <div className="persona-list__traits">
              <span className="persona-list__tag">{TONE_LABELS[persona.traits.tone] ?? persona.traits.tone}</span>
              <span className="persona-list__tag">{EMOTION_LABELS[persona.traits.emotionBias] ?? persona.traits.emotionBias}</span>
              <span className="persona-list__tag">{FORMALITY_LABELS[persona.traits.formality] ?? persona.traits.formality}</span>
              {persona.profile?.age && <span className="persona-list__tag">{persona.profile.age}세</span>}
              {persona.profile?.gender && <span className="persona-list__tag">{persona.profile.gender}</span>}
            </div>

            {persona.profile?.interests && persona.profile.interests.length > 0 && (
              <div className="persona-list__interests">
                {persona.profile.interests.map((interest) => (
                  <span key={interest} className="persona-list__interest">{interest}</span>
                ))}
              </div>
            )}

            <p className="persona-list__hint">{persona.promptHint}</p>

            {persona.examplePatterns.length > 0 && (
              <div className="persona-list__patterns">
                {persona.examplePatterns.slice(0, 3).map((p, i) => (
                  <span key={i} className="persona-list__pattern">"{p}"</span>
                ))}
              </div>
            )}

            <div className="persona-list__actions">
              <button className="persona-list__btn persona-list__btn--edit" onClick={() => onEdit(persona)}>
                수정
              </button>
              <button className="persona-list__btn persona-list__btn--delete" onClick={() => onDelete(persona)}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
