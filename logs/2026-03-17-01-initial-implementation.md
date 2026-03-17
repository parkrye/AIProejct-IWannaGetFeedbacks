# 2026-03-17-01: 초기 구현 (Phase 1~5)

## 요청
AI Multi-Persona SNS Feedback Generator 전체 구현 계획에 따른 초기 구현.

## 수행 내용

### Phase 1: 프로젝트 스캐폴딩
- Vite + React + TypeScript 프로젝트 초기화
- 의존성 설치: `node-llama-cpp`, `@mediapipe/tasks-vision`, `express`, `vitest`, `@testing-library/react`, `eslint`, `prettier`
- 디렉터리 구조 생성 (6개 도메인, shared, server, ui, data)
- 설정 파일: `vitest.config.ts`, `tsconfig.server.json`, `.prettierrc`

### Phase 2: 공유 타입 + 데이터 파일
- `src/shared/types.ts` — 전체 도메인 계약 정의 (SnsPost, Persona, TextAnalysisResult, GenerationRequest 등)
- `src/shared/constants.ts` — API 경로, 모델 기본값, 분석 임계값
- 페르소나 JSON (`data/personas/personality.json`) — 5개 페르소나 정의
- 모델 설정, 프롬프트 템플릿, 피드백 예시 데이터

### Phase 3: 도메인 구현
- **document-input**: 게시글 검증/파싱, FileReader 기반 이미지 변환
- **image-analysis**: MediaPipe ImageClassifier 래퍼, 주요 색상 추출
- **text-analysis**: 한국어 키워드 추출, 감정 사전 기반 감정 분석
- **persona**: 레지스트리 패턴 기반 페르소나 관리, JSON 파일 로딩
- **feedback-data**: 피드백 예시 저장소, few-shot 필터링
- **generation**: 프롬프트 빌더 (템플릿 치환), node-llama-cpp LLM 엔진 래퍼

### Phase 4: 서버 레이어
- Express 서버 (`src/server/index.ts`)
- API 라우트: `POST /api/analyze`, `POST /api/generate` (SSE), `GET /api/personas`
- Vite proxy 설정으로 dev 환경에서 API 프록시

### Phase 5: UI 컴포넌트
- PostInput: 텍스트+이미지 입력, 검증
- ImagePreview: 이미지 태그/색상 표시
- PersonaSelector: 카드 그리드 기반 선택
- FeedbackCard: 아바타+이름+타이핑 커서 효과
- FeedbackDisplay: 카드 그리드 레이아웃
- Hooks: useImageAnalysis, useTextAnalysis, useGeneration, usePersonas

## 테스트 결과
- 5개 테스트 파일, 19개 테스트 전체 통과
- TypeScript 컴파일 에러 없음 (frontend + server)

## 페르소나 (5종)
| ID | 이름 | 톤 |
|----|------|-----|
| cheerful-supporter | 밝은 응원단 | 열정적/긍정 |
| calm-analyst | 차분한 분석가 | 분석적/중립 |
| witty-commenter | 재치있는 댓글러 | 위트/중립 |
| friendly-neighbor | 다정한 이웃 | 친근/긍정 |
| tough-critic | 까다로운 비평가 | 분석적/부정 |
