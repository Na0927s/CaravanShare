# 🚐 CaravanShare (카라반 쉐어)

카라반 소유자와 여행자를 연결하는 카라반 공유 플랫폼입니다. 초기 MVP 구현을 넘어, AI와의 협업을 통해 SOLID 원칙과 클린 아키텍처에 기반한 대대적인 리팩토링을 거쳐 유지보수와 확장이 용이하도록 설계되었습니다.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [아키텍처 특징](#️-아키텍처-특징)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [API 문서](#-api-문서)

## 🎯 프로젝트 개요

**CaravanShare**는 카라반(캠핑카) 소유자와 여행자를 위한 공유 플랫폼입니다. 소유자는 사용하지 않는 카라반을 대여하여 수익을 창출하고, 여행자는 합리적인 가격으로 카라반 여행을 경험할 수 있습니다.

본 프로젝트는 단순히 MVP(최소 기능 제품)를 완성하는 것을 넘어, **AI 개발자와의 협업**을 통해 초기 버전의 문제점을 분석하고, 클린 아키텍처와 SOLID 원칙에 기반하여 지속적으로 코드를 개선하며 소프트웨어의 품질을 높이는 과정을 거쳤습니다.

### 핵심 역할

*   **공급자 (Host):** 카라반을 소유하며, 유휴 시간에 임대하여 수익 창출
*   **수요자 (Guest):** 카라반을 소유하지 않았지만, 저렴한 비용으로 카라반 여행 경험

### 프로젝트 특징

- ✅ **MVP 초과 달성** - 사용자 관리, 카라반 관리, 예약, 결제, 리뷰 등 MVP 핵심 기능을 모두 구현했으며, 이후 대규모 리팩토링을 통해 코드 품질을 개선했습니다.
- ✅ **AI 기반 개발** - Gemini CLI와의 협업을 통해 프로젝트 설계, 기능 구현, 리팩토링, 오류 해결 등 개발 전 과정의 생산성을 극대화했습니다.
- ✅ **클린 아키텍처 진화** - 초기 구현의 문제점을 개선하기 위해 서비스/리포지토리 계층을 도입하고, 계층별 책임을 명확히 분리하여 유연하고 테스트 가능한 구조로 발전시켰습니다.
- ✅ **SOLID 원칙 준수** - 단일 책임, 개방-폐쇄, 의존성 역전 등 객체 지향 설계 원칙을 코드 리팩토링 전반에 걸쳐 적용했습니다.
- ✅ **디자인 패턴 적용** - Repository, Factory, Strategy, Observer 등 다양한 디자인 패턴을 활용해 코드의 재사용성과 확장성을 높였습니다.
- ✅ **타입스크립트 기반** - 프론트엔드와 백엔드 모두 타입스크립트를 적용하여 코드의 안정성과 예측 가능성을 확보했습니다.

## ✨ 주요 기능

### 🚶 사용자 기능
- **인증 및 계정 관리:**
  - 일반 회원가입 및 로그인, 프로필 관리
  - 카카오 OAuth를 통한 소셜 로그인 및 신규 사용자 역할 선택 (게스트/호스트), 로그인 시 사용자 역할(guest/host) 자동 인식
  - 안전한 회원 탈퇴 기능 (사용자 계정 삭제 시, 연관된 모든 카라반, 예약, 리뷰, 결제 데이터가 데이터베이스 무결성을 지키며 함께 삭제됨)
- **카라반:** 카라반 목록 검색 및 상세 정보 조회, 카라반 상세 페이지 내 리뷰 및 평점 확인
- **예약:** 원하는 날짜에 카라반 예약 신청 및 내 예약 목록 확인, 중복 예약 방지, 예약 상태 관리 (대기, 승인, 거절, 결제 대기, 확정, 취소)
- **결제:** 예약에 대한 모의 결제 처리 및 결제 내역 조회, 가격 계산 (렌탈 기간 기반)
- **리뷰:** 이용 완료된 예약에 대한 리뷰 작성 및 평점 부여

### 💼 호스트 기능
- **카라반 관리:** 소유한 카라반 등록, 정보 수정, 상태 관리 (사용 가능, 예약됨, 정비 중), 등록한 카라반 삭제
- **예약 관리:** 자신의 카라반에 접수된 예약 목록 조회, 예약에 대한 승인 또는 거절 처리, 예약 상태 변화에 따른 알림
- **리뷰 관리:** 작성된 리뷰 및 평점 확인

## 🏛️ 아키텍처 특징

초기 MVP 구현 이후, 코드 품질과 확장성을 높이기 위해 대대적인 리팩토링을 거쳐 다음과 같은 아키텍처를 구축했습니다.

- **관심사 분리 (SoC):** 백엔드는 `entities`(DB 모델), `repositories`(데이터 접근), `services`(비즈니스 로직), `controllers`(API 엔드포인트) 등 각 계층의 역할을 명확하게 분리했습니다. 프론트엔드는 `components`, `hooks`, `pages`로 역할을 분리하여 재사용성과 유지보수성을 높였습니다.
- **의존성 주입 (DI):** 서비스 계층은 생성자를 통해 필요한 의존성을 주입받습니다. 이를 통해 코드의 결합도를 낮추고 단위 테스트를 용이하게 합니다.
- **데이터 모델 일관성:** 프론트엔드와 백엔드 간 `camelCase`와 `snake_case` 명명 규칙 불일치 및 `Date` 타입 처리 등 데이터 모델 불일치 문제를 해결하여 전반적인 코드의 안정성과 예측 가능성을 확보했습니다.
- **복잡한 비즈니스 로직 분리:**
  - **`ReservationValidator`**: 예약 생성 시 날짜 유효성 검사, 중복 예약 확인 등 복잡한 검증 로직을 별도의 클래스로 분리하여 `ReservationService`의 책임을 덜고 테스트 용이성을 높였습니다.
  - **`useFetch` Custom Hook**: 프론트엔드에서 반복적으로 사용되는 API 데이터 호출, 로딩 및 에러 상태 관리를 `useFetch` 커스텀 훅으로 추상화하여 코드 중복을 줄이고 로직을 중앙화했습니다.
- **디자인 패턴 활용:**
  - **Repository Pattern:** 데이터 영속성 로직을 캡슐화하여 서비스 계층과 데이터베이스를 분리합니다.
  - **Factory Pattern:** 복잡한 객체 생성 과정을 `ReservationFactory`에 위임하여 캡슐화합니다.
  - **Strategy Pattern:** 다양한 할인 정책(`DiscountStrategy`)을 유연하게 교체할 수 있도록 설계되었습니다.
  - **Observer Pattern:** 예약 상태 변경 시 `NotificationService`에 알림을 보내는 등, 상태 변화에 따른 부가 작업을 분리하여 처리합니다.
- **테스트 주도 개발 (TDD):** `Jest`를 사용한 상세한 단위 테스트를 통해 코드의 안정성과 신뢰성을 확보합니다.

## 🛠️ 기술 스택

### Backend
- **Framework:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** Bcrypt.js (for password hashing)
- **Testing:** Jest, ts-jest
- **Environment:** dotenv

### Frontend
- **Framework/Library:** React (with Create React App)
- **Language:** TypeScript
- **Styling:** CSS, Bootstrap, React-Bootstrap
- **State Management:** React Hooks
- **HTTP Client:** Axios
- **Routing:** React Router

## 📂 프로젝트 구조

```
CaravanShare/
├── client/                 # 프론트엔드 (React + TypeScript)
│   ├── public/
│   └── src/
│       ├── components/     # 재사용 가능한 UI 컴포넌트
│       ├── hooks/          # 커스텀 훅 (e.g., useFetch)
│       ├── models/         # 프론트엔드 데이터 모델 (타입 정의)
│       ├── pages/          # 페이지 단위 컴포넌트
│       └── App.tsx         # 메인 애플리케이션 및 라우팅
│
└── server/                 # 백엔드 (Node.js + Express + TypeScript)
    └── src/
        ├── __tests__/      # Jest 단위/통합 테스트
        ├── controllers/    # API 요청/응답 처리 및 유효성 검사
        ├── data-source.ts  # TypeORM 데이터베이스 연결 설정
        ├── entities/       # TypeORM 엔티티 (데이터베이스 테이블 스키마)
        ├── exceptions/     # 커스텀 에러 클래스 (e.g., NotFoundError)
        ├── models/         # 도메인 비즈니스 모델 (타입 정의)
        ├── repositories/   # 데이터 접근 계층 (Repository Pattern)
        ├── routes/         # API 엔드포인트 라우팅
        ├── services/       # 핵심 비즈니스 로직 (Service Layer)
        └── index.ts        # 서버 진입점
```

## 🚀 시작하기

### 1. 사전 준비
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- `npm` 또는 `yarn`
- [PostgreSQL](https://www.postgresql.org/) 데이터베이스

### 2. 프로젝트 클론 및 설치
```bash
# 1. 프로젝트 클론
git clone https://github.com/your-username/CaravanShare.git
cd CaravanShare

# 2. 루트 디렉토리에서 전체 의존성 설치
npm install
```

### 3. 백엔드 서버 설정 및 실행

```bash
# 1. server/.env 파일 생성 및 환경 변수 설정
cd server
cp .env.example .env 
# .env 파일에 PostgreSQL 및 Kakao OAuth 정보를 입력합니다.

# 2. 데이터베이스 스키마 동기화
# server/src/data-source.ts 파일의 synchronize 옵션을 true로 설정하고 서버를 한 번 실행하여 테이블을 생성할 수 있습니다.
# (주의: 프로덕션 환경에서는 마이그레이션을 사용해야 합니다.)
```

### 4. 전체 애플리케이션 실행
프로젝트 루트 디렉토리에서 다음 명령어를 실행하면 백엔드와 프론트엔드가 동시에 실행됩니다.

```bash
# concurrently를 사용하여 클라이언트와 서버 동시 실행
npm run dev
```
-   **프론트엔드:** `http://localhost:3000`
-   **백엔드:** `http://localhost:3001`

이 명령어는 루트 `package.json`에 정의되어 있으며, `client`와 `server` 디렉토리 각각에서 `npm start`를 실행하는 것과 같습니다.


## 🚀 배포 (Deployment)

현재 AWS EC2 인스턴스에 배포되어 있습니다.
아래 링크에서 서비스를 확인하실 수 있습니다.

- **URL:** [http://15.165.10.213:3000/](http://15.165.10.213:3000/)
- **Status:** Beta (로그인 기능 안정화 작업 중)


## 📚 API 문서

### 사용자 API (`/api/users`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST   | /signup | 일반 회원가입 |
| POST   | /login    | 일반 로그인 |
| GET    | /auth/kakao | 카카오 로그인 시작 (리디렉션) |
| GET    | /auth/kakao/callback | 카카오 로그인 콜백 |
| POST   | /social-signup | 소셜 로그인 사용자의 역할 선택 후 최종 가입 |
| GET    | /:id      | 사용자 정보 조회 |
| PUT    | /:id      | 사용자 정보 수정 |
| DELETE | /:id      | 회원 탈퇴 |

### 카라반 API (`/api/caravans`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET    | /       | 모든 카라반 목록 조회 |
| POST   | /       | 새 카라반 등록 (호스트) |
| GET    | /:id   | 특정 카라반 상세 정보 조회 |
| PUT    | /:id   | 카라반 정보 수정 (호스트) |
| DELETE | /:id   | 카라반 삭제 (호스트) |
| GET    | /:id/reviews | 특정 카라반의 리뷰 목록 조회 |

### 예약 API (`/api/reservations`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST   | /      | 예약 생성 |
| GET    | /my-reservations   | 내 예약 목록 조회 |
| GET    | /host-reservations | 내 카라반의 예약 목록 조회 |
| PUT    | /:id/status | 예약 상태 변경 (승인/거절) |
| PUT    | /:id/pay | 예약 결제 확인 |
| GET    | /payment-history/:userId | 특정 사용자의 결제 내역 조회 |

### 리뷰 API (`/api/reviews`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST   | / | 리뷰 작성 |
| GET    | /user/:userId | 특정 사용자가 작성한 리뷰 목록 |
---