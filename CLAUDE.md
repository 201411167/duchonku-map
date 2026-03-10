# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WeWeb 기반으로 빌드된 Vue 3 프론트엔드 애플리케이션(Duchonku Map). WeWeb 플랫폼에서 export된 코드를 기반으로 하며, Supabase를 백엔드로 사용한다. 지도 위에 Pin을 표시하고 관리하는 기능이 핵심이다.

## Commands

- `npm run serve` - 개발 서버 실행 (Vite)
- `npm run build` - 프로덕션 빌드
- `npm run postbuild` - 빌드 후 컬렉션 페이지 생성 처리

테스트 프레임워크는 설정되어 있지 않다.

## Architecture

### 핵심 구조

- **`src/_front/`** - Vue 앱 진입점. `main.js`에서 앱 초기화, `router.js`에서 라우팅 설정
- **`src/wwLib/`** - 전역 싱글톤(`window.wwLib`)으로 노출되는 코어 라이브러리. 18개 서비스 제공 (App, Auth, Lang, Formula, Element, Workflow, Collection, Variable, WebsiteData, PageHelper, PluginHelper 등)
- **`src/_common/`** - 공유 유틸리티, composable, Pinia 스토어(keyboard, log, scroll)
- **`src/store/`** - Vuex 스토어 모듈 (websiteData, front, data, libraries)
- **`src/pinia/`** - Pinia 스토어 (variables, popup, icons, componentBases)
- **`src/components/elements/`** - UUID 기반 이름의 커스텀 Vue 엘리먼트. 각 디렉토리에 `ww-config.js`와 `AI.md`(컴포넌트 사용법 문서) 포함
- **`src/components/plugins/`** - 통합 플러그인 (Supabase, Supabase Auth, Google, REST API)
- **`src/components/sections/`** - 페이지 섹션 컴포넌트
- **`src/pages/`** - 페이지별 엔트리 파일. 해당 페이지에서 사용하는 엘리먼트/섹션을 동적 import하여 `app.component()`로 등록

### 페이지 구조

| 페이지 | ID | 경로 |
|--------|-----|------|
| Home | `f4beb1fc-8d1c-41bc-8b03-6330d9c37c9f` | `/` (또는 `/home`) |
| Login | `0428958a-8555-487f-8454-77503d8e2d7c` | `/login` |

페이지 설정은 `vite.config.js`의 `pages` 객체와 `router.js`의 `window.wwg_designInfo`에 정의된다.

### 상태 관리

Vuex(레거시)와 Pinia(신규)를 동시에 사용한다. Vuex는 페이지 데이터·디자인 정보·언어 설정 등 핵심 상태를, Pinia는 변수·팝업·아이콘 등을 관리한다.

### 데이터 흐름 및 초기화

1. `main.js` → Vue 앱 생성, `window.wwLib` 할당, Pinia/Vuex/플러그인 등록
2. `wwLib.initFront()` → 서비스 초기화, 플러그인 등록
3. 라우터 `beforeEnter` → 플러그인 초기화 → 인증 체크 → 페이지 데이터 fetch → `src/pages/{pageId}.js`로 동적 컴포넌트 import
4. 라우터 `afterEach` → `initializeData()`로 페이지 데이터 초기화

### 이벤트 시스템

`tiny-emitter` 기반 글로벌 이벤트 버스 (`wwLib.$on`, `$emit`, `$off`). 워크플로우는 `onload-app`, `page-unload` 등의 라이프사이클 훅을 지원하며, 루프·조건·필터 등 메타 액션을 포함한다.

### 플러그인 ID 매핑

| 플러그인 | ID | 네임스페이스 |
|---------|-----|------------|
| Supabase | `f9ef41c3-1c53-4857-855b-f2f6a40b7186` | `supabase` |
| Supabase Auth | `1fa0dd68-5069-436c-9a7d-3b54c340f1fa` | `supabaseAuth` |
| Google | `cabb43dd-6161-4140-8ebf-03b6fb045a0b` | `google` |
| REST API | `2bd1c688-31c5-443e-ae25-59aa5b6431fb` | `restApi` |

각 플러그인은 `src/components/plugins/plugin-{id}/src/wwPlugin.js`에 구현되어 있으며, 설정은 `plugins-settings.json`에서 로드된다.

### 빌드 시스템

Vite + Handlebars 템플릿. `vite.config.js`에서 `pages` 객체를 순회하며 `template.html`을 Handlebars로 컴파일하여 페이지별 HTML을 생성한다. `@`는 `./src`로 alias 설정되어 있다. Node polyfill(events, stream, string_decoder)을 포함한다.

### 환경 변수

`.env`에 WeWeb CDN/API/Preview URL 설정. `VITE_APP_` 접두사 사용. 실제 Supabase 자격증명은 `plugins-settings.json`에 있다.

### 코드 패턴

- `/* wwFront:start */` / `/* wwFront:end */` 주석은 프론트엔드 전용 코드 블록을 표시 (WeWeb 에디터 vs 프론트엔드 배포 구분). 이 블록 밖의 코드는 에디터와 프론트 양쪽에서 실행된다.
- 컴포넌트/엘리먼트는 UUID로 식별되며, Vue에서 `wwobject-{uuid}` 이름으로 등록된다.
- 각 엘리먼트의 `AI.md`를 읽으면 해당 컴포넌트의 props, events, slots 사용법을 확인할 수 있다.
- 반응형 디자인은 디바이스 breakpoint 시스템으로 처리되며, CSS 커스텀 프로퍼티로 디자인 토큰 관리
- 다크/라이트 테마는 `localStorage`의 `ww-app-theme` 값으로 결정. `main.js`에서 앱 초기화 전에 `ww-app-theme-dark` 클래스를 설정하여 깜빡임 방지
- `window._`에 lodash의 `isEqual`, `isEmpty`, `cloneDeep`, `get`, `set`, `merge`가 전역으로 노출됨
- `window.axios`에 axios 인스턴스가 전역으로 노출됨

### DB 스키마 (Supabase)

| 테이블 | 주요 필드 |
|--------|----------|
| `pins` | id, name, description, lat, lng, category, image_url, created_by, created_at |
| `users` | id (PK, =auth.users.id), email, full_name, role_id (FK→roles.id) |
| `roles` | id (PK), name |
