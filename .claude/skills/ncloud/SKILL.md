---
name: ncloud
description: Naver Cloud Platform 관리. Maps API 설정, Geocoding, 애플리케이션 관리 등.
argument-hint: [작업 설명] (예: "Maps 앱 설정 확인", "주소를 좌표로 변환")
allowed-tools: Bash(curl:*)
---

# Naver Cloud Platform 관리

Duchonku Map 프로젝트의 Naver Cloud Platform 리소스를 관리한다.

## 연결 정보

- Application 이름: `duchonku-map`
- Client ID: `4s0xqhzbzo`
- Client Secret: 프로젝트 루트의 `.env.local` 파일에서 `NCLOUD_CLIENT_SECRET` 값을 읽어서 사용 (설정된 경우)
- 등록된 Web 서비스 URL: `https://attached-assets-rlarlejr103.replit.app`, `http://localhost:5000`

## Maps API

### Web Dynamic Map
브라우저에서 사용. Client ID만으로 동작 (script 태그 또는 react-naver-maps).

### Server-side API (Geocoding, Directions 등)
서버에서 호출. Client ID + Client Secret 필요.

**인증 헤더:**
```
-H "X-NCP-APIGW-API-KEY-ID: $CLIENT_ID"
-H "X-NCP-APIGW-API-KEY: $CLIENT_SECRET"
```

### 주요 API 엔드포인트

| API | URL |
|-----|-----|
| Geocoding | `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query={주소}` |
| Reverse Geocoding | `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords={lng},{lat}&output=json` |
| Directions 5 | `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start={lng},{lat}&goal={lng},{lat}` |
| Static Map | `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?center={lng},{lat}&level=16&w=600&h=400` |

## 주의사항

- Web Dynamic Map은 Client ID만 필요 (Secret 불필요)
- Server-side API (Geocoding 등)는 Client ID + Secret 모두 필요
- Client Secret이 필요한 작업 시 `.env.local`에서 `NCLOUD_CLIENT_SECRET` 값을 확인할 것
- Secret이 없으면 사용자에게 Naver Cloud Console에서 확인하도록 안내

## 작업 지시

$ARGUMENTS

위 작업을 Naver Cloud API로 수행하라. 결과는 읽기 쉽게 정리하여 보여줄 것.
