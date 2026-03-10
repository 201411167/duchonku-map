---
name: secret-check
description: 커밋/푸시 전 시크릿 및 API 키 유출 검증. 코드에 service_role key, OAuth secret, 비공개 API 키가 포함되어 있지 않은지 확인.
allowed-tools: Bash, Grep, Glob, Read
---

# 시크릿 유출 검증

git에 커밋/푸시되는 파일에 민감한 정보가 포함되어 있지 않은지 검증한다.

## 검증 대상 패턴

### 절대 커밋되면 안 되는 것
1. **Supabase service_role key** - JWT 토큰 중 `"role":"service_role"` 포함된 것
2. **Google OAuth client secret** - `client_secret` 값
3. **Google service account key** - JSON 형식의 `private_key` 포함 파일
4. **환경 변수 파일** - `.env.local`, `.env.production`, `.env.*.local`

### 커밋 허용되는 것 (false positive 방지)
- **Supabase anon key** - `"role":"anon"` 포함된 JWT는 공개용이므로 허용
- **Google Maps API key** (브라우저 제한이 걸린 공개 키) - 허용하되 경고
- **Supabase project URL** - 공개 정보이므로 허용
- `plugins-settings.json`의 anon key - WeWeb export 기본 포함이므로 허용

## 검증 절차

1. `git status`로 커밋 대상 파일 확인
2. staged 파일 + untracked 파일 중 git에 포함될 파일 검사
3. `.gitignore`에 민감한 파일이 제대로 제외되어 있는지 확인
4. 각 파일에서 시크릿 패턴 검색
5. 발견된 항목을 PASS / WARN / FAIL로 분류하여 보고

## 결과 형식

```
[PASS] 항목 설명
[WARN] 경고 사항 (커밋 가능하나 주의 필요)
[FAIL] 차단 사항 (반드시 수정 후 커밋)

최종 판정: OK / BLOCKED
```

## 작업 지시

$ARGUMENTS

위 검증 절차를 수행하고 결과를 보고하라.
