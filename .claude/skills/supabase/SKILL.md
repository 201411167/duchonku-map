---
name: supabase
description: Supabase 프로젝트 관리. 테이블 데이터 조회/추가/수정/삭제, 스키마 확인, RLS 정책 관리 등.
argument-hint: [작업 설명] (예: "pins 테이블 조회", "users 테이블에 데이터 추가")
allowed-tools: Bash(curl:*)
---

# Supabase 프로젝트 관리

Duchonku Map 프로젝트의 Supabase 인스턴스를 REST API로 관리한다.

## 연결 정보

- Project URL: `https://jhuvztomhjeebqygxddq.supabase.co`
- Project Ref: `jhuvztomhjeebqygxddq`
- API Base: `https://jhuvztomhjeebqygxddq.supabase.co/rest/v1`
- Service Role Key: 프로젝트 루트의 `.env.local` 파일에서 `SUPABASE_SERVICE_ROLE_KEY` 값을 읽어서 사용

## 인증 헤더

모든 요청에 아래 헤더를 포함:
```
-H "apikey: $SUPABASE_SERVICE_ROLE_KEY"
-H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
-H "Content-Type: application/json"
-H "Prefer: return=representation"
```

**주의**: 요청 전 반드시 `.env.local`에서 키를 읽어 변수에 할당한 후 사용할 것.
```bash
SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY /Users/everett.kmj/projects/study/duchonku-map/.env.local | cut -d'=' -f2)
```

## DB 스키마

### roles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 역할 ID |
| name | varchar | 역할명 ('admin', 'user') |

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | auth.users.id와 동일 |
| email | varchar | 이메일 |
| full_name | varchar | 이름 |
| avatar_url | varchar | 프로필 이미지 URL |
| updated_at | timestamp | 수정일시 |
| role_id | uuid (FK → roles.id) | 역할 참조 |

### pins
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 핀 ID |
| name | varchar | 핀 이름 |
| description | text | 설명 |
| lat | numeric | 위도 |
| lng | numeric | 경도 |
| category | varchar | 카테고리 (general/food/cafe/shop/landmark) |
| image_url | varchar | 이미지 URL |
| created_by | uuid (FK → auth.users.id) | 등록자 |
| created_at | timestamp | 등록일시 |

## API 사용법

### 조회 (SELECT)
```bash
curl -s "$API_BASE/{테이블}?select=*" -H ...
```
- 필터: `?column=eq.value`
- 정렬: `?order=column.desc`
- 제한: `?limit=10`

### 삽입 (INSERT)
```bash
curl -s -X POST "$API_BASE/{테이블}" -H ... -d '{"column":"value"}'
```

### 수정 (UPDATE)
```bash
curl -s -X PATCH "$API_BASE/{테이블}?id=eq.{값}" -H ... -d '{"column":"new_value"}'
```

### 삭제 (DELETE)
```bash
curl -s -X DELETE "$API_BASE/{테이블}?id=eq.{값}" -H ...
```

## 작업 지시

$ARGUMENTS

위 작업을 Supabase REST API로 수행하라. 결과는 읽기 쉽게 정리하여 보여줄 것.
