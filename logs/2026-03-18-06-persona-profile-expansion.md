# 2026-03-18-06: 페르소나 구성 확장 (프로필 + 개별 파라미터)

## 요청
페르소나에 선택적 요소 추가: 연령, 성별, 관심사, 개별 파라미터.

## 수행 내용

### 타입 확장 (`shared/types.ts`)
- `GenderType`: "남성" | "여성" | "중성적"
- `INTEREST_OPTIONS`: 22개 미리 정의된 관심사 (음식, 여행, 패션, 게임 등)
- `PersonaProfile`: age?(10~80), gender?, interests?
- `PersonaParams`: positivity?, nonsense?, verbosity?, emoji?, formality? (각 0~10)
- `Persona`에 `profile?`, `params?` 필드 추가
- `CreatePersonaRequest`, `UpdatePersonaRequest`에도 반영

### 프롬프트 반영 (`promptBuilder.ts`)
- `formatPersonaProfile()`: "[댓글 작성자 프로필] 나이: 22세 / 성별: 여성 / 관심사: 음악, 여행"
- `mergeParams()`: 전역 생성 파라미터 + 페르소나 개별 파라미터 병합 (개별이 우선)

### 폼 UI (`PersonaForm.tsx`)
- 프로필 섹션: 나이(number input), 성별(드롭다운), 관심사(태그 토글 22개)
- 개별 파라미터 섹션: 체크박스로 활성화 → 슬라이더로 값 조절
  - 체크 해제 시 해당 파라미터는 전역 값 사용

### 목록 UI (`PersonaList.tsx`)
- 카드에 나이/성별 태그 표시
- 관심사 태그 목록 (녹색 계열)

### 기존 데이터 업데이트
- `data/personas/personality.json`: 5개 기존 페르소나에 profile/params 예시 추가

## 테스트 결과
- **17개 파일, 58개 테스트 전체 통과**
- TypeScript 컴파일 에러 없음
