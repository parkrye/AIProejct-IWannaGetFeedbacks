import { useState, type FormEvent } from "react";
import type {
  Persona, ToneType, EmotionBias, FormalityLevel, GenderType,
} from "../../../shared/types.ts";
import { INTEREST_OPTIONS } from "../../../shared/types.ts";
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
  readonly age?: number;
  readonly gender?: GenderType;
  readonly interests: string[];
  readonly paramPositivity?: number;
  readonly paramNonsense?: number;
  readonly paramVerbosity?: number;
  readonly paramEmoji?: number;
  readonly paramFormality?: number;
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

const GENDER_OPTIONS: { value: GenderType | ""; label: string }[] = [
  { value: "", label: "미지정" },
  { value: "남성", label: "남성" },
  { value: "여성", label: "여성" },
  { value: "중성적", label: "중성적" },
];

interface ParamSliderProps {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  leftLabel: string;
  rightLabel: string;
}

function ParamSlider({ label, value, onChange, leftLabel, rightLabel }: ParamSliderProps) {
  const enabled = value !== undefined;
  return (
    <div className="persona-form__param">
      <div className="persona-form__param-header">
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked ? 5 : undefined)}
          />
          {label}
        </label>
        {enabled && <span className="persona-form__param-value">{value}</span>}
      </div>
      {enabled && (
        <div className="persona-form__param-row">
          <span className="persona-form__param-label">{leftLabel}</span>
          <input
            type="range" min={0} max={10}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="persona-form__param-input"
          />
          <span className="persona-form__param-label">{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

export function PersonaForm({ initialData, onSubmit, onCancel }: PersonaFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState("personality");
  const [tone, setTone] = useState<ToneType>(initialData?.traits.tone ?? "friendly");
  const [emotionBias, setEmotionBias] = useState<EmotionBias>(initialData?.traits.emotionBias ?? "neutral");
  const [formality, setFormality] = useState<FormalityLevel>(initialData?.traits.formality ?? "casual");
  const [promptHint, setPromptHint] = useState(initialData?.promptHint ?? "");
  const [patternsText, setPatternsText] = useState(initialData?.examplePatterns.join("\n") ?? "");

  const [age, setAge] = useState<number | "">(initialData?.profile?.age ?? "");
  const [gender, setGender] = useState<GenderType | "">(initialData?.profile?.gender ?? "");
  const [interests, setInterests] = useState<string[]>([...(initialData?.profile?.interests ?? [])]);

  const [paramPositivity, setParamPositivity] = useState<number | undefined>(initialData?.params?.positivity);
  const [paramNonsense, setParamNonsense] = useState<number | undefined>(initialData?.params?.nonsense);
  const [paramVerbosity, setParamVerbosity] = useState<number | undefined>(initialData?.params?.verbosity);
  const [paramEmoji, setParamEmoji] = useState<number | undefined>(initialData?.params?.emoji);
  const [paramFormality, setParamFormality] = useState<number | undefined>(initialData?.params?.formality);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

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
      age: age === "" ? undefined : age,
      gender: gender === "" ? undefined : gender,
      interests,
      paramPositivity,
      paramNonsense,
      paramVerbosity,
      paramEmoji,
      paramFormality,
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

      <div className="persona-form__row">
        <label className="persona-form__field persona-form__field--half">
          <span>톤</span>
          <select value={tone} onChange={(e) => setTone(e.target.value as ToneType)}>
            {TONE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="persona-form__field persona-form__field--half">
          <span>감정 경향</span>
          <select value={emotionBias} onChange={(e) => setEmotionBias(e.target.value as EmotionBias)}>
            {EMOTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="persona-form__field persona-form__field--half">
          <span>격식</span>
          <select value={formality} onChange={(e) => setFormality(e.target.value as FormalityLevel)}>
            {FORMALITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <h3 className="persona-form__section-title">프로필 (선택)</h3>

      <div className="persona-form__row">
        <label className="persona-form__field persona-form__field--half">
          <span>나이</span>
          <input
            type="number" min={10} max={80} placeholder="미지정"
            value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
        <label className="persona-form__field persona-form__field--half">
          <span>성별</span>
          <select value={gender} onChange={(e) => setGender(e.target.value as GenderType | "")}>
            {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <div className="persona-form__field">
        <span>관심사</span>
        <div className="persona-form__interests">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              className={`persona-form__interest-tag ${interests.includes(interest) ? "persona-form__interest-tag--selected" : ""}`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <h3 className="persona-form__section-title">개별 파라미터 (선택, 체크 시 전역 파라미터 오버라이드)</h3>

      <ParamSlider label="긍정 레벨" value={paramPositivity} onChange={setParamPositivity} leftLabel="부정" rightLabel="긍정" />
      <ParamSlider label="헛소리 레벨" value={paramNonsense} onChange={setParamNonsense} leftLabel="충실" rightLabel="자유" />
      <ParamSlider label="길이" value={paramVerbosity} onChange={setParamVerbosity} leftLabel="짧게" rightLabel="길게" />
      <ParamSlider label="이모지" value={paramEmoji} onChange={setParamEmoji} leftLabel="없음" rightLabel="많이" />
      <ParamSlider label="격식(말투)" value={paramFormality} onChange={setParamFormality} leftLabel="반말" rightLabel="존댓말" />

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
