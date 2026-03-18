# 2026-03-18-04: 생성 엔진 버그 수정

## 요청
피드백 생성 시 첫 번째 페르소나만 생성되고 나머지 오류 발생 문제 해결 + maxTokens 감소.

## 수행 내용

### No sequences left 에러 수정
- 원인: `LlamaChatSession` 생성 시 `context.getSequence()`로 시퀀스를 점유하지만, 생성 완료 후 해제하지 않음
- 해결: `generateWithCallback`에 try/finally 추가 → `sequence.dispose()` 보장
- 파일: `src/domains/generation/llmEngine.ts`

### maxTokens 감소
- 512 → 128 (SNS 댓글은 짧으므로 충분)
- CPU 추론 속도 ~4배 향상 효과

### 생성 에러 로깅 개선
- 기존: 고정 메시지 "모델이 로드되지 않았습니다"
- 변경: 실제 에러 메시지 콘솔 출력 + 클라이언트에 구체적 에러 전달
