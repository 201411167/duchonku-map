---
name: gcloud
description: Google Cloud 프로젝트 관리. API 활성화/비활성화, API 키 관리, OAuth 설정, 서비스 계정 관리 등.
argument-hint: [작업 설명] (예: "Maps API 활성화", "API 키 목록 조회")
allowed-tools: Bash
---

# Google Cloud 프로젝트 관리

gcloud CLI를 통해 Google Cloud 프로젝트를 관리한다.

## 기본 정보

- gcloud 경로: `/opt/homebrew/share/google-cloud-sdk/bin/gcloud`
- 인증 계정: `rlarlejr103@gmail.com`

## 접근 가능한 프로젝트

| PROJECT_ID | NAME |
|-----------|------|
| aesthetic-guild-233503 | My Project |
| brave-octane-265508 | springboot-oauth |
| capstone-a7529 | capstone |
| cosmic-bonfire-232405 | My Project |
| fcm-test-604c4 | fcm-test |
| for-coder | for coder |
| gen-lang-client-0994360297 | Default Gemini Project |
| heartsignal | HeartSignal |
| olive-280409 | olive |
| webstudy-281612 | webstudy |

## 자주 쓰는 명령

### 프로젝트 설정
```bash
/opt/homebrew/share/google-cloud-sdk/bin/gcloud config set project {PROJECT_ID}
```

### API 활성화
```bash
/opt/homebrew/share/google-cloud-sdk/bin/gcloud services enable {API_NAME} --project={PROJECT_ID}
```

### 활성화된 API 목록
```bash
/opt/homebrew/share/google-cloud-sdk/bin/gcloud services list --enabled --project={PROJECT_ID}
```

### API 키 목록
```bash
/opt/homebrew/share/google-cloud-sdk/bin/gcloud services api-keys list --project={PROJECT_ID}
```

### API 키 생성
```bash
/opt/homebrew/share/google-cloud-sdk/bin/gcloud services api-keys create --display-name={NAME} --project={PROJECT_ID}
```

### OAuth 동의 화면 / 사용자 인증 정보
OAuth 클라이언트 관리는 REST API를 통해 수행:
```bash
/opt/homebrew/share/google-cloud-sdk/bin/gcloud auth print-access-token
```
위 토큰으로 Google Cloud REST API 호출 가능.

## 주의사항

- gcloud 명령은 항상 전체 경로(`/opt/homebrew/share/google-cloud-sdk/bin/gcloud`)를 사용할 것
- 프로젝트를 변경하는 작업은 실행 전 사용자에게 확인할 것
- API 키 생성/삭제 등 민감한 작업은 사용자 승인 후 진행

## 작업 지시

$ARGUMENTS

위 작업을 gcloud CLI로 수행하라. 결과는 읽기 쉽게 정리하여 보여줄 것.
