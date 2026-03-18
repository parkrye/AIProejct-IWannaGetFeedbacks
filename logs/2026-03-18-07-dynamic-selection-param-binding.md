# 2026-03-18-07: 동적 페르소나 선택 + 파라미터 시스템 동작 연동

## 요청
1. 파라미터가 실제 시스템 동작에 영향을 주도록 개선
2. 관심사 기반 동적 페르소나 선택 모드 추가
3. 피드백 선택 모드를 "동적/그룹/직접" 3모드로 구분

## 수행 내용

### 파라미터 → 시스템 동작 직접 연동
- **temperature 연동**: 헛소리 레벨(nonsense) 0~10 → temperature 0.3~1.2
- **maxTokens 연동**: 길이(verbosity) 0~10 → maxTokens 48~256
- **RAG 필터 연동**: 페르소나의 첫 번째 관심사로 벡터 검색 필터링
- 페르소나별 개별 파라미터가 있으면 해당 페르소나의 temperature/maxTokens에 반영

### 동적 페르소나 선택 (`matchPersonasByContent`)
- `src/domains/persona/matchPersonas.ts` 신규 생성
- 게시글의 키워드/토픽과 페르소나 관심사의 매칭 점수 계산
  - 완전 일치: 3점, 본문 포함: 2점, 부분 일치: 1점
  - 관심사 개수로 정규화하여 비교 가능하도록
- 매칭 점수 상위 3명 자동 선택 (MIN_MATCH_SCORE 이상만)
- 매칭 페르소나가 없으면 상위 3명 폴백

### 3모드 선택 UI
- **동적 선택**: 게시글 내용 분석 → 관심사 매칭 → 자동 선택 (personaIds 빈 배열 전송)
- **그룹 선택**: 그룹 버튼만 표시, 그룹 클릭으로 한번에 선택
- **직접 선택**: 개별 페르소나 토글 (기존 방식)
- 모드 전환 탭 UI + 모드별 설명 텍스트

### 서버 변경 (`generateRoute.ts`)
- `selectionMode === "dynamic"` 시 `matchPersonasByContent()` 호출
- `deriveModelOverrides()`: 파라미터에서 temperature/maxTokens 계산
- `getRagResults()`: 페르소나 관심사로 검색 필터 적용

## 테스트 결과
- **17개 파일, 58개 테스트 전체 통과**
- TypeScript 컴파일 에러 없음
