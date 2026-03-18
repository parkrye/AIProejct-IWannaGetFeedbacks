import type { GenerationParams } from "../../../shared/types.ts";
import "./GenerationParams.css";

interface GenerationParamsProps {
  readonly params: GenerationParams;
  readonly onChange: (params: GenerationParams) => void;
}

interface ParamConfig {
  readonly key: keyof GenerationParams;
  readonly label: string;
  readonly leftLabel: string;
  readonly rightLabel: string;
}

const PARAM_CONFIGS: ParamConfig[] = [
  { key: "positivity", label: "긍정 레벨", leftLabel: "부정적", rightLabel: "긍정적" },
  { key: "nonsense", label: "헛소리 레벨", leftLabel: "내용 충실", rightLabel: "자유 연상" },
  { key: "verbosity", label: "길이", leftLabel: "짧게", rightLabel: "길게" },
  { key: "emoji", label: "이모지", leftLabel: "없음", rightLabel: "많이" },
  { key: "formality", label: "격식", leftLabel: "반말", rightLabel: "존댓말" },
];

export function GenerationParamsPanel({ params, onChange }: GenerationParamsProps) {
  const handleChange = (key: keyof GenerationParams, value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="gen-params">
      <h3 className="gen-params__title">생성 파라미터</h3>
      {PARAM_CONFIGS.map((config) => (
        <div key={config.key} className="gen-params__slider">
          <div className="gen-params__label">
            <span>{config.label}</span>
            <span className="gen-params__value">{params[config.key]}</span>
          </div>
          <div className="gen-params__range-row">
            <span className="gen-params__range-label">{config.leftLabel}</span>
            <input
              type="range"
              min={0}
              max={10}
              value={params[config.key]}
              onChange={(e) => handleChange(config.key, Number(e.target.value))}
              className="gen-params__input"
            />
            <span className="gen-params__range-label">{config.rightLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
