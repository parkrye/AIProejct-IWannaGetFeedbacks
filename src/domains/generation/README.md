# generation

프롬프트 조립 + LLM 추론 도메인.

## 책임
- 프롬프트 빌더: 페르소나 + 분석결과 + few-shot → 프롬프트 조립
- LLM 엔진: node-llama-cpp 래퍼, 모델 로딩/추론/스트리밍

## 의존성
- `node-llama-cpp` (서버 전용)
- `shared/types.ts`
