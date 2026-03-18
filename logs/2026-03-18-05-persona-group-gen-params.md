# 2026-03-18-05: 페르소나 그룹 + 생성 파라미터 + 프로그래스바 개선

## 요청
1. 피드백 생성 시 페르소나별 진척도 표시
2. 페르소나 그룹 기능 추가
3. 피드백 생성 파라미터(긍정 레벨, 헛소리 레벨 등) 슬라이더 추가

## 수행 내용

### 프로그래스바 개선
- 서버: 매 토큰마다 `progress: { current, total, tokenCount, maxTokens }` SSE 전송
- 프론트: 전체 진행률 = (완료 페르소나 + 현재 토큰%) / 총 페르소나
- "2/5 페르소나 | 토큰: 45/128 | 52%" 형태 표시

### 페르소나 그룹
- **도메인**: `src/domains/persona-group/` — CRUD + JSON 영속화 (`data/persona-groups/groups.json`)
- **서버 API**: GET/POST/PUT/DELETE `/api/persona-groups/:id`
- **그룹 페이지** (`/groups`):
  - 그룹 목록 확인, 이름 입력하여 추가, 삭제(확인 모달)
  - 편집 모드: 그룹 이름 수정, 멤버 페르소나 토글 선택
- **피드백 페이지 통합**:
  - PersonaGroupSelector: 그룹 버튼 클릭 → 해당 그룹 멤버 한번에 선택
  - 개별 페르소나 직접 선택도 유지
- **네비게이션**: "피드백 | 페르소나 | 그룹" 3탭

### 생성 파라미터
- **타입**: `GenerationParams` — positivity, nonsense, verbosity, emoji, formality (0~10)
- **UI**: `GenerationParamsPanel` — 슬라이더 5개, 양쪽 라벨 표시
- **프롬프트 반영**: `promptBuilder.formatGenerationParams()` — 값 범위에 따라 자연어 지시문 자동 생성
  - 예: positivity=2 → "매우 부정적이고 비판적인 톤으로 작성하세요."
  - 예: nonsense=8 → "게시글 내용과 상관없이 자유롭게 연상되는 내용을 작성하세요."
- **파라미터 목록**:

| 파라미터 | 0 | 10 |
|----------|---|-----|
| positivity | 부정적 | 긍정적 |
| nonsense | 내용 충실 | 자유 연상 |
| verbosity | 짧게 | 길게 |
| emoji | 없음 | 많이 |
| formality | 반말 | 존댓말 |

## 테스트 결과
- **17개 파일, 58개 테스트 전체 통과**
- TypeScript 컴파일 에러 없음
