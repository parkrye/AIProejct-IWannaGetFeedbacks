import { useState, type FormEvent } from "react";
import type { Persona, ToneType, EmotionBias, FormalityLevel } from "../../../shared/types.ts";
import "./PersonaForm.css";

interface PersonaFormProps {
  readonly initialData?: Persona;
  readonly onSubmit: (data: PersonaFormData) => void;
  readonly onCancel: () => void;
}

export interface PersonaFormData {
  readonly category: string;
  readonly name: string;
  readonly tone: ToneType;
  readonly emotionBias: EmotionBias;
  readonly formality: FormalityLevel;
  readonly promptHint: string;
  readonly examplePatterns: string[];
}

const TONE_OPTIONS: { value: ToneType; label: string }[] = [
  { value: "enthusiastic", label: "열정적" },
  { value: "calm", label: "차분한" },
  { value: "sarcastic", label: "위트있는" },
  { value: "analytical", label: "분석적" },
  { value: "friendly", label: "친근한" },
];

const EMOTION_OPTIONS: { value: EmotionBias; label: string }[] = [
  { value: "positive", label: "긍정적" },
  { value: "negative", label: "부정적" },
  { value: "neutral", label: "중립적" },
];

const FORMALITY_OPTIONS: { value: FormalityLevel; label: string }[] = [
  { value: "formal", label: "격식체" },
  { value: "casual", label: "비격식체" },
  { value: "mixed", label: "혼합" },
];

export function PersonaForm({ initialData, onSubmit, onCancel }: PersonaFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState("personality");
  const [tone, setTone] = useState<ToneType>(initialData?.traits.tone ?? "friendly");
  const [emotionBias, setEmotionBias] = useState<EmotionBias>(initialData?.traits.emotionBias ?? "neutral");
  const [formality, setFormality] = useState<FormalityLevel>(initialData?.traits.formality ?? "casual");
  const [promptHint, setPromptHint] = useState(initialData?.promptHint ?? "");
  const [patternsText, setPatternsText] = useState(
    initialData?.examplePatterns.join("\n") ?? "",
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      category,
      name,
      tone,
      emotionBias,
      formality,
      promptHint,
      examplePatterns: patternsText.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  const isEdit = !!initialData;

  return (
    <form className="persona-form" onSubmit={handleSubmit}>
      <h2 className="persona-form__title">{isEdit ? "페르소나 수정" : "새 페르소나 추가"}</h2>

      <label className="persona-form__field">
        <span>이름</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      {!isEdit && (
        <label className="persona-form__field">
          <span>카테고리</span>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </label>
      )}

      <label className="persona-form__field">
        <span>톤</span>
        <select value={tone} onChange={(e) => setTone(e.target.value as ToneType)}>
          {TONE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      <label className="persona-form__field">
        <span>감정 경향</span>
        <select value={emotionBias} onChange={(e) => setEmotionBias(e.target.value as EmotionBias)}>
          {EMOTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      <label className="persona-form__field">
        <span>격식</span>
        <select value={formality} onChange={(e) => setFormality(e.target.value as FormalityLevel)}>
          {FORMALITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      <label className="persona-form__field">
        <span>성격 설명 (프롬프트 힌트)</span>
        <textarea value={promptHint} onChange={(e) => setPromptHint(e.target.value)} rows={3} required />
      </label>

      <label className="persona-form__field">
        <span>예시 패턴 (줄바꿈으로 구분)</span>
        <textarea value={patternsText} onChange={(e) => setPatternsText(e.target.value)} rows={3} />
      </label>

      <div className="persona-form__actions">
        <button type="submit" className="persona-form__btn persona-form__btn--submit">
          {isEdit ? "수정" : "추가"}
        </button>
        <button type="button" className="persona-form__btn persona-form__btn--cancel" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}
