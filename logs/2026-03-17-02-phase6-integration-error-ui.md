# 2026-03-17-02: Phase 6 — 통합 테스트 + 에러/로딩 UI

## 요청
Phase 6 진행: E2E 통합 테스트, 에러/로딩 UI 처리.

## 수행 내용

### 서버 리팩터링
- `server/index.ts` → `server/app.ts` + `server/index.ts` 분리
  - `app.ts`: `createApp`, `loadData`, `loadModel`, `createTestApp` 내보내기 (테스트 가능)
  - `index.ts`: 진입점 (`main()` 호출)
- `tsx` 설치 → `npm run server`로 TypeScript 직접 실행 가능

### 서버 통합 테스트 (supertest)
- `analyzeRoute.test.ts`: 텍스트 분석 API 4개 테스트 (정상 응답, 감정 분석, 400 에러)
- `personaRoute.test.ts`: 페르소나 목록 API 3개 테스트 (목록, 필드 검증, 카테고리)
- `generateRoute.test.ts`: 생성 API 4개 테스트 (400/404 에러, SSE 스트림 폴백 모드)

### UI 컴포넌트 추가
- **ErrorBanner**: 에러 메시지 + 다시 시도/닫기 버튼, role="alert"
- **LoadingSpinner**: 로딩 애니메이션 + 메시지
- **FeedbackDisplay 개선**: ErrorBanner 통합, 로딩 스피너, 부분 결과 표시
- **App.tsx 개선**: 전역 에러 표시, 재시도 기능, 이미지 미리보기 연결

### 컴포넌트 테스트
- `ErrorBanner.test.tsx`: 5개 테스트 (메시지, 버튼 표시/숨김, 콜백, 접근성)
- `FeedbackDisplay.test.tsx`: 6개 테스트 (빈 상태, 로딩, 에러, 카드 표시, 스트리밍, 부분 결과)

## 테스트 결과
- **10개 파일, 41개 테스트 전체 통과**
- TypeScript 컴파일 에러 없음 (frontend + server)
