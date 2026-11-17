# 인계 문서 (HANDOFF)

프론트엔드를 팀원에게 넘기기 위한 문서입니다. 인계한 뒤에도 디자인 담당은 계속 디자인을 고칩니다. 그래서 맨 아래 **협업 규칙**을 꼭 읽어 주세요.

- 코드 규칙(컴포넌트, 스타일, API 호출 방식): [`CLAUDE.md`](CLAUDE.md)
- API 명세: [`docs/api-list.md`](docs/api-list.md)
- 화면, Figma 노드, 디자인 결정: [`docs/screens.md`](docs/screens.md)

---

## 1. 실행 방법

### 설치

```bash
cd frontend
npm install
```

Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript를 씁니다.

### `.env.local` 설정

`.env*` 파일은 `.gitignore`에 들어 있어서 저장소에 없습니다. `frontend/.env.local`을 직접 만듭니다.

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
# true: 실제 서버 대신 가짜 데이터(src/lib/api/mock) 사용 / false: 실제 서버 사용. 바꾼 뒤 개발 서버를 다시 켜야 적용됩니다.
NEXT_PUBLIC_USE_MOCK=true
```

| 변수 | 뜻 | 없을 때 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | 백엔드 주소. 끝의 `/`는 자동으로 뺍니다. WebSocket 주소도 여기서 만듭니다 (`http` → `ws`, `https` → `wss`) | `http://localhost:8080` |
| `NEXT_PUBLIC_USE_MOCK` | `true`면 가짜 데이터 모드 | 실제 서버 사용 |

### 개발 서버

```bash
npm run dev        # http://localhost:3000
```

- `/dev`: 공통 컴포넌트 모음 페이지입니다. 개발 모드에서만 열립니다.
- 검사: `npx tsc --noEmit`, `npm run lint`
- 운영 빌드 확인: `npm run build` 후 `npm run start`

### 가짜 데이터 모드 켜고 끄기

1. `.env.local`의 `NEXT_PUBLIC_USE_MOCK`을 `true`(켜기) 또는 `false`(끄기)로 바꿉니다.
2. **개발 서버를 껐다가 다시 켭니다.** `NEXT_PUBLIC_` 값은 서버를 켤 때 코드에 들어가기 때문에, 다시 켜지 않으면 바뀌지 않습니다.

가짜 모드에서는 이렇게 동작합니다. 자세한 내용은 `CLAUDE.md` 4-1절에 있습니다.

- 로그인은 어떤 값을 넣어도 성공하고, 승인된 일반 사용자 "강민지"가 됩니다. 아이디를 `admin`으로 넣으면 운영진(`role=ADMIN`)이 됩니다.
- 회원가입은 초대 코드 `GDGOC-INVITE-01`~`05`만 받습니다. 가입하면 프로필 작성 → 키워드 등록 → 승인 대기 순서로 이어지고, 승인 상태를 두 번째로 확인할 때 승인됩니다.
- 로그인한 사용자 정보만 localStorage(`mock:me`)에 남습니다. 글 작성, 요청 수락 같은 나머지 변경은 새로고침하면 처음 데이터로 돌아갑니다.
- 채팅에서 메시지를 보내면 잠시 뒤 가짜 WebSocket으로 읽음(`message.read`)과 자동 답장(`message.new`)이 옵니다.
- 가짜 응답은 `src/lib/api/mock/index.ts`(`routes`)에, 처음 데이터는 `mock/data.ts`에 있습니다. API를 새로 추가하면 여기에도 가짜 응답을 넣어 주세요.

### 실제 서버로 바꾸기

1. 백엔드를 켭니다. 로컬 기본 주소는 `http://localhost:8080`입니다.
2. `.env.local`을 고칩니다.
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080   # 배포 서버면 https://… 주소
   NEXT_PUBLIC_USE_MOCK=false
   ```
3. 개발 서버를 다시 켭니다.
4. 로컬 테스트 계정은 운영진 `admin` / `admin1234!`, 초대 코드는 `GDGOC-INVITE-01` ~ `05`입니다.

브라우저가 `localhost:3000`에서 백엔드를 바로 부르기 때문에, 백엔드에서 이 주소의 CORS를 허용해야 합니다. 배포한 뒤에는 배포된 프론트 주소도 허용해야 합니다.

---

## 2. 폴더 구조와 주요 파일

```
frontend/
├── CLAUDE.md               # 코드 규칙 (먼저 읽기)
├── HANDOFF.md              # 이 문서
├── docs/
│   ├── api-list.md         # API 명세 (요청, 응답, 로그인 조건)
│   └── screens.md          # 화면 목록, Figma 노드, 화면별 API, 디자인 결정, 알려진 문제
└── src/
    ├── app/                # 라우트(화면). 그 화면에서만 쓰는 컴포넌트도 같은 폴더에 둠
    │   ├── globals.css     # Tailwind 설정 + 디자인 토큰(@theme)
    │   ├── dev/            # 컴포넌트 모음 /dev
    │   ├── login/ signup/ onboarding/ pending/
    │   ├── members/ recruits/ requests/ chats/ my/ admin/
    │   └── not-found.tsx   # 공통 404
    ├── components/
    │   ├── layout/         # 화면 틀: MainLayout, AuthLayout, FlowHeader, OnboardingHeader, Sidebar, BottomNav, Dialog …
    │   └── ui/             # 공통 UI: Button, Input, Chip, Card, Tabs, Icon … + KeywordEditor, ProfileForm, KeywordsForm
    ├── lib/
    │   ├── api/            # 모든 API 호출 (화면은 "@/lib/api"에서만 import)
    │   │   ├── client.ts   # 공통 호출 함수: 토큰 첨부, 401 재발급, 403 가입 단계 이동, ApiError
    │   │   ├── *.ts        # 기능별 함수 (auth, users, members, posts, requests, chat, admin …)
    │   │   └── mock/       # 가짜 데이터 모드
    │   ├── auth/token.ts   # 토큰, 가입 단계 저장, logout
    │   ├── auth/home.ts    # resolveHomePath: 로그인한 사용자가 갈 화면
    │   ├── routes.ts       # 화면 경로 상수 ROUTES
    │   ├── labels.ts       # 분야, 사유 같은 표시 이름
    │   ├── datetime.ts     # 날짜 → "오후 2:14", "어제"
    │   └── useResetOnHide.ts  # 화면을 떠날 때 일시 상태 되돌리기
    └── types/api.ts        # api-list.md 기준 요청, 응답 타입
```

꼭 알아야 할 점:

- **화면에서는 `@/lib/api`의 함수만 부릅니다.** `fetch`나 URL 문자열을 화면에 쓰지 않습니다. 새 API는 `lib/api/*.ts`에 함수로 추가합니다.
- 떠난 화면은 지워지지 않고 상태가 남아 있습니다 (Cache Components의 `<Activity>`). 그래서 "…하는 중…" 같은 일시 상태는 `useResetOnHide`로 되돌립니다.
- 이 저장소의 Next.js는 16 버전이라 예전 버전과 API가 다릅니다. 모르는 부분은 `node_modules/next/dist/docs/`를 먼저 봅니다.

---

## 3. 완료된 화면과 쓰는 API

모든 화면은 모바일과 PC를 같은 주소에서 반응형으로 만들었습니다 (1024px 이상이 PC). 경로는 `/api/v1` 뒤 부분만 적었습니다. 자세한 내용은 `docs/screens.md` 2절에 있습니다.

| 주소 | 화면 | API |
| --- | --- | --- |
| `/` | 첫 화면 (가입 단계에 맞는 화면으로 이동) | 내 정보 조회, 승인 상태 조회 (`resolveHomePath`) |
| `/login` | 로그인 | `POST /auth/login` |
| `/signup` | 회원가입 | `POST /auth/signup` |
| `/onboarding/profile` | 프로필 작성 (1/3) | `GET /users/me`, `POST /users/me/profile` |
| `/onboarding/keywords` | 키워드 등록 (2/3) | `GET /keywords`, `PUT /users/me/keywords` |
| `/pending` | 승인 대기 (3/3) | `GET /auth/approval-status` |
| `/members` | 멤버 탐색 + 프로필·제안 다이얼로그 | `GET /members`, `GET /members/{id}`, `POST /proposals`, `POST /reports`, `POST /blocks` |
| `/recruits` | 모집 글 목록 + 상세·작성·수정 다이얼로그 | `GET /posts`, `GET /posts/{id}`, `POST /posts`, `PATCH`·`DELETE /posts/{id}`, `POST /posts/{id}/applications`, `GET /keywords` |
| `/requests` | 받은 요청 · 보낸 요청 + 거절 사유 다이얼로그 | `GET /requests/received`, `GET /requests/sent`, `PATCH /requests/{type}/{id}/accept`, `PATCH /requests/{type}/{id}/reject` |
| `/chats` | 채팅 목록 | `GET /chatrooms` |
| `/chats/{chatRoomId}` | 1:1 채팅 | `GET /chatrooms/{id}`, `GET .../messages`, `POST .../messages`, `PATCH .../read`, WebSocket `/ws/chatrooms/{id}` (실시간 수신) |
| `/my` | 마이 (내 프로필, 로그아웃) | `GET /users/me`, `GET /users/me/keywords` |
| `/my/profile` | 프로필 수정 (PC는 마이 위 다이얼로그) | `PATCH /users/me/profile` |
| `/my/keywords` | 내 키워드 | `GET /users/me/keywords`, `GET /keywords`, `PUT /users/me/keywords` |
| `/my/connections` | 연결 동료 | `GET /connections` |
| `/admin` | 운영 관리 (`role=ADMIN`만) | `GET /admin/dashboard` |
| `/admin/signups` | 가입 승인 | `GET /admin/signups`, `PATCH /admin/signups/{userId}/approve` |
| `/admin/reports` | 신고 관리 | `GET /admin/reports`, `PATCH /admin/reports/{reportId}/resolve` |
| (공통) | 사이드바 요청 뱃지 | `GET /requests/received?status=PENDING` |
| (공통) | 토큰 재발급 | `POST /auth/refresh` (`client.ts`가 자동으로 부름) |

---

## 4. 팀원이 할 일

### 4-1. 실서버 연결 테스트

지금까지는 거의 가짜 데이터 모드에서만 확인했습니다. 가짜 응답은 `docs/api-list.md`에 맞춰 만들었지만, 실제 서버와 다를 수 있습니다.

1. 1절의 "실제 서버로 바꾸기"대로 연결합니다.
2. 아래 흐름을 모바일 폭과 PC 폭에서 한 번씩 눌러 봅니다.
   - 회원가입 → 프로필 작성 → 키워드 등록 → 승인 대기 → (운영진으로 승인) → 멤버
   - 로그인 → 멤버 검색 → 같이해요 제안 → (상대 계정) 받은 요청 수락 → 채팅방 이동 → 메시지 주고받기
   - 모집 글 작성·수정·삭제·지원 → 받은 요청 / 보낸 요청 → 거절 사유 확인
   - 운영진: 가입 승인, 신고 처리
   - 토큰이 만료됐을 때 재발급되는지, 재발급 토큰도 만료되면 `/login`으로 가는지
3. 응답 모양이 다르면 **`src/types/api.ts`를 먼저 고치고**, 그다음 `lib/api`와 `mock`을 고칩니다. 화면 모양이나 문구를 바꿔야 하면 디자인 담당에게 알려 주세요.
4. 날짜는 `2026-10-05T10:00:00`처럼 타임존 없는 서울 시간으로 온다고 가정했습니다 (`lib/datetime.ts`). 실제 서버도 같은지 확인해 주세요.

### 4-2. 채팅 실시간 수신 (WebSocket) — 완료

- `src/app/chats/ChatRoom.tsx`가 방에 들어오면 `connectChatSocket`으로 연결하고, 화면을 떠나면 닫습니다.
  - `message.new`: 메시지 추가 → 읽음 처리(`markAsRead`) → 채팅 목록의 마지막 메시지 갱신. 맨 아래를 보고 있을 때만 따라 내립니다.
  - `message.read`: 내 메시지를 "읽음"으로 바꿉니다.
- `src/lib/api/chat.ts`의 `connectChatSocket`은 끊기면 1초부터 최대 30초 간격으로 다시 연결합니다. 다시 연결하기 전에 채팅방 상세 API를 불러 토큰을 재발급하고, `CHAT403`·`CHAT404`·`REFRESH401`이면 멈춥니다. 다시 연결되면 `onReconnect`로 끊긴 동안의 메시지를 불러와 합칩니다(`mergeLatest`).
- 열려 있지 않은 방의 새 메시지는 지금처럼 채팅 목록에 들어올 때 다시 불러와 반영합니다.

### 4-3. 배포

아직 배포 설정이 없습니다.

- Next.js 앱이라 Vercel이 가장 간단합니다 (`.vercel`은 이미 `.gitignore`에 있음). Node 서버에서 `npm run build && npm run start`로 띄워도 됩니다.
- 환경 변수 `NEXT_PUBLIC_API_URL`(배포 백엔드의 `https://` 주소), `NEXT_PUBLIC_USE_MOCK=false`를 배포 환경에 설정합니다. `NEXT_PUBLIC_` 값은 **빌드할 때** 코드에 들어가므로, 값을 바꾸면 다시 빌드해야 합니다.
- 프론트가 `https`면 WebSocket도 `wss`여야 합니다. 주소가 `https://`면 자동으로 `wss://`가 됩니다.
- 백엔드 CORS에 배포된 프론트 주소를 추가해야 합니다.
- `/dev` 페이지는 운영 빌드에서 404가 됩니다 (`src/app/dev/page.tsx`).

---

## 5. 알려진 문제

### 5-1. 모집 글 수정 때 키워드 id를 다시 찾음 (`docs/screens.md` 7절 1번)

- **문제:** 모집글 상세 API(`GET /posts/{postId}`)가 키워드를 이름으로만(`keywords: string[]`) 줍니다. 그래서 수정 API에 보낼 `keywordIds`를 바로 알 수 없습니다.
- **지금 처리:** 수정 다이얼로그를 열 때 키워드 검색 API로 이름이 똑같은 키워드를 찾아 id를 되살립니다 (`src/app/recruits/RecruitComposeDialog.tsx`의 `resolveKeywords`). 키워드 하나마다 검색을 한 번씩 부르고, 못 찾은 키워드는 빠지면서 안내 문구가 나옵니다.
- **해결:** 백엔드가 상세 응답에 키워드 id도 같이 주면(예: `keywords: { keywordId, name }[]`) 그 값을 바로 채우고, 다시 찾는 코드를 지웁니다.

### 5-2. 승인 전에는 키워드를 저장했는지 알 수 없음

- **문제:** 가입 중인(승인 전) 사용자가 키워드 등록까지 마쳤는지 확인할 API가 없습니다. 내 키워드 조회(`GET /users/me/keywords`)는 승인 후에만 됩니다. 그래서 다른 브라우저에서 로그인하거나 localStorage가 지워지면, 이미 키워드를 저장한 사용자도 키워드 등록 화면으로 갑니다.
- **지금 처리:** 가입 단계를 localStorage(`onboardingStep`)에 저장해 두고, 값이 없으면 `resolveHomePath`(`src/lib/auth/home.ts`)가 추측합니다. 내 정보의 전공(`major`)이 없으면 PROFILE, 있으면 KEYWORD로 보냅니다. 키워드 화면에서 다시 저장하면 승인 대기로 넘어가므로 막히지는 않습니다.
- **해결:** 백엔드가 **내 정보 조회(`GET /users/me`) 응답에 `onboardingStep`을 주면** 해결됩니다. 그때는 `types/api.ts`의 내 정보 타입에 `onboardingStep`을 추가하고, `resolveHomePath`에서 추측하는 부분을 그 값으로 바꾸고, `mock`의 내 정보 조회도 맞춥니다. 로그인 응답에는 이미 `onboardingStep`이 있습니다.

---

## 6. 디자인 결정

화면의 모양, 문구, Figma와 다르게 만든 이유는 모두 [`docs/screens.md`](docs/screens.md)에 있습니다.

- 1절: 화면 목록과 Figma 노드 (모바일·PC)
- 2절: 화면별 API와 구현 메모
- 4절: **결정 사항** (Figma와 다르면 이쪽이 우선)
- 5절: 화면마다 달랐던 버튼, 칩을 하나로 통일한 기준
- 6절: Figma 컴포넌트와 코드 컴포넌트 대응표

기능을 고치다 Figma와 화면이 달라 보이면, 고치기 전에 `docs/screens.md` 4절에 이유가 있는지 먼저 확인해 주세요.

---

## 7. 협업 규칙

### 누가 무엇을 고치나

| 담당 | 고치는 곳 |
| --- | --- |
| **디자인 담당** | `src/components/ui/`, 스타일 설정(`src/app/globals.css`의 토큰), 화면의 모양과 문구, `docs/screens.md` |
| **기능 담당 (팀원)** | `src/lib/api/` (`mock` 포함), `src/types/api.ts`, 채팅 실시간 수신, 배포 설정 |

- **채팅방 화면**(`src/app/chats/`, 특히 `ChatRoom.tsx`)은 둘 다 고칠 수 있으니, **고치기 전에 서로 알립니다.**
- 상대 담당 영역을 고쳐야 하면 먼저 이야기하고, PR 설명에 이유를 적어 주세요.
- API 응답이 바뀌어 화면에 보이는 내용이 달라지면, 기능 담당이 데이터 연결까지 하고 모양과 문구는 디자인 담당에게 넘깁니다.

### 브랜치와 PR

- `main`에 바로 푸시하지 않습니다. 각자 브랜치에서 작업합니다 (예: `design/…`, `feat/…`).
- PR로 합치고, 합치기 전에 `npx tsc --noEmit`과 `npm run lint`가 통과하는지 확인합니다.
- 커밋 메시지는 [`README.md`](README.md)의 Gitmoji 규칙을 따릅니다 (`✨ feat: …`, `🐛 fix: …`, `💄 style: …`).
- 오래 걸리는 브랜치는 자주 `main`을 받아 와서 충돌을 줄입니다.
