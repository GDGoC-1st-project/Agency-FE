@AGENTS.md

# GDGoC 인력사무소 — 프론트엔드

Next.js(App Router) + TypeScript + Tailwind CSS. API 명세는 `docs/api-list.md`를 기준으로 합니다.

## 폴더 구조

```
frontend/
├── .env.local              # NEXT_PUBLIC_API_URL (기본 http://localhost:8080), NEXT_PUBLIC_USE_MOCK (true면 가짜 데이터)
├── docs/
│   ├── api-list.md         # API 명세 (요청·응답·로그인 조건)
│   └── screens.md          # 화면 목록, Figma 노드, 사용 API, 구현 순서, 결정 사항
└── src/
    ├── app/                # 라우트(화면). App Router 규칙을 따름
    │   ├── globals.css     # Tailwind 설정 + Figma 디자인 토큰(@theme)
    │   └── dev/            # 컴포넌트 모음 페이지 /dev (개발 모드에서만)
    ├── components/
    │   ├── layout/         # 모바일: TopNav, BottomNav, FlowHeader, OnboardingHeader / PC: Sidebar, PcTopBar / 묶음: AppShell, MainLayout, AuthLayout / Dialog(모바일 시트·PC 카드)
    │   └── ui/             # 공통 UI (Button, Input, Chip, Badge, Avatar, Card, Tabs, PageIntro, StateMessage, ProgressBar, Logo, Icon)
    ├── lib/
    │   ├── api/
    │   │   ├── client.ts   # 공통 호출 함수 (apiRequest, api). 기능별 파일 내부에서만 사용
    │   │   ├── index.ts    # 기능별 함수 전부 re-export → 화면은 "@/lib/api"에서 import
    │   │   ├── auth.ts         # signup, login, refreshToken, getApprovalStatus
    │   │   ├── users.ts        # getMe, createProfile, updateProfile, updateMyKeywords, getMyKeywords
    │   │   ├── keywords.ts     # searchKeywords
    │   │   ├── members.ts      # getMembers, getMember
    │   │   ├── proposals.ts    # createProposal
    │   │   ├── reports.ts      # createReport
    │   │   ├── blocks.ts       # blockMember, unblockMember
    │   │   ├── posts.ts        # getPosts, getPost, createPost, updatePost, deletePost, applyToPost
    │   │   ├── requests.ts     # getReceivedRequests, getSentRequests, acceptRequest, rejectRequest
    │   │   ├── connections.ts  # getConnections
    │   │   ├── chat.ts         # getChatRooms, getChatRoom, getMessages, sendMessage, markAsRead, connectChatSocket
    │   │   ├── admin.ts        # getAdminDashboard, getPendingSignups, approveSignup, getAdminReports, resolveReport
    │   │   └── mock/           # 가짜 데이터 모드 (index.ts: 가짜 응답 라우트, data.ts: 초기 데이터)
    │   ├── auth/token.ts   # accessToken / refreshToken 저장·삭제
    │   ├── routes.ts       # 화면 경로 상수 (ROUTES)
    │   ├── datetime.ts     # API 날짜 → "오후 2:14" · "어제" · "오늘" 같은 화면 문구
    │   └── cn.ts           # className 합치기
    └── types/api.ts        # docs/api-list.md 기준 요청·응답 타입
```

- 특정 화면에서만 쓰는 컴포넌트는 그 라우트 폴더 가까이에 둡니다. 두 곳 이상에서 쓰이면 `components/ui`로 옮깁니다.
- import는 `@/` 별칭을 씁니다 (`@/components/ui/Button`).

## 규칙

### 1. 공통 컴포넌트는 `components/ui`에 두고 재사용
- 버튼, 입력창, 카드, 모달, 태그, 빈 상태 등 반복되는 UI는 `src/components/ui`에 만듭니다.
- 새로 만들기 전에 `components/ui`에 같은 역할의 컴포넌트가 있는지 먼저 확인하고, 있으면 그것을 쓰거나 props를 확장합니다. 비슷한 컴포넌트를 중복해서 만들지 않습니다.
- 화면 틀은 `components/layout`을 씁니다. 하단 내비(모바일)·사이드바(PC)가 있는 화면은 `MainLayout`, 로그인·회원가입은 `AuthLayout`, 계정·마이 하위·운영 화면은 `FlowHeader`, 가입 설정은 `OnboardingHeader`, 다이얼로그는 `Dialog`.
- Figma 컴포넌트와 코드의 대응표는 `docs/screens.md` 6절, 실제 모양은 개발 서버의 `/dev`에서 봅니다. 공통 컴포넌트를 추가·변경하면 `/dev`(`src/app/dev/DevCatalog.tsx`)에도 반영합니다.
- 색·글자 크기·그림자는 `globals.css`의 토큰(`bg-paper`, `text-11`, `font-display text-display-xl`, `shadow-hard` 등)을 쓰고 hex 값을 직접 쓰지 않습니다.
- 아이콘은 `ui/Icon`만 씁니다. 새 아이콘은 Figma에서 SVG를 내보내 `ICONS`에 경로를 추가합니다.
- 경로 문자열은 `@/lib/routes`의 `ROUTES`를 씁니다.

### 2. 스타일은 Tailwind만
- Tailwind 유틸리티 클래스만 씁니다.
- 별도 CSS/SCSS 파일, CSS Modules, styled-components 등 CSS-in-JS, 인라인 `style` 속성은 쓰지 않습니다.
- `src/app/globals.css`에는 Tailwind 설정(`@import "tailwindcss"`, `@theme` 토큰)만 둡니다.

### 3. API 호출은 공통 함수만
- **화면(컴포넌트·페이지)에서는 `@/lib/api`의 기능별 함수만 씁니다.** 예: `import { getMembers, createProposal } from "@/lib/api"`
- 화면에서 `apiRequest`·`api.get` 등을 직접 부르거나 URL 문자열을 쓰지 않습니다. `fetch`, axios도 쓰지 않습니다.
- 새 API가 생기면 해당 기능 파일(`src/lib/api/*.ts`)에 함수를 추가하고, 그 안에서만 `client.ts`의 `api.*`를 씁니다. 새 기능 파일을 만들면 `index.ts`에 re-export를 추가합니다.
- `signup`·`login`은 성공 시 토큰을 자동 저장하므로 화면에서 따로 저장하지 않습니다.
- 공통 함수가 토큰 첨부, `AUTH401` 재발급 후 재시도, `REFRESH401` → `/login`, `AUTH403` → `/pending` 이동을 처리합니다. 화면에서 이 처리를 다시 구현하지 않습니다.
- 그 외 실패는 `ApiError`(`status`, `code`, `message`)로 throw되므로 화면에서 `code`로 분기합니다.
- 오류 문구는 `getErrorMessage(error, 기본문구)`로 만듭니다 (서버 메시지 / 연결 실패 안내). 입력칸 하나의 문제는 `TextField`·`Field`의 `error`로 칸 아래에, 양식 전체 문제는 `FormError`로 보여줍니다.
- 요청 중에는 버튼을 `disabled`로 하고 문구를 "…하는 중…"으로 바꿉니다 (`/login`·`/signup` 참고).
- **떠난 화면은 지워지지 않고 상태가 그대로 보관됩니다** (Cache Components의 `<Activity>`, 최대 3개). 그래서 "…하는 중…", 오류 문구, 열린 목록처럼 일시적인 상태는 `useResetOnHide`(`@/lib/useResetOnHide`)로 화면을 떠날 때 되돌립니다. 데이터는 effect가 돌아올 때 다시 실행되므로 그 안에서 새로 불러옵니다. 자세한 내용: `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`
- 요청·응답 타입은 `@/types/api`의 타입을 씁니다. 명세가 바뀌면 `types/api.ts`를 먼저 고칩니다.
- 기능 파일에서 토큰이 필요 없는 API(로그인·회원가입·재발급)는 `auth: false`를 넘깁니다.
- 채팅 실시간 수신(WebSocket)도 `new WebSocket`을 직접 쓰지 말고 `connectChatSocket(chatRoomId, onEvent)`를 씁니다. 반환된 함수로 연결을 닫습니다(useEffect cleanup).

### 4. 승인 전(PENDING) 사용자는 승인 전 API만 호출
승인 전 사용자가 그 외 API를 부르면 `403 AUTH403`이 나고 `/pending`으로 튕깁니다. 온보딩·승인 대기 화면에서는 아래 8개만 호출합니다.

| 기능 | 함수 | 요청 |
| --- | --- | --- |
| 회원가입 | `signup` | `POST /api/v1/auth/signup` |
| 로그인 | `login` | `POST /api/v1/auth/login` |
| 토큰 재발급 | `refreshToken` | `POST /api/v1/auth/refresh` |
| 승인 상태 조회 | `getApprovalStatus` | `GET /api/v1/auth/approval-status` |
| 내 정보 조회 | `getMe` | `GET /api/v1/users/me` |
| 프로필 작성 | `createProfile` | `POST /api/v1/users/me/profile` |
| 키워드 검색 | `searchKeywords` | `GET /api/v1/keywords` |
| 내 키워드 저장 | `updateMyKeywords` | `PUT /api/v1/users/me/keywords` |

- **프로필 수정(`updateProfile`)과 내 키워드 조회(`getMyKeywords`)는 승인 후에만** 됩니다. 온보딩에서 쓰지 않습니다.
- 로그인 응답의 `onboardingStep`(`PROFILE` → `KEYWORD` → `WAITING` → `DONE`)으로 이동할 화면을 정합니다.

### 4-1. 가짜 데이터 모드 (백엔드 없이 개발)
- `.env.local`에 `NEXT_PUBLIC_USE_MOCK=true`면 `@/lib/api` 함수들이 실제 서버 대신 `src/lib/api/mock`의 가짜 데이터를 돌려줍니다. `false`(또는 없음)면 실제 서버(`NEXT_PUBLIC_API_URL`)를 씁니다.
- 값을 바꾸면 **개발 서버를 다시 켜야** 적용됩니다 (`NEXT_PUBLIC_` 값은 시작할 때 코드에 박힘).
- 화면 코드는 모드와 상관없이 똑같이 `@/lib/api` 함수만 씁니다. 화면에서 `USE_MOCK`으로 분기하거나 가짜 데이터를 직접 import하지 않습니다.
- 가짜 모드 동작:
  - 로그인은 항상 성공하고 **승인된 일반 사용자**(강민지, `role=MEMBER`, `onboardingStep=DONE`)로 처리합니다.
  - 회원가입은 초대 코드 `GDGOC-INVITE-01`~`05`만 받습니다 (그 외 `INVITE400`, 아이디 `admin`은 `AUTH409`). 가입하면 프로필·키워드가 빈 **승인 대기(PENDING)** 사용자로 시작하고, 승인 상태 조회는 **두 번째 확인부터 `APPROVED`**입니다. 그래서 회원가입 → 프로필 작성 → 키워드 등록 → 승인 대기 → 멤버까지 이어서 눌러볼 수 있습니다.
  - 승인 대기 중에는 승인 전 API 8개 외에는 실제처럼 `AUTH403`이 납니다.
  - 로그인 사용자 정보(이름·프로필·키워드·승인 상태)만 sessionStorage(`mock:me`)에 저장돼 새로고침해도 이어집니다. 처음부터 다시 하려면 로그인하거나 탭을 새로 여세요.
  - 응답 형식과 에러 코드는 `docs/api-list.md`·백엔드와 같습니다 (예: 같은 글에 두 번 지원하면 `APPLICATION409`).
  - 작성·수락·삭제 등은 메모리에 반영되지만 **새로고침하면 처음 데이터로 돌아갑니다.**
  - 채팅은 메시지를 보내면 잠시 뒤 상대의 읽음(`message.read`)과 자동 답장(`message.new`)이 WebSocket 이벤트로 옵니다.
  - 운영진 API도 데이터를 돌려줍니다 (역할 검사 안 함).
- 새 API를 추가하면 `src/lib/api/mock/index.ts`의 `routes`에도 가짜 응답을 추가합니다. 초기 데이터는 `mock/data.ts`에 있습니다.

### 5. 화면은 `docs/screens.md`의 결정 사항을 따름
- 화면을 만들 때 `docs/screens.md`의 **4절 결정 사항**을 따릅니다. Figma와 결정 사항이 다르면 결정 사항이 우선입니다.
- 백엔드 API에 없는 기능은 디자인에 있어도 만들지 않습니다.
- 화면별 Figma 노드 ID, 사용하는 API, 구현 순서도 `docs/screens.md`를 봅니다.
- **화면은 모바일과 PC를 같이 만듭니다.** 화면 하나를 만들 때 `docs/screens.md` 1절의 모바일·PC 노드를 둘 다 읽고, 같은 주소에서 반응형으로 만듭니다. 1024px(`lg:`) 미만은 모바일, 이상은 PC 디자인입니다 (`docs/screens.md` 4-4).
- 모바일 전용·PC 전용 요소는 `lg:hidden` / `hidden lg:flex`처럼 나눕니다. 같은 데이터·상태는 한 컴포넌트에서 쓰고 모양만 `lg:`로 바꾸는 것을 우선합니다.
- 모바일과 PC의 문구·순서가 다르면 Figma를 각각 따릅니다 (예: `<span className="lg:hidden">다음</span><span className="hidden lg:inline">등록하고 계속하기</span>`, 순서는 `order-*`·`lg:order-*`).
- 분야·제안 사유·거절 사유 같은 표시 이름은 `@/lib/labels`에서 가져옵니다.
- 다이얼로그 열림 상태는 그 화면에서 `useResetOnHide(() => setOpen(false))`로 화면을 떠날 때 닫습니다. `useResetOnHide` 안에서는 처음 값으로 되돌리는 일만 합니다 (개발 모드 StrictMode에서 처음 그릴 때도 한 번 실행됨).

### 6. Figma 기준
- Figma 파일: [인력사무소 디자인](https://www.figma.com/design/Q4ifVdq8v6VV66UaTYP3r9) (`Q4ifVdq8v6VV66UaTYP3r9`). 노드 ID는 `docs/screens.md`를 봅니다.
- 디자인 시스템 페이지의 **컴포넌트 섹션과 조립 화면이 다르면 조립 화면을 따릅니다.**
- 공통 컴포넌트(`components/ui`)는 **조립 화면에서 실제로 쓰인 모양**으로 만듭니다.
- 같은 요소(버튼, 칩 등)가 화면마다 조금씩 다르면 **가장 많이 쓰인 모양 하나로 통일**합니다. 이미 정한 통일 결과는 `docs/screens.md` 5절에 있고, 새로 통일한 것이 생기면 그 표에 추가합니다.

## 참고
- 날짜는 `2026-10-05T10:00:00` 형식(타임존 없음, 서울 시간)입니다.
- 요청 목록은 `requestId`가 타입별로 따로 매겨지므로 항상 `requestType`과 함께 다룹니다 (key: `${requestType}-${requestId}`).
- 로컬 테스트 계정: 운영진 `admin` / `admin1234!`, 초대 코드 `GDGOC-INVITE-01` ~ `05`.
- 검증: `npx tsc --noEmit`, `npm run lint`
