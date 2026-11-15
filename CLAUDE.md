@AGENTS.md

# GDGoC 인력사무소 — 프론트엔드

Next.js(App Router) + TypeScript + Tailwind CSS. API 명세는 상위 폴더의 `../api-list.md`를 기준으로 합니다.

## 폴더 구조

```
frontend/
├── .env.local              # NEXT_PUBLIC_API_URL (기본 http://localhost:8080)
└── src/
    ├── app/                # 라우트(화면). App Router 규칙을 따름
    ├── components/
    │   └── ui/             # 공통 UI 컴포넌트 (Button, Input, Modal 등)
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
    │   │   └── admin.ts        # getAdminDashboard, getPendingSignups, approveSignup, getAdminReports, resolveReport
    │   └── auth/token.ts   # accessToken / refreshToken 저장·삭제
    └── types/api.ts        # api-list.md 기준 요청·응답 타입
```

- 특정 화면에서만 쓰는 컴포넌트는 그 라우트 폴더 가까이에 둡니다. 두 곳 이상에서 쓰이면 `components/ui`로 옮깁니다.
- import는 `@/` 별칭을 씁니다 (`@/components/ui/Button`).

## 규칙

### 1. 공통 컴포넌트는 `components/ui`에 두고 재사용
- 버튼, 입력창, 카드, 모달, 태그, 빈 상태 등 반복되는 UI는 `src/components/ui`에 만듭니다.
- 새로 만들기 전에 `components/ui`에 같은 역할의 컴포넌트가 있는지 먼저 확인하고, 있으면 그것을 쓰거나 props를 확장합니다. 비슷한 컴포넌트를 중복해서 만들지 않습니다.

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

### 5. 화면은 `docs/screens.md`의 결정 사항을 따름
- 화면을 만들 때 `docs/screens.md`의 **4절 결정 사항**을 따릅니다. Figma와 결정 사항이 다르면 결정 사항이 우선입니다.
- 백엔드 API에 없는 기능은 디자인에 있어도 만들지 않습니다.
- 화면별 Figma 노드 ID, 사용하는 API, 구현 순서도 `docs/screens.md`를 봅니다.

### 6. Figma 기준
- 디자인 시스템 페이지의 **컴포넌트 섹션과 조립 화면이 다르면 조립 화면을 따릅니다.**
- 공통 컴포넌트(`components/ui`)는 **조립 화면에서 실제로 쓰인 모양**으로 만듭니다.
- 같은 요소(버튼, 칩 등)가 화면마다 조금씩 다르면 **가장 많이 쓰인 모양 하나로 통일**합니다. 이미 정한 통일 결과는 `docs/screens.md` 5절에 있고, 새로 통일한 것이 생기면 그 표에 추가합니다.

## 참고
- 날짜는 `2026-10-05T10:00:00` 형식(타임존 없음, 서울 시간)입니다.
- 요청 목록은 `requestId`가 타입별로 따로 매겨지므로 항상 `requestType`과 함께 다룹니다 (key: `${requestType}-${requestId}`).
- 로컬 테스트 계정: 운영진 `admin` / `admin1234!`, 초대 코드 `GDGOC-INVITE-01` ~ `05`.
- 검증: `npx tsc --noEmit`, `npm run lint`
