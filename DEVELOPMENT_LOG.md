# CaravanShare 개발 일지


### 0. 프로젝트 개요 (Project Overview)
- **프로젝트명:** CaravanShare (캠핑카/카라반 공유 플랫폼)
- **개발자:** Gemini CLI (대학교 2학년)
- **핵심 목표:** MVP(최소 기능 제품) 완성을 통한 바이브코딩 개발 역량 강화
- **기술 스택(Tech Stack):**
- Frontend: React, TypeScript, Bootstrap
- Backend: Node.js, Express, TypeScript
- Database: JSON File System (Prototyping)
- Tool: Gemini CLI, Git/GitHub, VS Code (WSL)

## Week1 (2025.11.10)
- 1주차: 초기 환경 구축 및 MVP 기반 마련
- 기간: 2025.11.10 ~

### Day 1 (2025.11.13)

#### Session 1 (오전: 개발 환경 구축 완료)

1. 프로젝트 구조 설계 (Architecture)

Client/Server 분리: 유지보수성을 위해 프론트엔드(client)와 백엔드(server) 디렉토리를 물리적으로 분리함.

AI 협업 가이드라인: 프로젝트의 MVP 요구사항(호스트/게스트 기능, JSON DB 사용 등)을 정의한 GEMINI.md 파일 생성 및 승인.

2. 백엔드 (Server) 구성

Node.js + Express 환경 세팅: npm init을 통해 package.json 생성.

핵심 라이브러리 설치: express, cors, nodemon, ts-node & typescript.

3. 프론트엔드 (Client) 구성

React App 생성: create-react-app의 TypeScript 템플릿을 사용하여 타입 안정성이 보장된 환경 구축.

UI 라이브러리: Bootstrap 및 react-bootstrap 설치.

초기 화면 구현: "Welcome to CaravanShare" 랜딩 페이지 및 기본 헤더(Header) 컴포넌트 작성.

4. 통합 실행 환경 (Automation)

Concurrently 설정: 루트 디렉토리에서 명령어 하나(npm run dev)로 프론트(3000)와 백엔드(3001)를 동시에 실행하도록 스크립트 자동화 구성.

5. 중간 결과 (Outcome)

- Localhost:3000 (Client) ↔ Localhost:3001 (Server) 동시 접속 및 연동 성공.
- Git Repository 생성 및 초기 환경 커밋 완료.


### Day 2 (2025.11.14) - 핵심 기능 구현

#### Session 2 - 카라반 목록 및 사용자 인증 기능 구현

1. 기능 구현 1: 카라반 목록 보기 (Caravan Listing)

- 백엔드:
    - `/api/caravans` 엔드포인트를 통해 `caravans.json` 데이터를 제공하는 API 구현.
    - (Troubleshooting) TypeScript 컴파일 후 `dist` 폴더에서 `json` 파일을 찾지 못하는 경로 문제 해결 (`path.join` 수정).
- 프론트엔드:
    - `CaravansPage`에서 백엔드 API를 호출하여 카라반 목록을 받아옴.
    - `CaravanCard` 컴포넌트를 만들어 각 카라반 정보를 카드 형태로 표시.

2. 기능 구현 2: 사용자 인증 (User Authentication)

- 백엔드:
    - `/api/auth/signup`, `/api/auth/login` 엔드포인트를 구현.
    - `users.json` 파일을 이용해 사용자 정보 저장 및 조회.
    - `uuid` 라이브러리를 사용해 고유 사용자 ID 생성.
- 프론트엔드:
    - `SignupPage`와 `LoginPage`에 `react-bootstrap`을 사용한 폼(Form) 구현.
    - 로그인 상태에 따라 `Header`의 메뉴가 동적으로 (로그인/회원가입 ↔ 로그아웃) 변경되도록 구현.

3. 버전 관리 (Version Control)

- Git 브랜치 전략 적용: `feature/user-authentication` 브랜치를 생성하여 기능 개발 진행.
- 커밋: 완성된 기능들을 하나의 논리적 단위로 묶어 커밋.
- 병합 및 푸시: 개발 완료된 브랜치를 `main` 브랜치에 병합(Merge)하고, 원격 저장소(GitHub)에 푸시(Push)하여 백업 및 동기화 완료.

4. 중간 결과 (Outcome)

- 사용자가 카라반 목록을 조회할 수 있음.
- 사용자가 회원가입하고 로그인/로그아웃 할 수 있음.
- Git을 통한 체계적인 버전 관리 적용.


#### Session 3 - 카라반 CRUD 기능 확장

1. 기능 구현 3: 카라반 삭제 (Caravan Deletion)

- 백엔드:
    - `caravanController.ts`에 `deleteCaravan` 함수 추가.
    - `caravanRoutes.ts`에 `DELETE /api/caravans/:id` 경로 추가.
- 프론트엔드:
    - `CaravanCard.tsx`에 "삭제" 버튼 추가 (소유자에게만 표시).
    - `CaravansPage.tsx`에서 삭제 핸들러 구현 및 UI 업데이트.
    - (Troubleshooting) `hostId` 불일치로 인한 삭제 버튼 미표시 문제 해결 (`caravans.json` 데이터 수정).

2. 기능 구현 4: 카라반 편집 (Caravan Editing)

- 백엔드:
    - `caravanController.ts`에 `updateCaravan` 함수 추가.
    - `caravanRoutes.ts`에 `PUT /api/caravans/:id` 경로 추가.
- 프론트엔드:
    - `CaravanCard.tsx`에 "수정" 버튼 추가 (소유자에게만 표시).
    - `CaravanEditPage.tsx` 생성 및 라우팅 (`/caravans/:id/edit`) 설정.
    - `CaravanEditPage.tsx`에서 특정 카라반 데이터를 불러와 폼에 미리 채우고, 수정 후 `PUT` 요청 전송.
    - `client/src/models/Caravan.ts` 파일을 생성하여 프론트엔드와 백엔드 간 `Caravan` 타입 정의 공유.
    - (Troubleshooting) `Button as={Link}` 사용 시 TypeScript 컴파일 오류 해결 (`Link` 컴포넌트로 `Button` 감싸는 방식으로 수정).

3. 버전 관리 (Version Control)

- Git 브랜치 전략 적용: `feat/caravan-crud-update` 브랜치를 생성하여 기능 개발 진행.
- 커밋: 완성된 기능들을 하나의 논리적 단위로 묶어 커밋.
- 병합 및 푸시: 개발 완료된 브랜치를 `main` 브랜치에 병합(Merge)하고, 커밋 메시지 수정 후 원격 저장소(GitHub)에 푸시(Push)하여 백업 및 동기화 완료.

4. 중간 결과 (Outcome)

- 사용자가 자신이 등록한 카라반을 삭제하고 편집할 수 있음.
- 카라반에 대한 CRUD(Create, Read, Update, Delete) 기능이 모두 구현됨.
- Git을 통한 체계적인 버전 관리 및 원격 저장소 동기화.



### Day 3 (2025.11.16) 

#### Session 4 - 카라반 등록 및 예약 시스템 기반 구현

1.  **기능 구현 5: 카라반 등록 (Caravan Registration)**
    *   **프론트엔드:**
        *   `CaravanRegistrationPage.tsx`에 편의시설(`amenities`) 입력을 위한 UI 추가.
        *   콤마(,)로 구분된 문자열을 배열로 변환하여 백엔드에 전송하는 로직 구현.
    *   **백엔드:**
        *   `caravanController.ts`의 `createCaravan` 함수가 `amenities`를 포함한 모든 카라반 정보를 `caravans.json`에 최종 확인.
    *   **네비게이션:**
        *   `Header.tsx`에 호스트(host) 역할의 사용자에게만 "Register Caravan" 링크가 보이도록 조건부 렌더링 추가.

2.  **기능 구현 6: 예약 시스템 (Reservation System)**
    *   **백엔드:**
        *   `db/reservations.json` 파일 생성.
        *   `Reservation.ts` 모델 정의 (`pending`, `approved`, `rejected` 등 상태 포함).
        *   `reservationController.ts` 및 `reservationRoutes.ts`를 생성하여 예약 생성(`POST /api/reservations`) API 구현.
    *   **프론트엔드:**
        *   `CaravanCard.tsx`에 게스트(guest)에게만 "예약하기" 버튼이 보이도록 구현.
        *   `CaravansPage.tsx`에 예약 날짜 선택을 위한 `Modal` 창 및 예약 요청 전송 로직 구현.

#### Session 5 - 예약 관리 및 모의 결제 시스템 구현

1.  **기능 구현 7: 예약 관리 (Reservation Management)**
    *   **게스트:**
        *   `MyReservationsPage.tsx`를 생성하여 게스트가 자신의 예약 목록과 상태(예: `pending`)를 확인할 수 있도록 구현.
        *   `Header.tsx`에 "My Reservations" 링크 추가.
        *   백엔드에 `getMyReservations` 컨트롤러 및 라우트 추가 (`GET /api/reservations/my-reservations`).
    *   **호스트:**
        *   `HostDashboardPage.tsx`를 생성하여 호스트가 자신의 카라반에 접수된 예약 목록을 보고, '승인(Approve)' 또는 '거절(Reject)'할 수 있도록 구현.
        *   `Header.tsx`에 "Host Dashboard" 링크 추가.
        *   백엔드에 `getHostReservations` 컨트롤러 및 `updateReservationStatus` 컨트롤러/라우트 추가.
    *   **(Troubleshooting):** `HostDashboardPage.tsx`에서 `Reservation` 타입에 새로운 상태(`awaiting_payment`, `confirmed`)가 누락되어 발생한 렌더링 문제 해결.

2.  **기능 구현 8: 모의 결제 시스템 (Simulated Payment System)**
    *   **백엔드:**
        *   `Reservation` 모델에 `awaiting_payment`, `confirmed` 상태 추가.
        *   호스트가 예약을 승인하면 상태를 `awaiting_payment`로 변경.
        *   결제 확정을 위한 `confirmPayment` 컨트롤러 및 `PUT /api/reservations/:id/pay` 라우트 구현.
    *   **프론트엔드:**
        *   `MyReservationsPage.tsx`에서 `awaiting_payment` 상태의 예약에 "Pay Now" 버튼 표시.
        *   `PaymentPage.tsx`를 생성하여 가상 결제 페이지 구현.
        *   '결제 확인' 시 백엔드에 결제 완료 요청 전송 및 상태를 `confirmed`로 업데이트.

3.  **버전 관리 (Version Control)**
    *   `git add .`를 통해 모든 변경사항 스테이징.
    *   `feat: 전체 예약 및 모의 결제 시스템 구현 (AI-assisted)` 메시지로 커밋 완료.

4.  **중간 결과 (Outcome)**
    *   호스트가 카라반을 등록하고, 게스트가 해당 카라반을 예약, 호스트가 승인/거절, 게스트가 결제하는 전체 프로세스 구현 완료.
    *   사용자 역할(호스트/게스트)에 따라 동적으로 다른 UI/기능을 제공.
    *   MVP의 핵심 기능인 예약 및 결제 시스템의 기반을 완성.


#### Session 6 - 리뷰 및 평점 시스템 구현

1.  **기능 구현 9: 리뷰 및 평점 시스템 (Review & Rating System)**
    *   **백엔드:**
        *   `db/reviews.json` 파일 생성.
        *   `Review.ts` 모델 정의.
        *   `reviewController.ts`를 생성하여 리뷰 생성(`createReview`) 및 조회(`getReviewsForCaravan`) 로직 구현.
        *   `reviewRoutes.ts`와 `caravanRoutes.ts`에 각각 리뷰 생성(`POST /api/reviews`) 및 조회(`GET /api/caravans/:id/reviews`) 라우트 추가.
    *   **프론트엔드:**
        *   `MyReservationsPage.tsx`에 'confirmed' 상태의 예약에 대해 "Write Review" 버튼 추가.
        *   리뷰 작성을 위한 `ReviewPage.tsx` 생성.
        *   카라반 상세 정보와 모든 리뷰 목록, 평균 평점을 표시하는 `CaravanDetailPage.tsx` 생성.
        *   `App.tsx`에 새로운 페이지들을 위한 라우트 추가.
        *   `CaravanCard.tsx`의 "자세히 보기" 버튼이 `CaravanDetailPage`로 연결되도록 수정.
    *   **(Troubleshooting):** `ReviewPage.tsx`와 `CaravanDetailPage.tsx`에서 API 호출 시 절대 경로 대신 상대 경로를 사용하여 발생한 '데이터 형식 불일치' 오류 해결.

2.  **버전 관리 (Version Control)**
    *   `git add .`를 통해 모든 변경사항 스테이징.
    *   `feat: 리뷰 및 평점 시스템 구현 (AI-assisted)` 메시지로 커밋 완료.

3.  **최종 결과 (Outcome)**
    *   게스트가 예약 완료 건에 대해 리뷰와 평점을 남길 수 있는 기능 구현 완료.
    *   카라반 상세 페이지에서 해당 카라반의 모든 리뷰와 평균 평점을 확인할 수 있음.
    *   이로써 `GEMINI.md`에 정의된 MVP의 모든 핵심 기능 구현이 완료됨.

#### Session 14 - 백엔드 리팩토링

1.  **리팩토링: DB 접근 로직 중앙화 (Centralize DB Access Logic)**
    *   **목표:** 각 컨트롤러에 중복되어 있던 파일 시스템(fs) 기반의 데이터 읽기/쓰기 함수들을 하나의 유틸리티 파일로 통합하여 코드 중복을 제거하고 유지보수성을 향상.
    *   **작업:**
        *   `server/src/db/utils.ts` 파일 생성.
        *   `readData<T>(fileName: string)`와 `writeData<T>(fileName: string, data: T[])`라는 제네릭 함수를 구현하여 모든 JSON 파일에 대한 읽기/쓰기 작업을 처리.
        *   `caravanController.ts`, `reservationController.ts`, `reviewController.ts`, `userController.ts`에서 기존의 `fs.readFile`, `fs.writeFile` 관련 코드를 모두 제거.
        *   각 컨트롤러에서 `db/utils.ts`의 `readData`와 `writeData` 함수를 `import`하여 사용하도록 수정.
    *   **결과:**
        *   백엔드 코드의 중복성이 크게 감소하고, 데이터베이스 관련 로직이 한 곳에서 관리되어 가독성과 유지보수성이 향상됨.
        *   향후 실제 데이터베이스(예: MySQL, MongoDB)로 전환 시, `db/utils.ts` 파일만 수정하면 되므로 마이그레이션이 용이해짐.

2.  **버전 관리 (Version Control)**
    *   리팩토링된 컨트롤러 파일들과 새로운 `utils.ts` 파일을 스테이징.
    *   `refactor: Centralize DB access in server controllers (AI-assisted)` 메시지로 커밋 및 푸시 완료.

3.  **중간 결과 (Outcome)**
    *   백엔드 코드 구조가 더 깔끔하고 효율적으로 개선됨.
    *   기능 변경 없이 코드 품질을 향상시키는 리팩토링의 좋은 사례를 학습하고 적용함.

#### Session 15 - 프론트엔드 리팩토링 `useFetch` 훅 도입

1.  **리팩토링: `useFetch` 커스텀 훅 도입 및 페이지 적용**
    *   **목표:** 프론트엔드에서 반복적으로 사용되는 API 데이터 호출 로직(`fetch` 또는 `axios` 사용)을 `useFetch`라는 재사용 가능한 커스텀 훅으로 추상화하여 코드 중복을 줄이고, 로딩 및 에러 처리 로직을 중앙화하여 가독성과 유지보수성을 향상.
    *   **작업:**
        *   `client/src/hooks/useFetch.ts` 파일 생성.
        *   `axios` 라이브러리를 사용하여 API 호출을 수행하고, `loading`, `error`, `data` 상태를 관리하며, 데이터 재요청(`refetch`) 기능을 포함하는 `useFetch` 훅 구현.
        *   `useFetch` 훅이 `url`이 `null`일 경우 API 호출을 수행하지 않도록 로직을 개선하여, 조건부 데이터 페칭 시 발생할 수 있는 타입 오류를 해결.
        *   `client/src/pages/CaravansPage.tsx`, `client/src/pages/CaravanDetailPage.tsx`, `client/src/pages/ProfilePage.tsx`에서 기존의 `useEffect` 기반 데이터 페칭 로직을 `useFetch` 훅 사용으로 대체.
        *   각 페이지에서 `Caravan`, `Review`, `User` 인터페이스를 `client/src/models` 디렉토리에서 임포트하여 사용하도록 수정.
        *   `client` 디렉토리에 `axios` 라이브러리 설치.
    *   **결과:**
        *   프론트엔드 컴포넌트의 데이터 페칭 로직이 간결해지고, 관심사 분리가 명확해져 코드의 재사용성과 테스트 용이성이 증대됨.
        *   로딩 및 에러 상태 관리가 일관된 방식으로 처리되어 사용자 경험이 개선됨.

2.  **버전 관리 (Version Control)**
    *   `client/src/hooks/useFetch.ts`, `client/src/pages/CaravansPage.tsx`, `client/src/pages/CaravanDetailPage.tsx`, `client/src/pages/ProfilePage.tsx`, `client/src/models/Review.ts`, `client/src/models/User.ts`, `client/package.json`, `client/package-lock.json` 파일 변경사항 스테이징.
    *   `refactor(client): Implement useFetch hook and refactor pages (AI-assisted)` 메시지로 커밋 및 푸시 완료.

3.  **중간 결과 (Outcome)**
    *   프론트엔드 코드의 구조가 개선되고, 데이터 페칭 로직이 효율적으로 관리됨.
    *   리팩토링을 통해 코드 품질을 높이는 동시에, 향후 기능 확장을 위한 견고한 기반을 마련함.

#### Session 16 - 추가 프론트엔드 리팩토링

1.  **리팩토링: `useFetch` 훅 추가 적용**
    *   **목표:** `useFetch` 훅을 아직 적용하지 않은 나머지 페이지들에도 일관되게 적용하여 코드 품질을 높이고, 데이터 페칭 로직을 통일.
    *   **작업:**
        *   `client/src/pages/CaravanEditPage.tsx`, `client/src/pages/HostDashboardPage.tsx`, `client/src/pages/MyReservationsPage.tsx`, `client/src/pages/PaymentHistoryPage.tsx`, `client/src/pages/ReviewPage.tsx`에 `useFetch` 훅을 적용하여 데이터 페칭 로직을 리팩토링.
        *   각 페이지에서 로딩 및 에러 상태를 적절히 처리하도록 JSX 코드 수정.
        *   `client/src/models/Reservation.ts` 모델 파일을 생성하여 타입 정의를 공유.
    *   **결과:**
        *   프로젝트 전반에 걸쳐 데이터 페칭 코드가 `useFetch` 훅으로 통일되어 일관성이 확보됨.
        *   모든 데이터 관련 페이지에서 로딩 스피너와 에러 메시지가 일관되게 표시되어 사용자 경험이 개선됨.

2.  **버전 관리 (Version Control)**
    *   리팩토링된 페이지들과 `Reservation.ts` 모델 파일을 스테이징.
    *   `refactor(client): Apply useFetch hook to remaining pages (AI-assisted)` 메시지로 커밋 및 푸시 완료.

3.  **중간 결과 (Outcome)**
    *   프론트엔드 리팩토링 작업이 성공적으로 마무리됨.
    *   이제 코드는 더 높은 수준의 추상화를 통해 유지보수가 용이해졌으며, 다음 단계인 UI/UX 개선 작업을 진행할 준비가 완료됨.


### Day 4 (2025.11.20)

#### Session 17 - UI 현지화 (Localization) 및 오류 수정

1.  **UI 현지화: 전체 애플리케이션 UI 한국어 번역**
    *   **목표:** 사용자 경험을 개선하고 한국어 사용자에게 더 친숙한 환경을 제공하기 위해 클라이언트 애플리케이션의 모든 사용자 대면 텍스트를 한국어로 번역.
    *   **작업:**
        *   `client/src/pages` 및 `client/src/components` 디렉토리 내의 모든 `.tsx` 파일에서 영어 텍스트를 식별하고 한국어로 번역.
        *   `SignupPage.tsx`, `LoginPage.tsx`, `CaravanEditPage.tsx`, `CaravanRegistrationPage.tsx`, `CaravansPage.tsx`, `HostDashboardPage.tsx`, `MyReservationsPage.tsx`, `PaymentHistoryPage.tsx`, `PaymentPage.tsx`, `ProfilePage.tsx`, `ReviewPage.tsx` 등 주요 페이지 및 컴포넌트 파일의 텍스트 필드, 버튼 텍스트, 메시지, 플레이스홀더 등을 번역.
        *   `HomePage.tsx`와 `Header.tsx`에 표시되는 "카라반쉐어" 브랜딩을 "CaravanShare"로 변경.
    *   **결과:**
        *   애플리케이션의 UI가 전면적으로 한국어로 번역되어 한국어 사용자에게 최적화된 환경을 제공.

2.  **오류 수정: `PaymentPage.tsx` 구문 오류 해결**
    *   **목표:** `PaymentPage.tsx` 파일에서 발생한 `Unterminated string literal` 구문 오류를 수정하여 애플리케이션의 컴파일 오류를 해결.
    *   **작업:**
        *   `client/src/pages/PaymentPage.tsx` 파일의 `Alert` 컴포넌트 `variant` prop에서 발생한 문자열 종료 오류 수정.
    *   **결과:**
        *   `PaymentPage.tsx`의 컴파일 오류가 해결되어 애플리케이션이 정상적으로 빌드 및 실행 가능하게 됨.

3.  **모델 업데이트: 예약 상태 타입 확장**
    *   **목표:** 예약 상태 타입에 'cancelled' 옵션을 추가하여 예약 취소 기능을 지원하고, 관련 컴파일 오류를 해결.
    *   **작업:**
        *   `client/src/models/Reservation.ts` 및 `server/src/models/Reservation.ts` 파일의 `Reservation` 인터페이스에 `status` 속성에 `'cancelled'` 값을 추가.
        *   `HostDashboardPage.tsx` 및 `MyReservationsPage.tsx`의 `getStatusText` 헬퍼 함수에서 `cancelled` 상태에 대한 처리 로직 추가.
    *   **결과:**
        *   예약 취소 상태를 시스템에서 올바르게 관리할 수 있게 되었으며, 관련 컴파일 오류가 해결됨.

4.  **데이터 관리: 특정 카라반 삭제**
    *   **목표:** "바닷가 뷰 카라반" 데이터를 시스템에서 삭제.
    *   **작업:**
        *   `server/db/caravans.json` 파일에서 "바닷가 뷰 카라반"의 ID(`c2`)를 확인.
        *   `curl -X DELETE http://localhost:3001/api/caravans/c2` 명령을 사용하여 해당 카라반을 삭제.
    *   **결과:**
        *   요청된 특정 카라반 데이터가 시스템에서 성공적으로 삭제됨.

5.  **버전 관리 (Version Control)**
    *   UI 현지화, 오류 수정, 모델 업데이트, 브랜딩 변경, 카라반 삭제에 관련된 모든 변경사항을 스테이징.
    *   `feat: Translate UI to Korean and update models` 메시지로 커밋 완료.

6.  **최종 결과 (Outcome)**
    *   사용자 인터페이스가 한국어로 완벽하게 현지화되었으며, 중요한 오류가 수정되고 데이터 모델이 확장됨.
    *   핵심 브랜딩이 일관성 있게 변경되었으며, 불필요한 데이터가 제거됨.

#### Session 18 - 라우팅 문제 해결 및 데이터 정리 (AI-assisted)

1.  **초기 문제 확인:**
    *   `GET http://localhost:3001/api/users/a40161fd-edc1-427e-a19c-8c8ba43f0972 404 (Not Found)` 오류 발생. (카라반 상세 페이지에서 호스트 정보 로딩 중)
    *   `POST http://localhost:3001/api/auth/signup 404 (Not Found)` 오류 발생. (회원가입 시도 시)
    *   `POST http://localhost:3001/api/auth/login 404 (Not Found)` 오류 발생. (로그인 시도 시)
    *   클라이언트가 JSON 응답을 기대했지만 HTML 응답을 받아 "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" 오류 발생.

2.  **원인 분석 및 해결:**
    *   `server/src/index.ts`에서 `userRoutes`가 `/api/auth` 경로로 마운트되어 있어, 클라이언트가 `/api/users` 경로로 요청할 때 404 오류가 발생함을 확인.
    *   **해결:** `server/src/index.ts` 파일을 수정하여 `app.use('/api/auth', userRoutes);`를 `app.use('/api/users', userRoutes);`로 변경.
    *   `client/src/pages/LoginPage.tsx` 파일에서 로그인 엔드포인트를 `http://localhost:3001/api/auth/login`에서 `http://localhost:3001/api/users/login`으로 수정.
    *   `client/src/pages/SignupPage.tsx` 파일에서 회원가입 엔드포인트를 `http://localhost:3001/api/auth/signup`에서 `http://localhost:3001/api/users/signup`으로 수정.

3.  **데이터 정리 요청 처리:**
    *   사용자 요청에 따라 `server/db/caravans.json` 파일에서 "ex카라반" (ID: `c7d07df5-79ab-4985-84c1-fec31bbcc00e`) 항목을 삭제.
    *   사용자 요청에 따라 예약 테스트를 위해 `server/db/reservations.json` 파일의 모든 내용을 빈 배열 `[]`로 초기화.

4.  **디버깅 및 임시 경로 관리:**
    *   서버 실행 여부 확인을 위해 `server/src/index.ts`에 임시 경로 `/test-users-json`을 추가했으나, 이후 원인 파악 및 수정이 완료되어 해당 임시 경로를 제거.

5.  **버전 관리 (Version Control):**
    *   `client/src/pages/LoginPage.tsx`, `client/src/pages/SignupPage.tsx`, `server/db/caravans.json`, `server/db/reservations.json`, `server/db/reviews.json`, `server/db/users.json`, `server/src/controllers/reviewController.ts`, `server/src/controllers/userController.ts`, `server/src/db/caravans.json`, `server/src/db/users.json`, `server/src/index.ts` 파일의 모든 변경사항을 스테이징.
    *   `Feat: 클라이언트 및 서버 설정 업데이트 및 데이터 정리 (AI-assisted)` 메시지로 커밋 완료.

6.  **결론 및 다음 단계:**
    *   주요 라우팅 및 클라이언트 엔드포인트 불일치 문제는 해결되었으며, 데이터 정리 요청도 처리됨.
    *   여전히 `CaravanDetailPage.tsx`에서 사용자 데이터 fetch 시 404 오류가 발생하는 현상이 보고되고 있으며, 이는 서버가 최신 코드로 제대로 재시작되지 않았거나 브라우저 캐시 문제일 가능성이 높음.
    *   **다음 단계:** 서버와 클라이언트 애플리케이션을 모두 완전히 재시작하고 웹 페이지를 새로고침하여 최종 확인이 필요.


### Day 5-6 (2025.11.21-22)

#### Session 19 - 백엔드 아키텍처 리팩토링 (AI-assisted)

1.  **초기 코드 분석:**
    *   `GEMINI.md`에 명시된 "나쁜 설계 예시" 및 "바이브코딩 실전 과제"를 기준으로 기존 백엔드 코드를 분석했습니다.
    *   주요 문제점:
        *   **단일 책임 원칙(SRP) 위반:** 컨트롤러가 비즈니스 로직, 데이터 접근 로직, 요청/응답 처리 등 너무 많은 역할을 담당하고 있었습니다. (예: `userController.ts`의 `updateTrustScore`, `reservationController.ts`의 복잡한 날짜 중복 확인 로직)
        *   **낮은 응집도 및 강한 결합도:** 컨트롤러 간 직접적인 호출(예: `reviewController.ts`에서 `userController.ts`의 `updateTrustScore` 호출)과 파일 기반 데이터 접근 로직(`readData`, `writeData`)에 대한 강한 의존성.
        *   **비효율적인 검색:** 데이터 배열에 대한 O(n) 순회 방식의 검색 로직이 광범위하게 사용되고 있어, 대규모 데이터 처리 시 성능 저하가 예상되었습니다.
        *   **낮은 테스트 용이성:** 의존성이 강하게 결합되어 있어 단위 테스트를 작성하기 어려웠습니다.
        *   **불완전한 에러 처리:** 기본적인 HTTP 상태 코드 반환만 있었을 뿐, 구체적인 예외 클래스가 정의되어 있지 않았습니다.
        *   **서비스 및 리포지토리 계층 부재:** `server/src/services` 디렉토리가 비어 있었으며, 이는 위 문제점들의 근본적인 원인이었습니다.

2.  **리팩토링 계획 수립:**
    *   `GEMINI.md`의 "바이브코딩 실전 과제"를 해결하기 위해 다음과 같은 리팩토링 계획을 수립했습니다.
        *   **예외 클래스 정의:** `AppError`를 상속받는 `NotFoundError`, `BadRequestError`, `ConflictError`, `UnauthorizedError` 등 커스텀 예외 클래스 도입.
        *   **리포지토리(Repository) 계층 도입:** `JsonFileRepository`를 기반으로 하는 `UserRepository`, `CaravanRepository`, `ReservationRepository`, `ReviewRepository` 구현. 데이터 접근 로직을 캡슐화하고 효율적인 데이터 처리를 위한 기반 마련. `ReservationRepository`에는 날짜 충돌 확인 로직 포함.
        *   **서비스(Service) 계층 도입:** `UserService`, `CaravanService`, `ReservationService`, `ReviewService` 구현. 각 서비스는 핵심 비즈니스 로직을 담당하며, 리포지토리 및 다른 서비스와의 상호작용은 의존성 주입을 통해 이루어지도록 설계. 특히 `UserService`에 `bcryptjs`를 이용한 비밀번호 처리 및 `updateTrustScore` 로직 이동.
        *   **컨트롤러(Controller) 리팩토링:** 기존 컨트롤러들을 얇게(Thin Controller) 만들어 요청 파싱 및 서비스 호출, 예외 처리 및 응답 포맷팅만 담당하도록 변경.
        *   **의존성 주입(DI) 적용:** 컨트롤러-서비스-리포지토리 간 의존성을 느슨하게 만들어 테스트 용이성 및 유연성 확보.
        *   **디자인 패턴 적용:** 리포지토리 패턴 도입.

3.  **리팩토링 구현:**
    *   `server/src/exceptions` 디렉토리 생성 및 `AppError.ts`, `NotFoundError.ts`, `BadRequestError.ts`, `ConflictError.ts`, `UnauthorizedError.ts`, `index.ts` 파일 생성.
    *   `server/src/repositories` 디렉토리 생성 및 `JsonFileRepository.ts`, `UserRepository.ts`, `CaravanRepository.ts`, `ReservationRepository.ts`, `ReviewRepository.ts` 파일 생성. `JsonFileRepository`의 `filePath` 설정 오류 수정.
    *   `server/src/services` 디렉토리 생성 및 `UserService.ts`, `CaravanService.ts`, `ReservationService.ts`, `ReviewService.ts` 파일 생성. `UserService`에 `bcryptjs` 의존성 추가.
    *   `server` 디렉토리에서 `npm install bcryptjs @types/bcryptjs` 실행하여 필요한 라이브러리 설치.
    *   `userController.ts`, `caravanController.ts`, `reviewController.ts`, `reservationController.ts` 파일의 내용을 새로 정의된 서비스 및 리포지토리 계층을 활용하도록 전면 수정.
    *   각 컨트롤러 핸들러는 `try-catch` 블록으로 감싸 `AppError` 인스턴스를 catch하여 적절한 HTTP 응답을 반환하도록 처리.

4.  **버전 관리 (Version Control):**
    *   `refactor/service-repository-layer` 브랜치 생성 및 전환.
    *   `GEMINI.md`의 최종 변경사항을 `main` 브랜치에 커밋.
    *   모든 리팩토링 변경사항을 스테이징하고 `feat(server): Refactor to use service and repository layers (AI-assisted)` 메시지로 커밋.
    *   `refactor/service-repository-layer` 브랜치를 원격 저장소에 푸시.

5.  **결과 및 다음 단계:**
    *   백엔드 코드는 이제 `GEMINI.md`의 "바이브코딩 실전 과제" 요구사항을 충족하는 아키텍처를 갖추게 되었습니다. SRP 준수, 높은 응집도, 느슨한 결합, 개선된 에러 처리 메커니즘을 통해 유지보수성, 확장성, 테스트 용이성이 크게 향상되었습니다.
    *   다음 단계는 이 리팩토링된 백엔드에 맞춰 클라이언트 코드를 업데이트하고, 단위 테스트를 추가하는 작업이 될 것입니다.


#### Session 20 - 클라이언트 API 통신 및 오류 처리 개선 (AI-assisted)

1.  **문제 분석:**
    *   백엔드 리팩토링 후, 클라이언트 측에서 API 호출 시 "Network Error" 및 `404 (Not Found)`, `500 (Internal Server Error)` 오류가 발생했습니다.
    *   특히 `server/db/db/users.json` 경로 오류(`ENOENT`)가 발견되어 서버가 JSON 파일을 올바르게 읽고 쓰지 못하는 문제가 확인되었습니다.
    *   또한, 기존 사용자 계정의 비밀번호가 새로운 `bcryptjs` 해싱 방식과 호환되지 않아 로그인 문제가 발생했습니다.
    *   클라이언트의 `useFetch` 훅은 백엔드에서 발생한 구조화된 `AppError`를 제대로 파싱하지 못하고 일반 `Error` 객체로 처리하여, 오류 메시지 및 HTTP 상태 코드에 따른 세밀한 클라이언트 측 처리가 어려웠습니다.

2.  **원인 진단 및 해결:**

    *   **서버 JSON 파일 경로 오류 해결:** `server/src/repositories/JsonFileRepository.ts`에서 `filePath`를 `db/${fileName}`으로 구성한 부분이 `server/src/db/utils.ts`의 `dbDirectory`와 중복되어 `server/db/db/users.json`과 같은 잘못된 경로가 생성되었음을 확인했습니다. `JsonFileRepository.ts`의 `filePath`를 다시 `fileName`만 사용하도록 수정하여 경로 문제를 해결했습니다。
    *   **이전 사용자 계정 로그인 문제 해결:** 백엔드의 새로운 비밀번호 해싱 방식(`bcryptjs`)과 이전 계정 비밀번호(`hashed_password`와 같은 플레이스홀더) 간의 비호환성으로 인한 문제임을 파악했습니다. 사용자에게 새로운 계정을 사용하거나, `server/db/users.json`에서 새 계정의 `password_hash`를 복사하여 이전 계정에 수동으로 적용하는 방법을 안내했습니다. 이 과정을 통해 기존 계정으로도 로그인이 가능해졌습니다。
    *   **클라이언트 `useFetch` 훅 개선 계획:** 백엔드에서 반환하는 HTTP 상태 코드와 메시지를 활용하여 클라이언트 측에서 오류를 더 효과적으로 처리할 수 있도록 `client/src/hooks/useFetch.ts` 훅을 개선하기로 계획했습니다。

3.  **클라이언트 `useFetch` 훅 리팩토링:**
    *   **목표:** `useFetch` 훅에서 백엔드의 구조화된 오류 응답(`AppError`로 인한 `message` 및 `statusCode`)을 정확하게 파싱하고, 컴포넌트에게 더 유용한 오류 정보를 제공하여 세밀한 에러 처리를 가능하게 합니다。
    *   **작업 내용:**
        *   `FetchError` 인터페이스를 새로 정의하여 `statusCode`, `message`, `isAxiosError` 필드를 포함하도록 했습니다。
        *   `useFetch` 훅의 `error` 상태 타입을 `FetchError | null`로 변경했습니다。
        *   `catch` 블록 내에서 `axios` 오류 여부를 확인하고, 오류 응답이 있을 경우 `axiosError.response.status`와 `axiosError.response.data.message`를 추출하여 `FetchError` 객체를 생성하도록 로직을 수정했습니다。
        *   네트워크 연결 오류(`axiosError.request`) 및 기타 오류 상황에 대한 처리도 추가했습니다。
    *   **결과:** 클라이언트 측에서 서버에서 발생하는 다양한 오류 상황에 대해 HTTP 상태 코드와 구체적인 메시지를 기반으로 더 유연하고 사용자 친화적인 에러 처리를 구현할 수 있는 기반이 마련되었습니다。

4.  **버전 관리 (Version Control):**
    *   `client/src/hooks/useFetch.ts` 파일 변경사항을 스테이징。
    *   업데이트된 개발 일지 파일 스테이징。
    *   `refactor(client): Improve useFetch error handling and fix server path error (AI-assisted)` 메시지로 커밋 예정。

5.  **결과 및 다음 단계:**
    *   백엔드와의 통신 문제가 해결되었고, 클라이언트 측에서 서버 오류를 더욱 효과적으로 처리할 수 있는 아키텍처적 개선이 이루어졌습니다。
    *   다음 단계는 이 개선된 `useFetch` 훅을 클라이언트의 각 페이지 및 컴포넌트에 적용하여 실제 오류 메시지를 사용자에게 표시하고, 사용자 경험을 향상시키는 작업이 될 것입니다。


#### Session 21- 백엔드 유닛 테스트 및 Payment 도메인 분리 완료 (AI-assisted)

1.  **초기 문제 및 목표 설정:**
    *   "바이브코딩 실전 과제" 중 "과제 6: 테스트 가능한 코드 작성 (최소 70% 테스트 커버리지)" 및 "과제 1: 깨끗한 도메인 모델 설계 (Payment 도메인 분리)"가 주요 미완료 과제로 식별되었습니다。
    *   목표는 Jest를 사용하여 모든 리포지토리 및 서비스 계층에 대한 단위 테스트를 구현하고, Payment 도메인을 독립적인 모델/리포지토리/서비스로 완전히 분리하는 것이었습니다。

2.  **테스트 환경 설정 및 리포지토리/서비스 단위 테스트:**
    *   Jest 테스트 프레임워크(`jest`, `ts-jest`, `@types/jest`)를 `server` 디렉토리에 설치하고, `jest.config.js`를 구성했습니다。 `package.json`의 `test` 스크립트를 `jest --detectOpenHandles`로 업데이트했습니다。
    *   `server/src/__tests__` 디렉토리를 생성하고 모든 리포지토리 (`UserRepository`, `CaravanRepository`, `ReservationRepository`, `ReviewRepository`) 및 서비스 (`UserService`, `CaravanService`, `ReservationService`, `ReviewService`, `PaymentService`)에 대한 단위 테스트를 작성했습니다。
    *   각 테스트는 의존성(파일 시스템, 다른 리포지토리/서비스, `bcryptjs`, `crypto.randomUUID`)을 모킹하여 격리된 환경에서 비즈니스 로직의 정확성을 검증했습니다。 `UserRepository.test.ts` 및 `UserService.test.ts`의 초기 타입 오류를 해결하고, `CaravanService.test.ts`의 `createCaravan` 메서드 시그니처 및 테스트 내 `caravanData` 타입 불일치를 수정했습니다。 `ReservationService.test.ts`의 `PaymentService` 주입 관련 생성자 호출 오류를 수정했습니다。 모든 테스트는 성공적으로 통과했습니다。

3.  **Payment 도메인 분리:**
    *   **`Payment.ts` 모델 생성:** `server/src/models/Payment.ts`에 결제 정보(`reservationId`, `amount`, `paymentDate`, `status`, `transactionId`)를 정의했습니다。
    *   **`PaymentRepository.ts` 구현:** `JsonFileRepository`를 상속하여 `payments.json` 파일 기반의 Payment 데이터 접근을 담당하도록 구현했습니다。 `findByReservationId`, `findByStatus` 메서드를 추가했습니다。
    *   **`PaymentService.ts` 구현:** `PaymentRepository`와 `ReservationRepository`에 의존하여 결제 처리(`processPayment`), 특정 예약에 대한 결제 조회(`getPaymentByReservationId`), 사용자별 결제 내역 조회(`getPaymentHistoryByUserId`) 로직을 구현했습니다。
    *   **`ReservationService` 및 `ReservationController` 업데이트:** Payment 관련 로직을 `PaymentService`에 위임하도록 수정하고, `ReservationService` 생성자에 `PaymentService`를 주입하도록 변경했습니다。

4.  **버전 관리 (Version Control):**
    *   Jest 설정 파일, 모든 단위 테스트 파일, 새로운 Payment 도메인 파일(model, repository, service), 그리고 Payment 도메인 통합을 위한 `ReservationService` 및 `ReservationController`의 수정 사항을 스테이징 및 커밋했습니다。 (커밋 메시지: `feat(server): Complete unit tests for all repositories and services; feat(server): Implement Payment domain; refactor(server): Update ReservationService and Controller for PaymentService (AI-assisted)`)

5.  **결과 및 다음 단계:**
    *   "과제 6: 테스트 가능한 코드 작성"의 모든 단위 테스트가 완료되어 백엔드 비즈니스 로직 및 데이터 접근 계층에 대한 테스트 커버리지를 확보했습니다。
    *   "과제 1: 깨끗한 도메인 모델 설계"의 Payment 도메인 분리가 완료되어 백엔드 아키텍처의 응집도가 더욱 향상되었습니다。
    *   다음 단계는 "과제 2: 복잡한 비즈니스 로직 분리 - `ReservationValidator` 클래스 도입"을 진행할 예정입니다。


#### Session 22 - `ReservationValidator` 클래스 도입 (AI-assisted)

1.  **문제 및 목표 설정:**
    *   "바이브코딩 실전 과제" 중 "과제 2: 복잡한 비즈니스 로직 분리"는 예약 검증 로직을 명확하게 분리하고 독립적으로 테스트 가능하게 하는 것을 목표로 합니다. 이전 리팩토링에서 `ReservationService` 내에 예약 날짜 유효성 검사 및 중복 예약 확인 로직이 포함되어 있었습니다.

2.  **`ReservationValidator` 클래스 구현:**
    *   `server/src/services/ReservationValidator.ts` 파일을 생성했습니다。
    *   이 클래스는 `ReservationRepository`를 주입받아 사용합니다。
    *   `validateReservationDates(startDate: string, endDate: string)` 메서드를 구현하여 날짜의 유효성(시작일이 종료일보다 이전인지 등)을 검사합니다。
    *   `checkOverlappingReservations(caravanId: string, startDate: string, endDate: string)` 메서드를 구현하여 특정 카라반에 대한 예약 날짜 중복 여부를 확인합니다。

3.  **`ReservationService` 및 `ReservationController` 업데이트:**
    *   `server/src/services/ReservationService.ts`에 `ReservationValidator`를 임포트하고 생성자를 통해 주입받도록 수정했습니다。
    *   `ReservationService`의 `createReservation` 메서드 내에서 기존의 날짜 유효성 검사 및 중복 예약 확인 로직을 `reservationValidator.validateReservationDates` 및 `reservationValidator.checkOverlappingReservations` 호출로 대체했습니다。
    *   `server/src/controllers/reservationController.ts`에서 `ReservationValidator`를 임포트하고 인스턴스를 생성한 후, `reservationService` 생성자에 주입하도록 변경했습니다。

4.  **결과:**
    *   `ReservationValidator` 클래스 도입을 통해 예약 검증 로직이 `ReservationService`로부터 분리되어 "과제 2: 복잡한 비즈니스 로직 분리"를 성공적으로 이행했습니다。
    *   이로써 `ReservationService`는 핵심 예약 생성 흐름에 집중하고, 유효성 검증은 전용 Validator 클래스에 위임하여 코드의 응집도를 높이고 테스트 용이성이 더욱 향상되었습니다。

5.  **다음 단계:**
    *   남은 "바이브코딩 실전 과제"들을 순차적으로 진행할 예정입니다。


#### Session 23 - 팩토리 패턴 도입 (과제 7: 디자인 패턴 적용 - AI-assisted)

1.  **목표 설정:**
    *   "바이브코딩 실전 과제" 중 "과제 7: 디자인 패턴 적용"의 첫 번째 단계로 "팩토리 패턴"을 `Reservation` 객체 생성에 도입하여 객체 생성 로직을 중앙 집중화하고 코드의 응집도 및 유지보수성을 향상시키는 것이었습니다。

2.  **팩토리 패턴 구현:**
    *   **`ReservationFactory.ts` 클래스 생성:** `server/src/services/ReservationFactory.ts` 파일을 생성했습니다。 이 클래스는 `caravanId`, `guestId`, `startDate`, `endDate`, `totalPrice`, `status`를 인자로 받아 `crypto.randomUUID()`를 사용하여 `id`를 생성하고 `Reservation` 객체를 반환하는 `createReservation` 메서드를 포함합니다。
    *   **`ReservationService` 업데이트:** `server/src/services/ReservationService.ts`에 `ReservationFactory`를 임포트하고 생성자를 통해 주입받도록 수정했습니다。 `createReservation` 메서드 내에서 `Reservation` 객체를 수동으로 생성하던 로직을 `this.reservationFactory.createReservation` 호출로 대체했습니다。
    *   **`ReservationController` 업데이트:** `server/src/controllers/reservationController.ts`에서 `ReservationFactory`를 임포트하고 인스턴스를 생성한 후, `reservationService` 생성자에 주입하도록 변경했습니다。

3.  **결과:**
    *   `Reservation` 객체 생성 로직이 `ReservationFactory`로 분리되어 팩토리 패턴이 성공적으로 도입되었습니다。 이는 객체 생성의 책임 분리를 통해 `ReservationService`의 응집도를 높이고 `Reservation` 객체 생성 방식의 유연성을 확보했습니다。

4.  **다음 단계:**
    *   "과제 7: 디자인 패턴 적용"의 다음 단계인 전략 패턴 또는 옵저버 패턴 구현을 진행할 예정입니다。


#### Session 24 - 전략 패턴 도입 (과제 7: 디자인 패턴 적용 - AI-assisted)

1.  **목표 설정:**
    *   "바이브코딩 실전 과제" 중 "과제 7: 디자인 패턴 적용"의 두 번째 단계로 "전략 패턴"을 예약 총 가격 계산에 도입하여 할인 로직의 유연성과 확장성을 확보하는 것이었습니다。

2.  **전략 패턴 구현:**
    *   **`DiscountStrategy.ts` 정의:** `server/src/services/DiscountStrategy.ts` 파일을 생성하여 `DiscountStrategy` 인터페이스와 함께 구체적인 전략 클래스인 `NoDiscountStrategy`, `PercentageDiscountStrategy`, `FixedAmountDiscountStrategy`를 구현했습니다. 각 전략은 `applyDiscount(originalPrice: number)` 메서드를 가집니다。
    *   **`ReservationService` 업데이트:** `server/src/services/ReservationService.ts`에 `DiscountStrategy`를 임포트하고 생성자를 통해 주입받도록 수정했습니다。 `createReservation` 메서드 내에서 `totalPrice`를 계산할 때, 기존 `(durationInDays * caravan.pricePerDay)`로 계산된 `originalPrice`에 `this.discountStrategy.applyDiscount(originalPrice)`를 적용하도록 변경했습니다。
    *   **`ReservationController` 업데이트:** `server/src/controllers/reservationController.ts`에서 `NoDiscountStrategy`를 임포트하고 인스턴스를 생성한 후, `reservationService` 생성자에 주입하도록 변경했습니다。 (현재는 기본 할인 전략으로 `NoDiscountStrategy`를 사용)

3.  **결과:**
    *   전략 패턴 도입을 통해 예약 가격 계산 시 할인 로직을 쉽게 교체하거나 추가할 수 있는 유연한 구조를 확보했습니다。 이는 "과제 7: 디자인 패턴 적용"의 전략 패턴 부분을 성공적으로 이행했습니다。

4.  **다음 단계:**
    *   "과제 7: 디자인 패턴 적용"의 다음 단계인 옵저버 패턴 구현 또는 남아있는 다른 "바이브코딩 실전 과제"들을 순차적으로 진행할 예정입니다。


#### Session 25 - 옵저버 패턴 도입 (과제 7: 디자인 패턴 적용 - AI-assisted)

1.  **목표 설정:**
    *   "바이브코딩 실전 과제" 중 "과제 7: 디자인 패턴 적용"의 세 번째 단계로 "옵저버 패턴"을 예약 이벤트 알림 시스템에 도입하여 서비스 간의 결합도를 낮추고 알림 로직의 유연성을 확보하는 것이었습니다.

2.  **옵저버 패턴 구현:**
    *   **`ObserverPattern.ts` 유틸리티 정의:** `server/src/utils/ObserverPattern.ts` 파일을 생성하여 `Observer` 인터페이스, `Subject` 인터페이스, 그리고 구체적인 `ConcreteSubject` 클래스를 정의했습니다.
    *   **`NotificationService.ts` 구현:** `server/src/services/NotificationService.ts` 파일을 생성하여 `Observer<ReservationEvent>` 인터페이스를 구현하는 `NotificationService` 클래스를 구현했습니다. 이 서비스는 예약 이벤트를 받아 알림 메시지를 생성하고 콘솔에 기록하는 역할을 합니다.
    *   **`ReservationService` 업데이트:** `server/src/services/ReservationService.ts`에 `ConcreteSubject`와 `NotificationService`를 임포트하고, `NotificationService`를 생성자를 통해 주입받도록 수정했습니다. `ReservationService`는 내부적으로 `ConcreteSubject` 인스턴스를 생성하고, 주입받은 `NotificationService`를 옵저버로 등록했습니다. `createReservation`, `updateReservationStatus`, `confirmPayment` 메서드 내에서 예약 이벤트 발생 시 `this.reservationEventSubject.notify()`를 호출하여 옵저버에게 알림을 보냅니다.
    *   **`ReservationController` 업데이트:** `server/src/controllers/reservationController.ts`에서 `NotificationService`를 임포트하고 인스턴스를 생성한 후, `reservationService` 생성자에 주입하도록 변경했습니다.

3.  **결과:**
    *   옵저버 패턴 도입을 통해 예약 이벤트 발생 시 관련 서비스에 알림을 보내는 시스템을 구축했습니다. 이는 서비스 간의 결합도를 낮추고 알림 로직을 쉽게 확장하거나 변경할 수 있는 유연한 구조를 확보했습니다. 이로써 "과제 7: 디자인 패턴 적용"의 옵저버 패턴 부분을 성공적으로 이행했습니다.

4.  **다음 단계:**
    *   "바이브코딩 실전 과제" 중 남아있는 과제들을 순차적으로 진행할 예정입니다。


#### Session 26 - 프론트엔드/백엔드 데이터 일관성 및 오류 디버깅 (AI-assisted)

1.  **문제 분석:**
    *   백엔드와 프론트엔드 간의 데이터 모델(camelCase vs. snake_case) 불일치로 인해 수많은 타입스크립트 컴파일 오류 및 런타임 오류가 발생했습니다.
    *   특히 `400 Bad Request` (필수 필드 누락) 및 `500 Internal Server Error` (백엔드 로직 오류)가 주를 이뤘습니다.
    *   로그인 기능은 새 사용자에게는 작동하지만, 이전 사용자들은 로그인할 수 없는 문제가 지속되었습니다.

2.  **원인 진단 및 해결:**

    *   **타입스크립트 컴파일 오류 해결:**
        *   **`ReviewService.ts`:** `comment` 필드의 `string | null` 타입 불일치를 `comment || undefined`로 변경하여 해결.
        *   **`userController.ts`:** 회원가입 요청 시 `contact` 필드 누락 문제를 `req.body`에 `contact`를 추가하여 전달하도록 수정.
        *   **`reservationController.ts`:** `camelCase` 속성(`caravanId`, `guestId`, `startDate`, `endDate`)과 `snake_case` 속성(`caravan_id`, `guest_id`, `start_date`, `end_date`) 간의 불일치를 `req.body` 및 `reservationService.createReservation` 호출에서 `snake_case`로 통일하여 해결.
        *   **`ReservationService.ts`:** `start_date.toISOString is not a function` 오류를 `createReservation` 메서드 시작 시 `start_date` 및 `end_date`를 명시적으로 `Date` 객체로 변환하도록 수정.
        *   **`ReservationFactory.ts`:** `camelCase` 속성을 가진 객체를 반환하여 발생한 `QueryFailedError`를 `ReservationFactory`가 `Partial<Reservation>`을 `snake_case` 속성으로 반환하고 날짜 문자열을 `Date` 객체로 변환하도록 수정하여 해결.
        *   **`ReviewPage.tsx`:** 잘못된 `import React, { useState, useEffect } from 'react'` 구문을 `import React, { useState, useEffect } from 'react'`로 수정하여 컴파일 오류 해결.

    *   **데이터베이스 권한 오류 (`QueryFailedError: permission denied for schema public`)**:
        *   `psql` 명령어를 통해 `caravan_user`에게 `caravan_share` 데이터베이스의 `public` 스키마에 대한 모든 권한을 부여하도록 안내하여 해결.

    *   **프론트엔드 런타임 오류 및 백엔드 `400`/`500` 오류 (CamelCase/SnakeCase 불일치):**
        *   **`client/src/models/Caravan.ts` 및 `client/src/models/Reservation.ts`, `client/src/models/Review.ts`:** 백엔드 엔티티와의 일관성을 위해 모든 관련 속성 이름을 `camelCase`에서 `snake_case`로 변경.
        *   **영향받는 프론트엔드 컴포넌트 업데이트:** `CaravanCard.tsx`, `CaravanDetailPage.tsx`, `CaravanEditPage.tsx`, `PaymentHistoryPage.tsx`, `ReviewPage.tsx`, `ProfilePage.tsx`, `CaravanRegistrationPage.tsx`, `CaravansPage.tsx`, `MyReservationsPage.tsx`, `PaymentPage.tsx` 등 `Caravan`, `Reservation`, `Review` 모델의 속성을 사용하는 모든 프론트엔드 파일을 `snake_case`로 통일하여 수정.
        *   **`PaymentHistoryPage.tsx`:** `toLocaleString` 오류를 해결하기 위해 `useFetch`의 반환 타입을 `Reservation[]`에서 `Payment[]`로 변경하고, `Payment` 인터페이스를 인라인으로 정의하며, 데이터 액세스를 `payment.amount` 및 `payment.reservation`을 통해 이루어지도록 수정.

    *   **오류 로깅 강화:** `userController.ts` 및 `reservationController.ts`와 `ReservationService.ts`의 `catch` 블록에서 `console.error(error instanceof Error ? error.stack : error);`를 사용하여 상세 스택 트레이스를 콘솔에 출력하도록 수정.

3.  **결과:**
    *   모든 프론트엔드 컴파일 오류 및 백엔드 런타임 오류가 해결되어 회원가입, 카라반 등록, 예약, 결제 내역 보기, 리뷰 작성 등 핵심 기능이 정상적으로 작동하게 되었습니다.
    *   백엔드와 프론트엔드 간의 데이터 모델 일관성이 크게 향상되었습니다.

4.  **남은 과제 및 다음 단계:**
    *   **이전 사용자 로그인 문제:** 새 사용자는 로그인 가능하지만, 이전 사용자들은 로그인할 수 없는 문제가 남아 있습니다. 이는 데이터베이스에 저장된 이전 사용자 비밀번호 해시의 호환성 문제일 가능성이 높습니다.
    *   **다음 단계:** `psql`을 통해 이전 사용자의 `password_hash` 필드를 직접 검사하고, 필요한 경우 비밀번호를 재설정하는 방안을 모색할 것입니다.

5.  **버전 관리 (Version Control):**
    *   수정된 모든 클라이언트 및 서버 파일 스테이징.
    *   업데이트된 개발 일지 파일 스테이징.
    *   `fix(client, server): Resolve frontend/backend data inconsistency and runtime errors (AI-assisted)` 메시지로 커밋 예정.


### Day 6-7 (2025.11.22-23)

#### Session 27 - 관리자 역할 설정 및 데이터베이스 연결 확인 (AI-assisted)

1.  **문제 분석:**
    *   사용자가 회원가입/로그인 시 `404 Not Found` 오류를 겪고 있었습니다.
    *   또한, 신원 확인 후 "관리자 승인 대기" 메시지가 표시되는데, 관리자(admin)를 어떻게 지정하는지에 대한 문의가 있었습니다.

2.  **원인 진단 및 해결:**
    *   **`404 Not Found` 오류 해결:**
        *   먼저 백엔드 서버가 실행 중인지 확인하기 위해 `curl http://localhost:3001/` 명령을 실행했습니다. `curl: (7) Failed to connect to localhost port 3001 after 0 ms: Connection refused` 오류가 발생하여 서버가 실행되고 있지 않음을 확인했습니다. (사용자가 나중에 서버를 직접 실행함)
        *   사용자가 서버를 실행한 후, `curl` 명령으로 서버가 정상적으로 응답(`Hello from CaravanShare Backend!`)하는 것을 확인하여 `404` 문제는 해결되었습니다.
        *   `curl`을 사용하여 테스트 사용자 생성을 시도했을 때 `{"message":"All fields are required"}` 오류가 발생하여, `userController`의 `signup` 함수가 `role` 필드를 요구함을 확인하고 요청 본문에 `"role": "guest"`를 추가하여 회원가입에 성공했습니다.

    *   **데이터 영속성 및 관리자 지정 방법 확인:**
        *   회원가입 성공 후에도 `server/src/db/users.json` 파일이 비어 있는 것을 확인했습니다.
        *   `server/src/repositories/UserRepository.ts`를 분석한 결과, TypeORM을 통해 데이터베이스에 연결하고 있음을 파악했습니다. `users.json` 파일은 사용되지 않고 있었습니다.
        *   `server/src/data-source.ts` 파일을 검토하여 데이터베이스가 `caravan_share`라는 이름의 PostgreSQL 데이터베이스임을 최종 확인했습니다.

3.  **솔루션 제공:**
    *   사용자 데이터가 PostgreSQL 데이터베이스에 저장되므로, 관리자 역할 부여나 신원 확인 승인과 같은 작업은 데이터베이스에 직접적인 SQL 쿼리를 통해 수행해야 함을 안내했습니다.
    *   **관리자 지정 방법:** `psql`과 같은 PostgreSQL 클라이언트로 데이터베이스에 접속한 후, 다음 SQL 명령어를 사용하여 특정 사용자의 역할을 'admin'으로 변경하도록 안내했습니다.
      ```sql
      UPDATE users SET role = 'admin' WHERE email = 'some_user@example.com';
      ```
    *   **신원 확인 승인 방법:** 유사하게, `identity_verification_status`를 'verified'로 변경하는 SQL 명령어를 안내했습니다.
      ```sql
      UPDATE users SET identity_verification_status = 'verified' WHERE email = 'some_user@example.com';
      ```

4.  **결과 및 다음 단계:**
    *   API `404` 오류의 근본 원인(서버 미실행)을 해결하고, 회원가입이 정상적으로 작동함을 확인했습니다.
    *   데이터가 파일이 아닌 PostgreSQL 데이터베이스에 저장됨을 명확히 하고, 데이터베이스 직접 수정을 통해 관리자 역할을 부여하고 사용자를 승인하는 방법을 사용자에게 안내했습니다.
    *   다음 단계는 사용자가 안내된 방법에 따라 관리자 역할을 설정하고, 신원 확인 기능을 테스트하는 것입니다.

#### Session 28 - 회원 탈퇴 기능 구현 (AI-assisted)

1.  **목표 설정:**
    *   사용자가 자신의 계정을 영구적으로 삭제할 수 있는 '회원 탈퇴' 기능을 구현합니다.
    *   탈퇴 시, 해당 사용자의 프로필 정보, 사용자가 등록한 모든 카라반, 작성한 모든 리뷰, 그리고 관련된 모든 예약 정보가 함께 삭제되어야 합니다.

2.  **백엔드 구현:**
    *   **API 엔드포인트 추가:** `server/src/routes/userRoutes.ts`에 `router.delete('/:id', deleteUser);`를 추가하여 회원 탈퇴를 위한 `DELETE /api/users/:id` 엔드포인트를 정의했습니다.
    *   **컨트롤러 로직 추가:** `server/src/controllers/userController.ts`에 `deleteUser` 컨트롤러 함수를 구현했습니다. 이 함수는 요청 파라미터에서 `id`를 받아 `userService.deleteUser(id)`를 호출합니다.
    *   **서비스 로직 구현 (핵심):**
        *   `server/src/services/UserService.ts`의 생성자를 수정하여 `CaravanRepository`, `ReviewRepository`, `ReservationRepository`를 주입받도록 변경했습니다. 이에 따라 `userController.ts`의 `UserService` 인스턴스 생성 로직도 수정되었습니다.
        *   `deleteUser(userId: string)` 메서드를 구현했습니다. 이 메서드는 데이터 무결성을 보장하기 위해 다음과 같은 순서로 연관 데이터를 삭제합니다.
            1.  사용자가 호스트인 모든 카라반을 조회합니다.
            2.  해당 카라반과 관련된 모든 예약을 삭제합니다.
            3.  카라반을 삭제합니다.
            4.  사용자가 게스트로서 생성한 모든 예약을 삭제합니다.
            5.  사용자가 작성한 모든 리뷰를 삭제합니다.
            6.  마지막으로 사용자 레코드를 삭제합니다.

3.  **프론트엔드 구현:**
    *   **`ProfilePage.tsx` 수정:**
        *   `client/src/pages/ProfilePage.tsx`의 하단에 '계정 관리' 섹션을 추가하고, '회원 탈퇴' 버튼(`variant="danger"`)을 배치했습니다.
        *   `handleDeleteAccount` 함수를 구현했습니다. 이 함수는 다음을 수행합니다:
            1.  `window.confirm`을 통해 사용자에게 삭제 작업을 재확인합니다.
            2.  사용자가 확인하면 백엔드의 `DELETE /api/users/:id` 엔드포인트로 API 요청을 보냅니다.
            3.  요청이 성공하면, `localStorage`에서 사용자 정보를 제거하고, 사용자에게 성공 메시지를 알린 후 홈페이지(`/`)로 리디렉션합니다.
            4.  실패 시, 오류 메시지를 화면에 표시합니다.

4.  **결과 및 다음 단계:**
    *   사용자가 자신의 프로필 페이지에서 안전하게 계정을 삭제할 수 있는 전체 기능이 구현되었습니다.
    *   백엔드는 연관된 모든 데이터를 함께 삭제하여 데이터베이스의 무결성을 유지합니다.

#### Session 29 - 카카오 OAuth 인증 구현 (사용자 역할 선택 및 데이터 일관성)

1.  **초기 문제 확인:**
    *   사용자가 카카오로 로그인했을 때 "내 예약" 페이지가 보이지 않는 문제가 발생했습니다.

2.  **원인 진단 및 해결:**
    *   **사용자 역할 누락:** 카카오 로그인 후 클라이언트로 리디렉션될 때, `HomePage.tsx`에서 `userId`만 `localStorage`에 저장하고 `role` 정보가 누락되어 `Header.tsx`에서 "내 예약" 링크를 조건부 렌더링하지 못하는 문제였습니다.
    *   **해결:**
        *   `server/src/controllers/userController.ts`의 `kakaoCallback` 함수에서, 기존 카카오 사용자의 경우 리디렉션 URL에 `user.id`와 함께 `user.role`도 포함하도록 수정했습니다: `res.redirect(`http://localhost:3000/?userId=${user.id}&role=${user.role}`);`.
        *   `client/src/pages/HomePage.tsx`에서 URL 쿼리 파라미터에서 `userId`와 `role`을 모두 추출하여 `localStorage.setItem('userInfo', JSON.stringify({ id: userId, name: '카카오 사용자', role: role || 'guest' }));`와 같이 `localStorage`에 저장하도록 수정했습니다. 이로써 `userInfo` 객체가 `id`, `name`, `role`을 모두 포함하게 되어 `Header` 컴포넌트가 올바른 사용자 역할을 인식하고 "내 예약" 링크를 표시할 수 있게 되었습니다.

3.  **결과 및 다음 단계:**
    *   카카오 로그인 사용자가 이제 "내 예약" 페이지를 정상적으로 볼 수 있게 되었습니다.

---

## Day 8 : 2025-11-24

### Session 30: 로그인 버튼 디자인 개선 (카카오, 네이버, 구글)

### Description:
로그인 페이지의 소셜 로그인 버튼들의 디자인을 통일하고, 각 플랫폼의 브랜드 색상에 맞춰 시각적인 개선을 진행했습니다.

### Changes Made:

*   **`client/src/pages/LoginPage.tsx` 수정:**
    *   **카카오 로그인 버튼:** 기존 로고 이미지를 제거하고 텍스트만 남겼습니다. `variant`를 'warning'으로 설정하여 노란색 배경을 적용했습니다.
    *   **네이버 로그인 버튼:** 기존 로고 이미지를 제거하고 텍스트만 남겼습니다. `variant`를 'success'로 설정하여 초록색 배경을 적용했습니다.
    *   **구글 로그인 버튼:** 기존 로고 이미지를 제거하고 텍스트만 남겼습니다. `variant`를 'light'로 설정하고 `className="border"`를 추가하여 흰색 배경과 테두리를 적용했습니다.

### 테스트 결과:
- 로그인 페이지의 카카오, 네이버, 구글 버튼이 요청된 디자인에 맞춰 성공적으로 변경되었습니다. 시각적으로 통일감 있고 깔끔한 디자인을 제공합니다.

---



### Session 31: 회원 탈퇴 시 발생하는 `QueryFailedError` 해결

### 설명:
사용자가 회원 탈퇴 시 `QueryFailedError: update or delete on table "reservations" violates foreign key constraint "FK_9ed5ff4942e09edfd44ee0ccf01" on table "payments"` 오류가 발생하는 문제를 해결했습니다. 이 오류는 `reservations` 테이블에서 레코드를 삭제할 때, 해당 예약에 연결된 `payments` 테이블의 레코드가 외래 키 제약 조건으로 인해 삭제를 방해하여 발생했습니다.

### 변경 사항:

#### 1. 문제의 원인 진단:
- `UserService.ts`의 `deleteUser` 메서드가 예약(reservations)을 삭제하기 전에 연관된 결제(payments)를 명시적으로 삭제하지 않아 데이터베이스의 외래 키 제약 조건(`FK_9ed5ff4942e09edfd44ee0ccf01`)이 위반되는 것이 문제였습니다.
- `onDelete: 'CASCADE'` 옵션이 TypeORM 엔티티 관계에 올바르게 설정되지 않아 데이터베이스가 종속된 레코드를 자동으로 삭제하지 못했습니다.

#### 2. 해결 방안 적용:
- **`server/src/entities/Payment.ts` 수정:**
    - `Payment` 엔티티의 `@OneToOne` 관계 정의에 `onDelete: 'CASCADE'` 옵션을 추가했습니다.
    ```typescript
    @OneToOne(() => Reservation, (reservation) => reservation.payment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "reservation_id" })
    reservation!: Reservation;
    ```
    - 이 변경으로 인해 TypeORM은 `Reservation` 엔티티가 삭제될 때, 해당 `reservation_id`를 참조하는 `Payment` 엔티티도 자동으로 삭제하도록 데이터베이스 스키마를 업데이트합니다.

#### 3. 스키마 동기화 및 데이터 일관성 확보:
- `server/src/data-source.ts` 파일에서 `synchronize: true` 옵션이 활성화되어 있었기 때문에, 서버를 재시작하는 것만으로 변경된 엔티티 정의가 데이터베이스 스키마에 적용되었습니다.
- **주의:** `synchronize: true`는 개발 환경에서만 사용해야 하며, 실제 운영 환경에서는 데이터 손실을 방지하기 위해 TypeORM 마이그레이션 도구를 사용하여 스키마 변경을 관리하는 것이 권장됩니다. 이 해결 과정에서 테스트 코드와의 불일치로 인한 빌드 오류를 해결하기 위해 일시적으로 `synchronize: false`로 전환하고 `tsc` 빌드를 거쳐 테스트 코드들을 `snake_case` 명명 규칙 및 `Date` 타입에 맞춰 업데이트하는 과정을 거쳤습니다.

#### 4. 테스트 코드 및 모델 일관성 확보:
- `QueryFailedError` 해결 과정에서 발생한 수많은 TypeScript 컴파일 오류를 해결하기 위해, 백엔드 모델(Payment, Reservation, Caravan, User, Review)과 각 리포지토리 및 서비스의 테스트 코드에서 `camelCase`와 `snake_case` 명명 규칙 불일치, `Date` 타입 처리, `created_at` 및 `updated_at` 필드 누락 문제를 일관성 있게 수정했습니다. 이 과정을 통해 전체 프로젝트의 타입 안정성과 코드 품질이 향상되었습니다.

### 결과:
- `onDelete: 'CASCADE'` 옵션 적용 및 스키마 동기화를 통해 회원 탈퇴 시 발생하는 `QueryFailedError` 문제가 해결되었습니다.
- 사용자가 자신의 계정을 탈퇴할 때, 연관된 모든 예약 및 결제 정보가 데이터베이스에서 자동으로 안전하게 삭제되어 데이터 무결성이 보장됩니다.
- 이 과정에서 발생한 테스트 코드 및 모델 간의 불일치 문제를 해결함으로써 프로젝트 전체의 안정성과 유지보수성이 개선되었습니다.

---
