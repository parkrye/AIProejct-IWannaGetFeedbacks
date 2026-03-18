# 2026-03-18-12: 피드백 인원 선택기 추가

## 요청
피드백 요청 시 사용자가 인원(1~10명)을 선택할 수 있도록. 그룹/동적 모드에서 n명 선택 시 그룹 크기에 따라 선발 로직 적용.

## 수행 내용

### 선발 공식
- `n`: 사용자 선택 인원 (1~10)
- `m = n * 2`: 랜덤 혼합 임계값
- `i = ceil(n * 0.6)`: 관심사 매칭 인원
- `j = n - i`: 무작위 인원

| 그룹 크기 | 선발 방식 |
|-----------|----------|
| n명 이하 | 전원 |
| n+1 ~ n+m-1명 | 관심사 매칭 상위 n명 |
| n+m명 이상 | 매칭 i명 + 무작위 j명 |

### 예시 (n=5)
| 그룹 크기 | m=10, i=3, j=2 | 결과 |
|-----------|----------------|------|
| 3명 | 전원 | 3명 |
| 8명 | 매칭 상위 5명 | 5명 |
| 20명 | 매칭 3명 + 무작위 2명 | 5명 |

### 변경 파일
- `shared/types.ts`: GenerationRequest, GenerateRequest에 `feedbackCount?` 추가
- `matchPersonas.ts`: `selectFromGroup()`에 `requestedCount` 파라미터 추가, 상수 제거 → 동적 계산
- `generateRoute.ts`: `feedbackCount` 파싱 (기본 5, 범위 1~10)
- `useGeneration.ts`: GenerateParams에 `feedbackCount` 추가
- `FeedbackPage.tsx`: 동적/그룹 모드에서 슬라이더 UI (1~10명)

## 테스트 결과
- **17개 파일, 58개 테스트 전체 통과**
