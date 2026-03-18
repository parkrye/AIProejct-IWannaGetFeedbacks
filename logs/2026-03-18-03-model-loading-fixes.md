# 2026-03-18-03: 모델 로딩 수정

## 요청
서버 실행 시 모델 로딩 실패 해결 + 로딩 프로그래스 바 표시.

## 수행 내용

### GPU → CPU 전환
- 원인: GTX 1660 SUPER(6GB VRAM)에 14B 모델 + contextSize 4096 → `InsufficientMemoryError`
- 해결: `getLlama({ gpu: false })` — CPU 전용 추론으로 전환
- `data/config/model.json`: contextSize 4096 → 2048

### 모델 경로 해석
- 원인: `existsSync("./models/...")` — 상대 경로가 process.cwd() 기준으로 해석 안됨
- 해결: `join(process.cwd(), modelConfig.modelPath)` 절대 경로 변환

### 비동기 모델 로딩
- 서버 `listen` 후 모델 백그라운드 로딩 (API 즉시 응답 가능)
- 모델 로딩 완료 전 피드백 요청 시 에러 메시지 표시

### 모델 로딩 프로그래스 바
- `node-llama-cpp` `onLoadProgress` 콜백 활용
- 5% 단위로 `[=====     ] 50%` 형태 콘솔 출력

### start.bat 수정
- 한글 인코딩 깨짐: `chcp 65001` + 영문 메시지로 변경
- 502 Bad Gateway: curl 폴링으로 백엔드 준비 대기 후 프론트엔드 시작
- start.sh 제거 → start.bat 통일 (서버 로그 별도 CMD 창 표시)
