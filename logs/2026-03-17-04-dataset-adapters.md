# 2026-03-17-04: 추가 데이터셋 어댑터 구현

## 요청
RAG 벡터 스토어에 추가할 3개 데이터셋 어댑터 구현.

## 수행 내용

### 문화/게임 콘텐츠 용어 말뭉치 어댑터
- **cultureTermUsageAdapter**: 용례 데이터 정규화 (문장 + 토큰 + 출처 URL)
  - 파일: 용례_게임.json(24,938건), 용례_레저.json(9,423건), 용례_미디어.json(8,467건)
- **cultureTermDefAdapter**: 용어 정의 데이터 정규화 (정의 + 관계어)
  - 파일: 용어.json(90,433건)
- 두 가지 스키마 → 각각 별도 어댑터

### 한국어 멀티세션 대화 어댑터
- **multiSessionDialogueAdapter**: 멀티세션 대화 정규화
  - 8,000건, 파일당 1건 JSON
  - 페르소나 정보(personaFeatures), 주제 정보(topicInfo), 다중 세션 대화 포함
  - 페르소나 특성을 combinedText에 포함하여 검색 품질 향상

### 온라인 구어체 말뭉치 어댑터
- **onlineColloquialAdapter**: 온라인 댓글 정규화 (문장 + 라벨 + 출처)
- **extractEntries**: 파일에서 개별 댓글 항목 추출 (5자 미만 필터링)
- 13개 카테고리 × ~수십만 건 = 약 1,270만 건
  - 메모리 제약으로 카테고리별 5,000건 샘플링 → 총 ~65,000건
  - `--sample-per-category=N` 옵션으로 조정 가능

### 빌드 스크립트 확장
- `build-vectors.ts` 리팩터링: 5개 소스 타입 지원
  - `sns-dialogue`, `culture-usage`, `culture-def`, `multi-session`, `online-colloquial`
- `--append` 플래그로 기존 벡터 스토어에 병합
- `processSingleFileJson` 제네릭 함수로 통합 (SNS, 멀티세션 공용)
- `processArrayJson` (문화/게임 용례, 용어)
- `processOnlineColloquial` (카테고리별 샘플링 + 셔플)

## 테스트 결과
- 어댑터 테스트 6개 추가
- **17개 파일, 58개 테스트 전체 통과**
