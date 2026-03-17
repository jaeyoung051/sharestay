# 🏠 ShareStay+
룸쉐어 / 자취방을 공유하고 찾을 수 있는 **위치 기반 방 매칭 플랫폼**

---

## 📌 프로젝트 개요

**ShareStay+**는 기존의 비공식적인 방 거래에서 발생하는  
신뢰성 부족과 정보 불균형 문제를 해결하기 위해 개발된 웹 서비스입니다.

- 📅 개발 기간: 2025.10.29 ~ 2025.12.10  
- 👥 팀 구성: 5명 (Frontend 2명, Backend 3명)  
- 🎯 타겟 사용자: 자취방 / 룸메이트를 찾는 대학생 및 직장인  

---

## 🎯 프로젝트 목적

- 실제 서비스와 유사한 구조의 팀 프로젝트 경험
- 프론트엔드–백엔드 간 인증/인가 흐름 이해
- JWT / OAuth2 기반 로그인 구조 구현
- 협업 과정에서 발생하는 문제 해결 경험 축적

---

## 🧠 차별화 요소

- 📍 **위치 기반 매칭 시스템**
  - Kakao Map API를 활용한 지도 기반 방 탐색

- 🔒 **신뢰성 중심 정보 제공**
  - 사용자 활동 및 매물 정보를 기반으로 신뢰도 고려

- 👥 **라이프스타일 기반 룸메이트 매칭**
  - 단순 조건이 아닌 생활 패턴 기반 탐색

- 🔗 **공유 링크 기능**
  - 특정 매물을 외부 사용자에게 쉽게 공유

---

## 📸 주요 기능 (GIF)

### 메인 페이지
![alt text](<팀 프로젝트 GIF/KakaoTalk_20260211_154835960-ezgif.com-video-to-gif-converter.gif>)

### 방 찾기
![image](./팀%20프로젝트%20GIF/1-ezgif.com-video-to-gif-converter.gif)

### 지도 기반 탐색
![alt text](<팀 프로젝트 GIF/ezgif.com-video-to-gif-converter (4).gif>)

### 방 상세보기
![alt text](<팀 프로젝트 GIF/ezgif.com-video-to-gif-converter (3).gif>)

### 방 등록
![alt text](<팀 프로젝트 GIF/ezgif.com-video-to-gif-converter (2).gif>)

---

## 🏠 주요 기능

### 👤 사용자 / 인증

- JWT 기반 로그인 (Access Token / Refresh Token)
- Google OAuth2 로그인
- 역할 기반 권한 관리 (GUEST / HOST / ADMIN)

---

### 🏡 방(룸) 관리

- 방 등록 / 수정 / 삭제 (HOST 권한)
- 이미지 업로드 (Firebase Storage)
- 목록 조회 + 페이지네이션 + 필터링
- 지도 기반 위치 탐색 및 클러스터링
- 상세 페이지 제공

---

### ⭐ 편의 기능

- 즐겨찾기 (찜)
- 공유 링크 생성
- 관리자 기능 (회원 관리 / 정지)

---

## 🏗 시스템 아키텍처

> **Client (React)** ↔ **Backend (Spring Boot)** ↔ **Database (MariaDB)** / **Storage (Firebase)**

![architecture](https://github.com/user-attachments/assets/f12e2e60-b5a5-4429-a349-8b2fc65ab418)

---

## 🔧 기술 스택

### Backend

- Java 17
- Spring Boot
- Spring Data JPA / Hibernate
- Spring Security + JWT
- OAuth2 (Google)
- MariaDB
- Firebase Storage

---

### Frontend

- React + TypeScript
- Vite
- MUI (Material UI)
  
---

### Dev & 협업

- GitHub (Organization 기반 협업)
- GitHub Flow (feature 브랜치 전략)
- PR 기반 코드 리뷰
- Swagger(OpenAPI), Postman
- ERDCloud / Miro

---

## 🔐 인증 구조

- 로그인 성공 시 JWT 발급
- OAuth2 로그인 후 JWT를 프론트로 전달
- 프론트는 sessionStorage 기반으로 상태 관리
- Spring Security 기반 권한 처리

---

## 📡 API 명세

- Swagger UI: http://localhost:8080/swagger-ui/index.html

---

## 🗄 ERD

![ERD](https://github.com/user-attachments/assets/236262d9-cbe8-4fb3-9377-0086886b504e)

---

## 🧩 Trouble Shooting

- 인증 구조 불일치로 인한 로그인 문제 해결
- OAuth2 리다이렉트 이슈 해결
- Git 충돌 및 fast-forward 문제 해결
- 공유 링크 기능 개선

👉 상세:  
https://velog.io/@seojaeyeong-051/series/TeamProject-sharestay

---

## 👨‍💻 담당 역할

- 백엔드 인증/인가 구조 설계 및 구현
- OAuth2 로그인 흐름 구현
- 프론트–백엔드 인증 연동 문제 해결
- 공유 기능 로직 개선 및 API 설계
- Git 브랜치 전략 및 충돌 해결

---

## 💡 회고

이 프로젝트를 통해 단순 기능 구현을 넘어  
**구조 설계와 팀 상황을 고려한 판단의 중요성**을 배웠습니다.

특히 인증 구조 변경 과정에서  
이상적인 설계보다 현실적인 선택과 롤백 결정이  
프로젝트 완성도에 더 중요하다는 것을 경험했습니다.

---

## 🚀 실행 방법

### Backend

```bash
git clone https://github.com/{your-repo-url}.git
cd sharestaybackend

./gradlew bootRun
```

### Frontend

```bash
npm install
npm run dev
```
