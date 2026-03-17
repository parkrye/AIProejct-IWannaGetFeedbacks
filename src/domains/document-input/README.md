# document-input

SNS 게시글(텍스트 + 이미지) 파싱 및 검증 도메인.

## 책임
- 사용자 입력 검증 (텍스트/이미지 필수 여부, 길이 제한)
- 이미지 파일을 DataURL로 변환
- ParsedPost DTO 생성

## 의존성
- `shared/types.ts`만 참조
- 다른 도메인에 직접 의존하지 않음
