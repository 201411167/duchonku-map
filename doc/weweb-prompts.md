# WeWeb Pin 기능 - 새 프롬프트 (v2)

> **변경된 방향**: 홈 페이지 지도 위에서 pin을 추가하는 방식 대신,
> **별도의 Admin 페이지**에서 폼으로 pin을 관리하는 구조로 변경합니다.
>
> 아래 프롬프트를 WeWeb에서 **순서대로** 사용하세요.

---

## 프롬프트 1: 홈 페이지 정리 + pins 컬렉션 생성 + 기본 워크플로우

```
홈 페이지를 정리하고 기본 기능을 복원해야 해.

## 현재 상태
- 워크플로우가 모두 삭제되어 0개임
- collections 배열이 비어 있어서 지도에 마커가 표시되지 않음
- 핀 등록 관련 UI 요소(Pin Registration Form, Add Pin Button 등)가 남아 있지만 동작하지 않음
- 이 요소들은 별도 Admin 페이지로 이동할 예정이므로 홈 페이지에서는 제거해야 함

## 수정 사항

### 1. Supabase pins 컬렉션 생성
collections 배열이 비어 있어. 아래 컬렉션을 만들어줘.
Supabase 플러그인(f9ef41c3-1c53-4857-855b-f2f6a40b7186) 사용, Auto-fetch 활성화.

- 테이블: pins
- 필드: id, name, description, lat, lng, category, image_url, created_by, created_at
- 정렬: created_at DESC

### 2. 지도 마커를 pins 컬렉션에 바인딩
Seoul Map 컴포넌트(0ff3dcfa-3fd7-43e4-a511-7341814fc2be)의 markers 속성을
위에서 만든 pins 컬렉션의 data에 바인딩해줘.
- latField: "lat"
- lngField: "lng"
- nameField: "name"

### 3. 불필요한 변수 삭제
아래 변수들은 Admin 페이지에서 관리할 것이므로 홈 페이지에서 삭제:
- mapPins (ab814f74-75bb-4643-a513-9816d65fc3bc) — 컬렉션에 직접 바인딩하므로 불필요
- addPinMode (1512b3a9-c22c-4833-85d2-3b3008650240) — Admin 페이지로 이동
- showPinForm (32cc7900-e148-445b-9095-a5e0a6483349) — Admin 페이지로 이동
- clickedLat (768616e2-087f-442b-8a5e-24b34ab0c48d) — Admin 페이지로 이동
- clickedLng (ca6f787b-0b13-4536-a5bf-87793a3a4592) — Admin 페이지로 이동

유지할 변수:
- isAdmin (6a3c25f9-5eda-4390-a410-a8f0c767b7d7)
- selectedPin (9bab2dac-52d9-4f9b-8d06-fd300998f4aa)
- showPinDetail (017955ef-bb2f-4bc4-ab85-161bf9c81e50)

### 4. 불필요한 UI 요소 삭제
홈 페이지에서 아래 핀 등록 관련 요소들을 모두 삭제:
- Add Pin Button (f1bccc83-b4e6-4ea0-934e-41a1f2202e1b) 과 하위 요소들
- Add Pin Icon (a436301a-5823-44a5-af10-8c6b841b8a06)
- Pin Registration Form (5479910b-7a5d-4b65-b057-33036cad88ee) 과 하위 요소 전체:
  - Pin Form Overlay, Pin Form Header, Pin Form Title, Pin Form Content
  - Pin Form Fields, Pin Form Actions, Pin Form Error, Pin Form Coordinates
  - Pin Name Input/Group/Label, Pin Description Input/Group/Label
  - Pin Category Select/Group/Label, Pin Image Input/Group/Label
  - Pin Form Save, Pin Form Cancel

Pin Detail Panel(99c39640-f835-4530-bbb5-657cc453a4af)과 하위 요소는 유지해줘.

### 5. onload 워크플로우: Handle OAuth Callback
페이지 로드 시 실행되는 워크플로우를 만들어줘:
1. URL 해시에 access_token이 포함되어 있는지 확인 (window.location.hash.includes('access_token'))
2. 있으면 → Supabase Auth 플러그인(1fa0dd68-5069-436c-9a7d-3b54c340f1fa)의 fetchUser 액션 실행
3. 그 후 URL 해시를 제거: history.replaceState(null, '', window.location.pathname)

### 6. onload 워크플로우: Check Admin Role
admin 체크 전용 워크플로우를 만들어줘. (Handle OAuth Callback 이후에 실행)

로직:
1. isAdmin = false (초기화)
2. 인증 여부 확인: pluginVariables['1fa0dd68-5069-436c-9a7d-3b54c340f1fa']['isAuthenticated']
3. 인증 안 됐으면 → 종료
4. 인증됐으면 → Supabase 플러그인(f9ef41c3-1c53-4857-855b-f2f6a40b7186)의 select 액션:
   - 테이블: users
   - 필드: id, role_id
   - 필터: id = pluginVariables['1fa0dd68-5069-436c-9a7d-3b54c340f1fa']['user'].id
   (주의: users 테이블의 PK는 "id"이고, auth.users.id와 같은 값. "user_id" 아님!)
5. 결과가 있고 role_id가 있으면 → Supabase select:
   - 테이블: roles
   - 필드: id, name
   - 필터: id = 위에서 가져온 role_id
6. role의 name이 'admin'이면 → isAdmin = true
```

---

## 프롬프트 2: 헤더 네비게이션 정리 + Admin 링크 추가

```
헤더의 네비게이션 메뉴를 정리해줘.

## 현재 상태
헤더에 Navigation Menu(5f36bccd-1085-490e-bc07-8c6019b86585) 안에
Home Link, About Link, Contact Link가 있는데, 모두 연결된 페이지가 없어서 동작하지 않아.

## 수정 사항

### 1. 기존 메뉴 링크 삭제
아래 3개 링크를 모두 삭제해줘:
- Home Link (5c59a1d4-5640-4a09-ab19-be116635cca7)
- About Link (c378dec2-977c-4388-a67a-4ca7b5916877)
- Contact Link (c0ebb639-2dcd-40f7-8a90-1bd14a73d795)

### 2. Admin 링크 추가
Navigation Menu 안에 새 링크를 하나 추가해줘:
- 텍스트: "Pin 관리"
- 클릭 시: /admin 페이지로 이동 (navigate)
- 표시 조건: isAdmin 변수(6a3c25f9-5eda-4390-a410-a8f0c767b7d7)가 true일 때만 표시
- 스타일: 기존 메뉴 링크와 동일한 스타일
```

---

## 프롬프트 3: Admin 페이지 생성 (Pin 관리)

```
Admin 전용 Pin 관리 페이지를 새로 만들어줘.

## 페이지 설정
- 페이지 이름: "Admin - Pin 관리"
- URL path: /admin
- Private 페이지: 로그인한 유저만 접근 가능하도록 설정

## 페이지 구조

### 헤더
홈 페이지와 동일한 헤더 섹션을 사용해줘 (같은 로고, 네비게이션, 프로필 영역).

### 메인 콘텐츠
아래 2개 영역으로 구성:

#### (A) Pin 등록 폼 (왼쪽 또는 상단)
"새 Pin 등록" 제목과 함께 입력 폼:
- 이름 (text input, 필수)
- 설명 (textarea, 선택)
- 위도 (number input, 필수) — lat
- 경도 (number input, 필수) — lng
- 카테고리 (select dropdown: general / food / cafe / shop / landmark, 기본값 general)
- 이미지 URL (text input, 선택)
- "저장" 버튼, "초기화" 버튼

저장 워크플로우:
1. 이름, 위도, 경도가 비어있으면 에러 메시지 표시하고 중단
2. Supabase 플러그인(f9ef41c3-1c53-4857-855b-f2f6a40b7186)의 insert 액션:
   - 테이블: pins
   - data:
     - name: 입력값
     - description: 입력값
     - lat: 입력값
     - lng: 입력값
     - category: 선택값
     - image_url: 입력값
     - created_by: pluginVariables['1fa0dd68-5069-436c-9a7d-3b54c340f1fa']['user'].id
3. 성공 후:
   - pins 컬렉션 새로고침 (fetch-collection)
   - 모든 입력값 초기화
   - 성공 알림 표시

초기화 버튼: 모든 입력 필드를 기본값으로 리셋

#### (B) Pin 목록 (오른쪽 또는 하단)
pins 컬렉션의 데이터를 테이블 또는 카드 리스트로 표시:
- 표시 정보: 이름, 카테고리, 위도, 경도, 등록일
- 각 항목에 "삭제" 버튼 (빨간색)

삭제 워크플로우:
1. 확인 다이얼로그: "이 Pin을 삭제하시겠습니까?"
2. 확인 시 Supabase 플러그인의 delete 액션:
   - 테이블: pins
   - primaryData: { id: 해당 pin의 id }
3. 성공 후 pins 컬렉션 새로고침

## 컬렉션
이 페이지에도 pins 컬렉션이 필요해.
Supabase 플러그인(f9ef41c3-1c53-4857-855b-f2f6a40b7186) 사용, Auto-fetch 활성화.
- 테이블: pins
- 필드: id, name, description, lat, lng, category, image_url, created_by, created_at
- 정렬: created_at DESC

## 페이지 onload 워크플로우

### Handle OAuth Callback (홈 페이지와 동일)
1. URL 해시에 access_token 포함 여부 확인
2. 있으면 Supabase Auth fetchUser 실행
3. URL 해시 제거

### Check Admin & Redirect
1. 인증 여부 확인
2. 인증됐으면 → users 테이블에서 현재 유저의 role_id 조회 → roles 테이블에서 name 확인
3. admin이 아니면 → 홈으로 리다이렉트 (window.location.href = '/')
```

---

## 프롬프트 4: 홈 페이지 마커 클릭 → 상세 패널

```
홈 페이지의 지도에서 마커를 클릭하면 상세 정보를 보여주는 기능을 구현해줘.

## 기존 변수 사용
- selectedPin (9bab2dac-52d9-4f9b-8d06-fd300998f4aa) — 이미 존재
- showPinDetail (017955ef-bb2f-4bc4-ab85-161bf9c81e50) — 이미 존재

## marker:click 이벤트 핸들러
Seoul Map(0ff3dcfa-3fd7-43e4-a511-7341814fc2be)의 marker:click 이벤트에
워크플로우를 연결해줘:
- selectedPin = event.marker.rawData (클릭한 마커의 원본 데이터)
- showPinDetail = true

## Pin Detail Panel 연결
Pin Detail Panel(99c39640-f835-4530-bbb5-657cc453a4af)이 이미 존재해.
아래 바인딩을 확인하고 연결해줘:

- 패널 표시 조건: showPinDetail 변수가 true일 때만 표시
- Pin Detail Name (18cb215a-...): selectedPin.name 바인딩
- Pin Detail Description (a85c37bf-...): selectedPin.description 바인딩 (없으면 "설명 없음")
- Pin Detail Category Text (593f9c6a-...): selectedPin.category 바인딩
- Pin Detail Coordinates (e3da883a-...): selectedPin.lat, selectedPin.lng 표시

- Pin Detail Close 버튼(064ac384-...): 클릭 시 showPinDetail = false
- Pin Detail Delete 버튼(fe2494b7-...):
  - 표시 조건: isAdmin(6a3c25f9-...) 변수가 true일 때만
  - 클릭 워크플로우:
    1. 확인 다이얼로그: "이 Pin을 삭제하시겠습니까?"
    2. 확인 시 Supabase(f9ef41c3-...) delete 액션:
       - 테이블: pins
       - primaryData: { id: selectedPin.id }
    3. 성공 후: pins 컬렉션 새로고침 + showPinDetail = false

## map:click 이벤트
Seoul Map의 map:click 이벤트에서 기존 로그를 제거하고,
showPinDetail이 true이면 false로 변경하는 로직만 넣어줘.
(지도 빈 곳 클릭 시 상세 패널 닫기)
```

---

## 참고 정보

| 항목 | 값 |
|------|-----|
| Supabase Plugin ID | `f9ef41c3-1c53-4857-855b-f2f6a40b7186` |
| Supabase Auth Plugin ID | `1fa0dd68-5069-436c-9a7d-3b54c340f1fa` |
| 홈 페이지 ID | `f4beb1fc-8d1c-41bc-8b03-6330d9c37c9f` |
| 지도 컴포넌트 | Seoul Map (`0ff3dcfa-3fd7-43e4-a511-7341814fc2be`) |
| 지도 이벤트 | `map:click` → event.latLng, `marker:click` → event.marker.rawData |
| 인증 상태 | `pluginVariables['1fa0dd68-5069-436c-9a7d-3b54c340f1fa']['isAuthenticated']` |
| 현재 유저 ID | `pluginVariables['1fa0dd68-5069-436c-9a7d-3b54c340f1fa']['user'].id` |
| isAdmin 변수 | `6a3c25f9-5eda-4390-a410-a8f0c767b7d7` |
| selectedPin 변수 | `9bab2dac-52d9-4f9b-8d06-fd300998f4aa` |
| showPinDetail 변수 | `017955ef-bb2f-4bc4-ab85-161bf9c81e50` |
| DB: users 테이블 | id (PK, =auth.users.id), email, full_name, role_id (FK→roles.id) |
| DB: roles 테이블 | id (PK), name |
| DB: pins 테이블 | id, name, description, lat, lng, category, image_url, created_by, created_at |
