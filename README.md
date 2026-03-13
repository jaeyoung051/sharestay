# ShareStay

ShareStay는 공동 거주 및 방 공유를 목적으로 한 웹 서비스입니다.  
사용자는 방을 등록하고, 지도를 통해 방을 탐색하며,  
JWT 및 Google OAuth2 로그인을 통해 서비스를 이용할 수 있습니다.

이 프로젝트는 팀 프로젝트로 진행되었으며,  
프론트엔드–백엔드 인증 구조 연동과 협업 과정에서 발생한 문제 해결 경험을 중심으로 개발했습니다.

---

## 프로젝트 목적

- 실제 서비스와 유사한 구조의 팀 프로젝트 경험
- 프론트엔드와 백엔드 간 인증/인가 흐름 이해
- JWT / OAuth2 기반 로그인 구조 구현
- 협업 과정에서 발생하는 문제를 분석하고 해결하는 경험 축적

---

### 방 찾기
<img width="1680" height="933" alt="image" src="https://github.com/user-attachments/assets/d9f1ddfa-b2c9-45ff-bc54-aa902f06fc68" />

### 방 상세 보기
<img width="1680" height="933" alt="image" src="https://github.com/user-attachments/assets/40d1fc24-2d25-4af3-93dd-3bb018f43712" />

### 지도로 방 찾기
<img width="1680" height="933" alt="image" src="https://github.com/user-attachments/assets/a0da1d90-4e75-4bab-a631-43168e55b187" />

---

## 기술 스택

### Frontend
- React
- TypeScript
- MUI
- React Router
- Axios

### Backend
- Spring Boot
- Spring Security
- JWT
- OAuth2 (Google)

### Database
- MariaDB

### Collaboration
- Git / GitHub
- Velog

---

## 주요 기능

- 회원 가입 및 로그인
  - JWT 기반 로컬 로그인
  - Google OAuth2 로그인

- 방 조회 및 검색
  - 지역 기반 방 조회
  - 지도 연동

- 방 등록 및 관리
  - HOST 권한 기반 접근 제어

- 즐겨찾기(찜) 기능

- 공유하기 기능
  - 프론트에서 URL 생성 후 클립보드 복사
  - 
---

## 인증 구조 요약

- 로그인 성공 시 JWT 발급
- OAuth2 로그인 성공 후 JWT를 프론트로 전달
- 프론트에서는 sessionStorage 기반으로 로그인 상태 관리
- 인증 구조 변경을 시도하며 발생한 문제들을 트러블슈팅으로 정리

> 인증 구조를 단순히 구현하는 것을 넘어,  
> 구조 변경 시 발생할 수 있는 문제와 롤백 결정까지 경험했습니다.

---

## Trouble Shooting

프로젝트 진행 중 다음과 같은 문제들을 겪었고,  
각각의 문제를 **원인 분석 → 해결 → 선택의 이유** 중심으로 정리했습니다.

- 인증 구조 불일치로 발생한 로그인 문제 (sessionStorage 기반 구조)
- OAuth2 로그인 후 리다이렉트가 동작하지 않던 이슈
- Git 협업 과정에서 발생한 충돌 및 fast-forward 이해
- 공유 링크 생성 로직을 프론트 중심으로 개선한 경험

👉 자세한 내용은 Velog에 정리했습니다.  

📎 **Velog 트러블슈팅 정리:**  
[Velog](https://velog.io/@seojaeyeong-051/series/TeamProject-sharestay)

---

## 담당 역할

- 백엔드 인증/인가 구조 설계 및 구현
- OAuth2 로그인 흐름 구현
- 프론트–백엔드 인증 연동 문제 분석 및 해결
- 공유 기능 로직 개선 및 API 스펙 조율
- Git 충돌 해결 및 협업 브랜치 관리

---

## 회고

이 프로젝트를 통해 단순히 기능을 구현하는 것보다  
**구조의 일관성과 팀 상황을 고려한 판단**이 중요하다는 것을 배웠습니다.

특히 인증 구조 변경 과정에서  
이상적인 설계보다 현실적인 선택과 롤백 결정이  
프로젝트 완성도에 더 중요할 수 있다는 점을 체감했습니다.

---

## 실행 방법

### Frontend

```bash
npm install
npm run dev
```
