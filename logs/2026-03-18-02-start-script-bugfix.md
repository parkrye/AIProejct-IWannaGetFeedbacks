# 2026-03-18-02: 실행 스크립트 + 버그 수정

## 요청
서버 + 프론트엔드를 한번에 실행하는 스크립트 작성.

## 수행 내용

### 실행 스크립트
- `start.bat`: Windows 더블클릭용
- `start.sh`: CLI(bash) 실행용
  - 백엔드/프론트엔드 백그라운드 실행, `Ctrl+C`로 동시 종료
  - 백엔드 준비 대기 (curl 폴링) 후 프론트엔드 시작

### 버그 수정

#### start.bat 한글 인코딩 깨짐
- 원인: UTF-8 bat 파일을 Windows CMD(CP949)에서 실행
- 해결: `chcp 65001` 추가 + 영문 메시지로 변경

#### 502 Bad Gateway (프론트엔드 → 백엔드)
- 원인: 백엔드 준비 전에 프론트엔드가 API 호출
- 해결: curl로 백엔드 health check 후 프론트엔드 시작

#### 모델 로드 실패
- 원인: `existsSync("./models/...")` — 상대 경로가 `process.cwd()` 기준으로 해석되지 않음
- 해결: `join(process.cwd(), modelConfig.modelPath)`로 절대 경로 변환

### CLAUDE.md 복원
- Vite 스캐폴딩(`--overwrite`)으로 삭제된 `.claude/CLAUDE.md` 복원
- 기술 스택 섹션을 현재 프로젝트에 맞게 업데이트
