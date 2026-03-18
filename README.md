# AI 다중 페르소나 SNS 피드백 생성기

SNS 게시글(텍스트+이미지)에 대해 다양한 페르소나의 피드백/댓글을 생성하는 로컬 AI 시스템입니다.

502개의 다차원적 페르소나가 각자의 성격, 나이, 성별, 관심사, 말투로 게시글에 반응합니다.
30만 건의 실제 한국어 대화 데이터를 RAG로 활용하여 자연스러운 댓글을 생성합니다.

## 주요 기능

- **피드백 생성**: 게시글 입력 → 페르소나 선택 → AI가 각 페르소나 스타일로 댓글 생성
- **3가지 선택 모드**: 동적 선택(관심사 자동 매칭) / 그룹 선택 / 직접 선택
- **502개 페르소나**: 10대~70대, 긍정~극부정, 전문가~트롤까지 다양한 인간군상
- **48개 그룹**: 게임 커뮤니티, 동창회, 직장 동기, 지역 주민 등
- **생성 파라미터**: 긍정 레벨, 헛소리 레벨, 길이, 이모지, 격식 조절
- **페르소나 CRUD**: 웹에서 페르소나 추가/수정/삭제, 그룹 관리
- **RAG**: 30만 건 한국어 대화 벡터 DB로 자연스러운 말투 참조

## 시스템 요구사항

| 항목 | 최소 | 권장 |
|------|------|------|
| RAM | 16GB | 48GB+ |
| CPU | 8코어 | 16코어 |
| 디스크 | 20GB | 30GB |
| GPU | 불필요 (CPU 추론) | CUDA GPU (선택) |
| Node.js | 18+ | 20+ |
| Python | 3.10+ (벡터 빌드 시) | 3.12+ |

## 설치 및 실행

### 1. 클론 및 의존성 설치

```bash
git clone https://github.com/parkrye/AIProejct-IWannaGetFeedbacks.git
cd AIProejct-IWannaGetFeedbacks
npm install
```

### 2. LLM 모델 다운로드

Qwen2.5-14B-Instruct GGUF 모델을 `models/` 디렉터리에 배치합니다.

```bash
# huggingface-hub 설치 (최초 1회)
pip install huggingface-hub

# 모델 다운로드 (~8.4GB, 3개 분할 파일)
python -c "
from huggingface_hub import hf_hub_download
files = [
    'qwen2.5-14b-instruct-q4_k_m-00001-of-00003.gguf',
    'qwen2.5-14b-instruct-q4_k_m-00002-of-00003.gguf',
    'qwen2.5-14b-instruct-q4_k_m-00003-of-00003.gguf',
]
for f in files:
    print(f'Downloading {f}...')
    hf_hub_download('Qwen/Qwen2.5-14B-Instruct-GGUF', f, local_dir='./models')
print('Done!')
"
```

> 더 가벼운 모델을 원하면 `Qwen2.5-7B-Instruct` GGUF를 사용하고 `data/config/model.json`의 `modelPath`를 수정하세요.

### 3. RAG 벡터 스토어 빌드 (선택)

한국어 대화 데이터셋을 벡터로 변환하여 피드백 품질을 높입니다.
데이터셋은 [AI Hub](https://aihub.or.kr/)에서 다운로드할 수 있습니다.

```bash
# SNS 대화 데이터 (297번 데이터셋)
npm run build-vectors -- sns-dialogue "다운로드경로/VL"

# 문화/게임 용어 데이터 (160번 데이터셋)
npm run build-vectors -- culture-usage "다운로드경로/VL" --append

# 한국어 멀티세션 대화 (141번 데이터셋)
npm run build-vectors -- multi-session "다운로드경로/02.라벨링데이터" --append

# 온라인 구어체 말뭉치 (031번 데이터셋, 카테고리별 5000건 샘플링)
npm run build-vectors -- online-colloquial "다운로드경로/TL1" --append
```

빌드 결과는 `data/vector-store/dialogues.bin`에 저장됩니다.

> 벡터 스토어가 없어도 실행은 가능합니다. RAG가 비활성화되어 기본 프롬프트만으로 생성됩니다.

### 4. 실행

**Windows:**
```bash
start.bat
```

**CLI:**
```bash
# 터미널 1: 백엔드 서버
npm run server

# 터미널 2: 프론트엔드
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 사용법

### 피드백 페이지 (`/`)

1. 게시글 텍스트를 입력합니다
2. 선택 모드를 고릅니다:
   - **동적 선택**: 게시글 내용과 관심사가 일치하는 페르소나가 자동 선택됩니다
   - **그룹 선택**: 미리 만들어둔 페르소나 그룹을 선택합니다
   - **직접 선택**: 원하는 페르소나를 직접 고릅니다
3. 피드백 인원(1~10명)을 조절합니다
4. 생성 파라미터를 원하는 대로 조절합니다
5. "피드백 생성" 버튼을 누르면 각 페르소나가 댓글을 생성합니다

### 페르소나 페이지 (`/personas`)

페르소나를 추가/수정/삭제할 수 있습니다. 각 페르소나는 다음 속성을 가집니다:
- 이름, 톤, 감정 경향, 격식
- 프로필: 나이(10~80), 성별, 관심사
- 개별 파라미터: 전역 파라미터를 페르소나별로 오버라이드
- 성격 설명, 예시 패턴

### 그룹 페이지 (`/groups`)

페르소나 그룹을 관리합니다. 그룹을 만들고 원하는 페르소나를 추가할 수 있습니다.

## 프로젝트 구조

```
src/
  domains/
    document-input/       # 게시글 파싱/검증
    image-analysis/       # MediaPipe 이미지 분류 (브라우저)
    text-analysis/        # 키워드/감정 추출 (서버)
    persona/              # 페르소나 레지스트리 + 매칭
    persona-group/        # 페르소나 그룹 관리
    generation/           # 프롬프트 빌더 + LLM 엔진
    feedback-data/        # few-shot 예시 관리
    rag/                  # RAG 벡터 스토어 + 검색
  server/                 # Express API 서버
  ui/                     # React 프론트엔드
    pages/                # 피드백/페르소나/그룹 페이지
    components/           # UI 컴포넌트
    hooks/                # React 훅
data/
  personas/               # 페르소나 JSON (502개)
  persona-groups/         # 그룹 JSON (48개)
  config/                 # 모델 설정, 프롬프트 템플릿
  vector-store/           # RAG 벡터 바이너리 (빌드 필요)
models/                   # GGUF 모델 (다운로드 필요)
scripts/                  # 벡터 빌드 스크립트
```

## 지원 데이터 소스

| 소스 타입 | 설명 | 빌드 명령어 |
|-----------|------|------------|
| `sns-dialogue` | SNS 대화 (파일당 1건) | `npm run build-vectors -- sns-dialogue <경로>` |
| `culture-usage` | 문화/게임 용례 (배열) | `npm run build-vectors -- culture-usage <경로>` |
| `culture-def` | 문화/게임 용어 정의 | `npm run build-vectors -- culture-def <경로>` |
| `multi-session` | 멀티세션 대화 | `npm run build-vectors -- multi-session <경로>` |
| `online-colloquial` | 온라인 구어체 (샘플링) | `npm run build-vectors -- online-colloquial <경로>` |

`--append` 플래그로 기존 벡터 스토어에 추가 가능. `--sample-per-category=N`으로 샘플 수 조정 가능.

## 기술 스택

- **프론트엔드**: React + TypeScript + Vite + react-router-dom
- **백엔드**: Express
- **LLM**: node-llama-cpp + Qwen2.5-14B-Instruct (CPU 추론)
- **이미지 분석**: Google MediaPipe (브라우저)
- **RAG 임베딩**: @huggingface/transformers + multilingual-e5-small
- **테스트**: vitest + @testing-library/react + supertest

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 프론트엔드 개발 서버 |
| `npm run server` | 백엔드 API 서버 |
| `npm run test` | 전체 테스트 실행 |
| `npm run build-vectors` | 벡터 스토어 빌드 |
| `npm run build` | 프로덕션 빌드 |
| `npm run format` | 코드 포맷팅 |

## 라이선스

MIT
