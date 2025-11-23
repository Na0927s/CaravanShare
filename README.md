# 🚐 CaravanShare (카라반 쉐어)

카라반 소유자와 여행자를 연결하는 카라반 공유 플랫폼입니다. SOLID 원칙과 클린 아키텍처에 기반하여 유지보수와 확장이 용이하도록 설계되었습니다.

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

### 프로젝트 특징

- ✅ **클린 아키텍처** - 계층별 역할과 책임을 명확히 분리하여 유연하고 테스트 가능한 구조를 지향합니다.
- ✅ **SOLID 원칙 준수** - 단일 책임, 개방-폐쇄, 의존성 역전 등 객체 지향 설계 원칙을 적용했습니다.
- ✅ **디자인 패턴 적용** - Repository, Factory, Strategy, Observer 등 다양한 디자인 패턴을 활용해 코드의 재사용성과 확장성을 높였습니다.
- ✅ **타입스크립트 기반** - 프론트엔드와 백엔드 모두 타입스크립트를 적용하여 코드의 안정성과 예측 가능성을 확보했습니다.

## ✨ 주요 기능

### 🚶 사용자 기능
- **인증:** 회원가입, 로그인, 프로필 관리
- **카라반:** 카라반 목록 검색 및 상세 정보 조회
- **예약:** 원하는 날짜에 카라반 예약 신청 및 내 예약 목록 확인
- **결제:** 예약에 대한 결제 처리 및 결제 내역 조회
- **리뷰:** 이용 완료된 예약에 대한 리뷰 작성 및 평점 부여

### 💼 호스트 기능
- **카라반 관리:** 소유한 카라반 등록, 정보 수정, 상태 관리
- **예약 관리:** 접수된 예약에 대한 승인 또는 거절 처리
- **리뷰 관리:** 작성된 리뷰에 대한 응답

## 🏛️ 아키텍처 특징

이 프로젝트는 확장성과 유지보수성을 높이기 위해 클린 아키텍처와 SOLID 원칙을 기반으로 설계되었습니다.

- **관심사 분리 (SoC):** `entities`(DB 모델), `models`(비즈니스 모델), `repositories`(데이터 접근), `services`(비즈니스 로직), `controllers`(API 엔드포인트) 등 각 계층의 역할을 명확하게 분리했습니다.
- **의존성 주입 (DI):** 서비스 계층은 생성자를 통해 필요한 의존성을 주입받습니다. 이를 통해 코드의 결합도를 낮추고 단위 테스트를 용이하게 합니다.
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
- **Database ORM:** TypeORM
- **Database:** PostgreSQL
- **Testing:** Jest, ts-jest

### Frontend
- **Framework/Library:** React (with Create React App)
- **Language:** TypeScript
- **Styling:** CSS, Bootstrap
- **HTTP Client:** Axios
- **Routing:** React Router

## 📂 프로젝트 구조

```
CaravanShare/
├── client/                 # 프론트엔드 (React + TypeScript)
│   ├── public/
│   └── src/
│       ├── components/     # 공통 컴포넌트
│       ├── hooks/          # 커스텀 훅
│       ├── models/         # 프론트엔드 모델 (타입 정의)
│       ├── pages/          # 페이지 컴포넌트
│       └── App.tsx         # 메인 애플리케이션
│
└── server/                 # 백엔드 (Node.js + Express + TypeScript)
    └── src/
        ├── __tests__/      # Jest 테스트 파일
        ├── controllers/    # API 요청/응답 처리
        ├── db/             # 데이터베이스 관련 파일
        ├── entities/       # TypeORM 엔티티 (DB 스키마)
        ├── exceptions/     # 커스텀 에러 클래스
        ├── models/         # 비즈니스 로직 모델 (타입 정의)
        ├── repositories/   # 데이터 접근 계층 (Repository Pattern)
        ├── routes/         # API 라우팅
        ├── services/       # 비즈니스 로직 (Service Layer)
        └── index.ts        # 서버 진입점
```

## 🚀 시작하기

### 1. 사전 준비
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- `npm` 또는 `yarn`
- [PostgreSQL](https://www.postgresql.org/) 데이터베이스

### 2. 백엔드 서버 실행

```bash
# 1. server 디렉토리로 이동
cd server

# 2. 의존성 패키지 설치
npm install

# 3. TypeORM 설정
# src/data-source.ts 파일에서 본인의 PostgreSQL 접속 정보를 입력합니다.

# 4. 서버 실행 (개발 모드)
npm start
```
서버는 `http://localhost:8080`에서 실행됩니다.

### 3. 프론트엔드 클라이언트 실행

```bash
# 1. client 디렉토리로 이동
cd client

# 2. 의존성 패키지 설치
npm install

# 3. 클라이언트 실행
npm start
```
클라이언트는 `http://localhost:3000`에서 실행됩니다.

## 📚 API 문서

### 사용자 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST   | /users/register | 회원가입 |
| POST   | /users/login    | 로그인 |
| GET    | /users/:id      | 사용자 정보 조회 |

### 카라반 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET    | /caravans       | 카라반 목록 조회 |
| GET    | /caravans/:id   | 카라반 상세 정보 조회 |
| POST   | /caravans       | 카라반 등록 (호스트) |
| PUT    | /caravans/:id   | 카라반 정보 수정 (호스트) |

### 예약 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST   | /reservations      | 예약 생성 |
| GET    | /reservations/me   | 내 예약 목록 (게스트) |
| GET    | /reservations/host | 내 카라반의 예약 목록 (호스트) |
| PATCH  | /reservations/:id/status | 예약 상태 변경 (승인/거절) |
| POST   | /reservations/:id/payment | 예약 결제 |

### 리뷰 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST   | /reviews | 리뷰 작성 |
| GET    | /reviews/caravan/:id | 특정 카라반의 리뷰 목록 |
---

