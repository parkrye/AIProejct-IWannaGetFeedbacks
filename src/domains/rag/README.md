# rag

RAG (Retrieval-Augmented Generation) 도메인.

## 책임
- 외부 데이터셋을 공통 스키마로 정규화 (어댑터 패턴)
- 텍스트 임베딩 생성 (@huggingface/transformers, multilingual-e5-small)
- 인메모리 벡터 저장소 + 바이너리 파일 영속화
- 2단계 검색: 메타데이터 필터 → 코사인 유사도

## 데이터 흐름
```
원본 데이터 (JSON) → 어댑터 → NormalizedDialogue → 임베딩 → VectorEntry → 바이너리 파일
서버 시작 → 바이너리 로딩 → 검색 쿼리 → 유사 대화 반환 → 프롬프트 주입
```

## 의존성
- `@huggingface/transformers` (임베딩)
- `shared/types.ts` 미참조 (자체 타입 사용, 도메인 독립성)
