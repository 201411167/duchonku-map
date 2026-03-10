# Duchonku Map - 지도 기반 핀 관리 웹 애플리케이션

## 프로젝트 개요
서울 지역 지도 위에 관심 장소(Pin)를 표시하고 관리하는 웹 애플리케이션.
- 일반 사용자: 지도에서 핀을 조회하고, 마커 클릭 시 상세 정보 확인
- 어드민 사용자: 핀 추가/삭제 가능

## 기술 스택
- 프론트엔드: React (또는 Next.js)
- 백엔드/DB: Supabase (기존 프로젝트와 동일한 인스턴스 연결)
- 지도: Google Maps JavaScript API
- 인증: Supabase Auth (이메일/비밀번호 + Google OAuth)

## Supabase 연결 정보
- Project URL: https://jhuvztomhjeebqygxddq.supabase.co
- Anon Key: (환경변수 SUPABASE_ANON_KEY로 설정)

## DB 스키마 (이미 Supabase에 생성되어 있음)

### roles 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 역할 ID |
| name | varchar | 역할명 ('admin' 등) |

### users 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | auth.users.id와 동일 |
| email | varchar | 이메일 |
| full_name | varchar | 이름 |
| role_id | uuid (FK → roles.id) | 역할 참조 |

### pins 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 핀 ID |
| name | varchar | 핀 이름 (필수) |
| description | text | 설명 (선택) |
| lat | numeric | 위도 (필수) |
| lng | numeric | 경도 (필수) |
| category | varchar | 카테고리 (general/food/cafe/shop/landmark) |
| image_url | varchar | 이미지 URL (선택) |
| created_by | uuid (FK → auth.users.id) | 등록자 |
| created_at | timestamp | 등록일시 |

## 페이지 구성

### 1. 로그인 페이지 (/login)
- 이메일 + 비밀번호 로그인 폼
- Google OAuth 로그인 버튼
- 로그인 성공 시 홈(/)으로 리다이렉트
- 로그인 실패 시 에러 메시지 표시

### 2. 홈 페이지 (/) - 지도 뷰
- **헤더**: 로고("Duchonku Map"), 로그인/로그아웃 버튼. 어드민인 경우 "Pin 관리" 링크 표시
- **지도 영역**: 화면 전체를 차지하는 Google Maps
  - 기본 중심: 서울 (lat: 37.5665, lng: 126.9780)
  - 기본 줌: 12
  - pins 테이블의 모든 데이터를 마커로 표시
- **마커 클릭 → 상세 패널**:
  - 오른쪽 또는 하단에 슬라이드 패널로 표시
  - 핀 이름, 설명(없으면 "설명 없음"), 카테고리, 좌표 표시
  - 닫기 버튼
  - 어드민인 경우 삭제 버튼 (확인 다이얼로그 후 삭제 → pins 목록 새로고침)
- **지도 빈 곳 클릭 시**: 상세 패널 닫기

### 3. 핀 관리 페이지 (/admin) - 어드민 전용
- 어드민이 아닌 사용자가 접근 시 홈으로 리다이렉트
- **핀 등록 폼**:
  - 이름 (text, 필수)
  - 설명 (textarea, 선택)
  - 위도 (number, 필수)
  - 경도 (number, 필수)
  - 카테고리 (select: general/food/cafe/shop/landmark, 기본값 general)
  - 이미지 URL (text, 선택)
  - 저장 버튼: 유효성 검사 후 Supabase insert → 목록 새로고침 → 폼 초기화
  - 초기화 버튼
- **핀 목록**: 테이블 형태로 이름, 카테고리, 위도, 경도, 등록일 표시. 각 행에 삭제 버튼

## 어드민 판별 로직
1. 로그인한 사용자의 id로 users 테이블에서 role_id 조회
2. 해당 role_id로 roles 테이블에서 name 조회
3. name이 'admin'이면 어드민

## 인증 흐름
1. 페이지 로드 시 Supabase 세션 확인
2. URL 해시에 access_token이 있으면 (OAuth 콜백) 세션 설정 후 해시 제거
3. 미인증 사용자가 /admin 접근 시 /login으로 리다이렉트
4. 로그인 성공 시 users 테이블에 사용자 정보 upsert (id, email, full_name)

## 스타일
- 깔끔하고 모던한 UI
- 반응형 (모바일 대응)
- 다크/라이트 테마 지원 (localStorage 'ww-app-theme' 키 사용)
