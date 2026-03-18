# 2026-03-18-11: 페르소나 그룹 선발 로직 구현

## 요청
그룹 모드 피드백 생성 시 구성원 수에 따른 선발 로직 적용.

## 수행 내용

### 선발 규칙
| 그룹 크기 | 선발 방식 | 결과 |
|-----------|----------|------|
| 5명 이하 | 전원 | 전체 구성원 |
| 5~10명 | 관심사 일치도 상위 5명 | 5명 |
| 10명 초과 | 관심사 상위 4명 + 무작위 4명 | 8명 |

### 구현
- `matchPersonas.ts`에 `selectFromGroup()` 함수 추가
  - 기존 `scorePersonas()` 함수를 재사용하여 관심사 매칭 점수 계산
  - 10명 초과 시 매칭 상위자 제외 후 나머지에서 무작위 셔플로 추가 선발
- `generateRoute.ts`: `selectionMode === "group"` 분기 추가
  - 클라이언트가 보낸 personaIds로 전체 그룹 멤버 조회
  - `selectFromGroup()`으로 실제 생성 대상 선발

### 상수 정의
```
GROUP_THRESHOLD_SMALL = 5
GROUP_THRESHOLD_MEDIUM = 10
GROUP_SELECT_MEDIUM = 5
GROUP_SELECT_LARGE_MATCHED = 4
GROUP_SELECT_LARGE_RANDOM = 4
```

## 테스트 결과
- **17개 파일, 58개 테스트 전체 통과**
- TypeScript 컴파일 에러 없음
