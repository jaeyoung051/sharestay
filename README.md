# ShareStay+
🏠 룸쉐어/자취방을 공유하고 찾을 수 있는 방 매칭 플랫폼

---

## 1. 프로젝트 개요
ShareStya+는 안전하고 효율적인 매칭 서비스의 부재를 해결하기 위해 만든 웹 서비스입니다. 

- 개발 기간: 2025.10.29 ~ 2025.12.10
- 팀 인원: 5명 (FE 2명, BE 3명)
- 주요 타겟: 자취방/룸메이트를 찾는 대학생 및 직장인

### 🎯 기획 의도
- 기존의 비공식 거래는 신뢰성 및 안전성 문제가 있었고, 원하는 조건으로 방과 룸메이트를 구할 수 없다는 단점이 있었습니다.
- 이를 보완하여 사용자들이 위치, 가격, 조건, 룸메이트의 라이프 스타일 등을 기반으로 방/룸메이트를 쉽게 찾을 수 있도록 하는 것을 목표로 합니다.

---

## 2. 주요기능

### 👤 사용자/회원

- 회원가입 / 로그인 (일반 + OAuth 로그인)
- 내 정보 조회 및 수정
- Host / Guest 역할 구분 (예: 방 등록자 vs 방 찾는 사람)

### 🏠 방(룸) 관련 기능

- 방 등록 / 수정 / 삭제 (호스트 전용)
- 방 이미지 업로드
- 방 목록 조회 (페이지네이션, 정렬, 필터)
- 키워드 / 조건 기반 검색 (지역, 가격, 방 유형 등)
- 방 상세 페이지(지도, 설명, 옵션, 이미지, 공유 링크 등)

  ### ⭐ 기타 기능 (예시)

- 방 찜하기 (즐겨찾기)
- 공유 링크 생성 및 접속
- Ban 기능 (악성 사용자 제재 예정)

---
## 3. 기술 스택

### 🔧 Backend

- Java 17
- Spring Boot
- Spring Data JPA / Hibernate
- Spring Security, JWT
- MariaDB
- Gradle

### 🎨 Frontend

- React
- TypeScript
- Vite
- MUI (Material UI)
- React Query / Axios

### 🛠 Dev & 협업

- GitHub (Organization / Branch 전략)
- IntelliJ IDEA, VSCode
- Postman, Swagger(OpenAPI)
- ERDCloud / Miro


---

## 5. API & ERD (선택)

- **API 문서**: Swagger UI를 통해 자동 문서화  
  - 예: `/swagger-ui/index.html`

- **주요 엔드포인트 예시**
  - `POST /api/auth/signup` – 회원가입
  - `POST /api/auth/login` – 로그인(JWT 발급)
  - `GET /api/rooms` – 방 목록 조회
  - `POST /api/rooms` – 방 등록
  - `GET /api/rooms/{roomId}` – 방 상세 조회
  - `GET /api/rooms/search` - 방 검색
  - `GET /api/{rooms}/share` - 공유 링크 조회


- **ERD**:
<img width="1269" height="648" alt="image" src="https://github.com/user-attachments/assets/236262d9-cbe8-4fb3-9377-0086886b504e" />



# ShareStay+ Frontend

안전하고 신뢰할 수 있는 룸메이트 매칭 플랫폼 **ShareStay+** 의 프론트엔드 저장소입니다.  
React + TypeScript + Vite 기반으로 구축되었으며, MUI 디자인 시스템을 활용해 제품 UI를 구현합니다.

## 주요 화면

- **홈**: 서비스 소개, 추천 매물, 지역별 안전도 등 핵심 지표를 제공하는 랜딩 페이지
- **로그인/회원가입**: 새롭게 디자인된 인증 플로우 (이메일/비밀번호, Google OAuth)
- **방 찾기**: 필터, 정렬, 카드형 결과 목록이 포함된 검색 UI
- **이용방법**: ShareStay+ 사용 가이드, 단계별 안내
- **룸메이트 모집하기**: 매물 정보를 입력할 수 있는 폼 기반 화면
- **약관/개인정보/비밀번호 찾기** 등 정책 & 지원 관련 정적 페이지

## 기술 스택

- **React 18 + TypeScript**
- **Vite** 번들러 (HMR + 빠른 개발 환경)
- **Material UI (MUI)** 컴포넌트 라이브러리
- **React Router v6** 라우팅
- **react-hook-form + zod** 폼 상태/검증
- **Axios** API 통신 레이어
- **Google OAuth** 연동

## 실행 방법

```bash
pnpm install        # 또는 npm install, yarn install
pnpm run dev        # 개발 서버 실행 (http://localhost:5173)
pnpm run build      # 프로덕션 빌드
pnpm run preview    # 빌드 결과 미리보기
pnpm run lint       # ESLint 검사
```

> ⚠️  `VITE_GOOGLE_CLIENT_ID` 환경변수가 `.env` 혹은 실행 환경에 설정되어 있어야 Google 로그인 기능이 동작합니다.

## 폴더 구조 (발췌)

```
src/
├── auth/            # 인증 컨텍스트, 타입, 훅
├── components/      # 공통 UI 컴포넌트 (헤더, 푸터, 폼 필드 등)
├── lib/             # Axios 래퍼 등 유틸
├── pages/           # 각 라우트별 화면 컴포넌트
├── routes/          # 보호 라우터 등 라우팅 관련 코드
└── index.css        # 글로벌 스타일
```

## 라우팅

- `/` 홈
- `/login`, `/signup`
- `/rooms`, `/guide`, `/list-room`, `/safety-map`
- `/forgot-password`, `/terms`, `/privacy`
- `/profile`, `/admin` (보호 라우트)

`src/App.tsx`에서 전체 라우팅 구성을 확인할 수 있으며, 일부 페이지는 향후 백엔드 API 연동에 맞춰 확장됩니다.

## 디자인 & 브랜드 가이드

- 주요 색상: `#0c51ff` (Primary), `#f4f6fb` (Background)
- 타이포그래피: [@fontsource/roboto](https://fontsource.org/fonts/roboto)
- 공통 요소: 고정 상담 버튼, Sticky 헤더, 카드형 UI

## 향후 작업 예정

- 실데이터 연동 (매물 목록, 지도, 룸메이트 매칭 API)
- 검색/필터/폼 제출과 같은 상호작용에 대한 백엔드 연결
- 반응형/접근성 개선 및 E2E 테스트 도입

---
