# GDGoC 인력사무소 화면 목록 · API 연결 · 구현 순서

- 출처: Figma [인력사무소 디자인](https://www.figma.com/design/Q4ifVdq8v6VV66UaTYP3r9) (fileKey `Q4ifVdq8v6VV66UaTYP3r9`) → `인력사무소 디자인` 페이지(0:1) → `조립 화면` 섹션(1:122)
  - `모바일 · 22개 화면` (390px), `PC · 21개 화면` (1440px)
  - 2026-11-15에 이 파일로 옮기면서 노드 ID가 `1:xxxx`로 바뀌었습니다. 예전 파일(`KXT5TMF7o6AqSkVHoQUSxi`)의 ID는 쓰지 않습니다.
- API 이름은 `api-list.md`(같은 폴더)의 기능 이름을 그대로 씁니다.
- 노드 ID는 Figma에서 바로 찾을 때 씁니다 (`node-id=1-124` 형식).
- **화면을 만들 때는 4절 "결정 사항"이 디자인보다 우선합니다.**

---

## 1. 화면 전체 목록

| 영역 | 화면 | 모바일 | PC | 형태 |
| --- | --- | --- | --- | --- |
| 계정 | 로그인 | 1:343 | 1:621 | 페이지 |
| 계정 | 회원가입 | 1:328 | 1:628 | 페이지 |
| 가입 설정 | 프로필 작성 (Figma 이름: `마이 · 프로필 관리`) | 1:287 | 1:584 | 모바일: 페이지 / PC: 마이 위 다이얼로그 ("다음: 키워드 등록") |
| 가입 설정 | 키워드 등록 (2/3) | 1:383 | 1:604 | 페이지 |
| 가입 설정 | 가입 승인 대기 (3/3) | 1:396 | 1:614 | 페이지 |
| 멤버 | 멤버 탐색 | 1:124 | 1:408 | 페이지 |
| 멤버 | 멤버 프로필 | 1:137 | 1:423 | 멤버 탐색 위 다이얼로그 |
| 멤버 | 같이해요 제안 | 1:158 | 1:446 | 멤버 탐색 위 다이얼로그 |
| 모집 | 모집 글 목록 | 1:174 | 1:464 | 페이지 |
| 모집 | 모집 글 상세 | 1:184 | 1:476 | 목록 위 다이얼로그 |
| 모집 | 모집 글 작성 | 1:197 | 1:491 | 목록 위 다이얼로그 |
| 요청 | 받은 요청 | 1:218 | 1:514 | 페이지 (탭) |
| 요청 | 보낸 요청 | 1:230 | 1:528 | 페이지 (탭) |
| 요청 | 거절 사유 입력 | 1:242 | 1:542 | 받은 요청 위 다이얼로그 |
| 채팅 | 채팅 목록 + 1:1 채팅 | 1:257, 1:267 (하단 Nav 없는 채팅방) | 1:559 | PC: 좌측 목록 + 우측 채팅방 / 모바일: 목록과 채팅방 분리 |
| 마이 | 마이 (내 프로필) | 1:275 | 1:571 | 페이지 |
| 마이 | 내 키워드 | 1:304 | 1:639 | 페이지 |
| 마이 | 연결 동료 | 1:313 | 1:651 | 페이지 |
| 운영 | 운영 관리 | 1:352 | 1:668 | 페이지 (마이에서 진입) |
| 운영 | 가입 승인 | 1:362 | 1:680 | 페이지 |
| 운영 | 신고 관리 | 1:371 | 1:691 | 페이지 |

이제 모든 화면에 모바일·PC 디자인이 있습니다.

공통 레이아웃: 모바일은 `Navigation/Top Bar` + `Navigation/Bottom`(멤버·모집·요청·채팅·마이), PC는 `Navigation/Sidebar`(요청 뱃지 숫자 포함) + `Navigation/Top Bar`. 가입 설정 화면은 `Navigation/Onboarding Header`, 계정·마이 하위·운영 화면은 `Navigation/Flow Header`(뒤로가기 + 제목)를 씁니다.

---

## 2. 구현 순서와 화면별 API

순서: **로그인 → 승인 대기 → 온보딩 → 멤버 → 모집글 → 요청 → 채팅 → 운영 관리**.
"마이" 화면들은 순서에 없어서 쓰는 API가 겹치는 단계에 붙였습니다 (표시: 📎).

> 실제 사용자 흐름은 회원가입 → 프로필 작성 → 키워드 등록 → 승인 대기입니다 (`onboardingStep`: `PROFILE` → `KEYWORD` → `WAITING` → `DONE`). 승인 대기 화면이 단순해서 먼저 만들 뿐, 라우팅은 이 흐름대로 연결해야 합니다.

### 0단계 (사전 준비, 화면 아님)
- API 클라이언트·공통 에러 처리 (`src/lib/api`, 완료)
- 공통 레이아웃: Top Bar, Bottom, Sidebar, Flow Header, Onboarding Header, 다이얼로그(Scrim)
- 공통 UI: 5절 기준대로 `components/ui`에 만듭니다

### 1단계 · 로그인 (+ 회원가입)
| 화면 | API |
| --- | --- |
| 로그인 | **로그인** `POST /auth/login` → `status`, `role`, `onboardingStep`으로 다음 화면 결정 |
| 회원가입 | **회원가입** `POST /auth/signup` (아이디, 비밀번호, 초대 코드. 비밀번호 확인은 프론트에서만 비교) |
| (공통) | **토큰 재발급** `POST /auth/refresh` |

로그인 후 이동: `onboardingStep`이 `PROFILE` → 프로필 작성, `KEYWORD` → 키워드 등록, `WAITING` → 승인 대기, `DONE` → 멤버 탐색.

✅ 구현됨 (2026-11-15): `/login`, `/signup`, `/`(로그인되어 있으면 `/members`, 아니면 `/login`). 모바일·PC 모두 (PC는 헤더 없이 가운데 358px 열, PC 회원가입에도 "이미 계정이 있나요? 로그인" 링크를 둠 — 4-2의 ⑨).
- 이동 경로는 `lib/routes.ts`의 `pathForOnboardingStep`. 회원가입 성공 후에는 항상 프로필 작성(`/onboarding/profile`)으로 갑니다.
- 아직 없는 화면 주소: `/members` (지금은 404).
- Figma 회원가입은 "가입하기" 버튼이 초대 코드 칸에 붙어 있지만, 로그인과 같게 24px 띄웠습니다.

### 2단계 · 승인 대기
| 화면 | API |
| --- | --- |
| 가입 승인 대기 | **승인 상태 조회** `GET /auth/approval-status` ("승인 상태 확인" 버튼 → `APPROVED`면 멤버 탐색으로). "로그아웃"은 토큰 삭제 후 로그인으로 (API 없음) |

### 3단계 · 온보딩 (가입 설정 1/3 ~ 2/3)
| 화면 | API |
| --- | --- |
| 프로필 작성 | **내 정보 조회** `GET /users/me` (이름 읽기 전용 표시), **프로필 작성** `POST /users/me/profile` (`bio`, `major`, `department`, `contact`) |
| 키워드 등록 | **키워드 검색(자동완성)** `GET /keywords?q=`, **내 키워드 저장** `PUT /users/me/keywords` (can / learning / interested 세 칸) |

⚠️ 온보딩 중(승인 전)에는 **프로필 수정**과 **내 키워드 조회**를 부르면 403이 납니다. 키워드 편집기는 처음엔 빈 상태로 시작해야 합니다.

✅ 구현됨 (2026-11-15): `/onboarding/profile`(1/3), `/onboarding/keywords`(2/3), `/pending`(3/3). 세 화면 모두 `OnboardingHeader`를 씁니다. 모바일·PC 모두.
- PC 프로필 작성은 전용 화면이 없어서 Figma `Dialog/Profile Setup`(1:3656, 마이 위 다이얼로그) 카드를 가입 설정 헤더 아래 가운데에 놓았습니다(키워드 등록·승인 대기 PC와 같은 배치). 진행 막대는 1/3(33%), 카드의 데모 문구 대신 모바일 설명을 씁니다.
- PC 키워드 등록(1:604)·승인 대기(1:614)는 Figma 문구를 따릅니다(모바일과 소개 문구가 다름). PC 승인 대기의 "승인 전에도 둘러볼 수 있어요"는 빼고 "승인 상태 확인"·"로그아웃"을 넣었습니다(4-3의 1번).
- 프로필 작성: Figma 모바일(1:287)은 Flow header지만 가입 설정 단계라 Onboarding header로 바꿨습니다. 칸 순서는 Figma대로 이름(읽기 전용) → 한 줄 소개(100자) → 역할 → 전공 → 연락처.
- 이미 프로필을 저장한 뒤 "이전"으로 돌아오면 승인 전에는 수정할 수 없어(프로필 수정 API는 승인 필요) 칸을 잠그고 안내만 보여줍니다.
- 키워드 등록: 편집기는 `components/ui/KeywordEditor` (마이 › 내 키워드에서도 재사용). 같은 키워드를 다른 칸에 넣는 것은 허용(백엔드 명세), 같은 칸 중복은 막습니다. 키워드는 0개여도 저장할 수 있습니다(백엔드가 빈 배열 허용).
- 키워드 등록 제목은 Figma에서 35px지만 다른 흐름 화면과 같은 39px(`PageIntro variant="flow"`)로 통일했습니다.
- 승인 대기: 결과가 PENDING이면 "아직 승인 전이에요…" 안내, APPROVED면 `/members`로 이동. 로그아웃은 토큰을 지우고 `/login`으로.

### 4단계 · 멤버
| 화면 | API |
| --- | --- |
| 멤버 탐색 | **멤버 검색** `GET /members` (`keyword`, `relation`, `department`, 페이지) |
| 멤버 프로필 (다이얼로그) | **멤버 프로필 조회** `GET /members/{memberId}`, **신고** `POST /reports` (`targetType=USER`), **차단** `POST /blocks` |
| 같이해요 제안 (다이얼로그) | **같이 해요 제안** `POST /proposals` (`reasonType` 선택 + 메시지 200자) |
| 📎 마이 (내 프로필) | **내 정보 조회** `GET /users/me`, **내 키워드 조회** `GET /users/me/keywords` |
| 📎 프로필 수정 (승인 후) | **프로필 수정** `PATCH /users/me/profile` (온보딩의 프로필 폼 재사용) |
| 📎 내 키워드 | **내 키워드 조회**, **키워드 검색**, **내 키워드 저장** (온보딩 키워드 편집기 재사용) |

✅ 구현됨 (2026-11-15): `/members` (멤버 탐색 + 멤버 프로필 다이얼로그 + 같이해요 제안 다이얼로그), 모바일·PC 모두. 📎 마이 화면들은 아직.
- 검색: 멤버 검색 API는 키워드로만 찾으므로 안내 문구를 "키워드로 검색해 보세요"로 바꿨습니다(Figma: 이름·역할·키워드). 입력을 멈추면 0.3초 뒤, Enter·PC "검색" 버튼은 바로 검색. `relation`은 디자인에 없어 쓰지 않습니다.
- 다음 페이지가 있으면 목록 아래 "더 보기" (Figma에 없음, 20명 넘을 때 필요).
- 멤버 프로필: "…" 메뉴의 **신고하기**는 신고 API에 사유(필수, 200자)가 필요해 다이얼로그 안에 사유 입력 화면을 넣었습니다. **차단하기**는 확인 후 차단하고 목록을 다시 불러옵니다(차단한 멤버는 목록에서 빠짐). 연락처는 API에 있지만 디자인에 없어 보여주지 않습니다.
- 같이해요 제안: 제안 API에 `reasonType`(필수)이 있는데 디자인에 칸이 없어 **제안 사유 칩**(프로젝트·스터디·해커톤·공모전·커피챗·취미·관심사·기타)을 추가했습니다. 이미 연결됐거나 대기 중이면 `PROPOSAL409` 안내.
- PC 다이얼로그는 Figma 배치대로 화면 오른쪽 가운데(오른쪽 여백 16px)에 폭 520으로 뜹니다.

### 5단계 · 모집글
| 화면 | API |
| --- | --- |
| 모집 글 목록 | **모집글 목록** `GET /posts` |
| 모집 글 상세 (다이얼로그) | **모집글 상세** `GET /posts/{postId}`, **모집글 지원** `POST /posts/{postId}/applications` (`hasApplied`로 버튼 상태), 작성자면(`isAuthor`) **모집글 수정** / **모집글 삭제** |
| 모집 글 작성 (다이얼로그) | **모집글 작성** `POST /posts` (`requiredRoles` = 선택한 DEV/AI/DESIGN), 키워드 입력에 **키워드 검색** → `keywordIds` |

### 6단계 · 요청
| 화면 | API |
| --- | --- |
| 받은 요청 | **받은 요청 목록** `GET /requests/received`, **요청 수락** `PATCH /requests/{type}/{id}/accept` → 받은 `chatRoomId`로 채팅방 이동 |
| 보낸 요청 | **보낸 요청 목록** `GET /requests/sent` (거절이면 `rejectReason` 표시) |
| 거절 사유 입력 (다이얼로그) | **요청 거절** `PATCH /requests/{type}/{id}/reject` (`ETC`면 상세 필수) |
| (사이드바 요청 뱃지) | **받은 요청 목록** `status=PENDING` (`size=100`으로 받아 개수 표시. 총개수 필드는 없음) |

⚠️ `requestId`는 항상 `requestType`과 함께 다룹니다 (React key: `${requestType}-${requestId}`).

### 7단계 · 채팅
| 화면 | API |
| --- | --- |
| 채팅 목록 | **채팅방 목록** `GET /chatrooms` (`unreadCount` 뱃지) |
| 1:1 채팅 | **채팅방 상세** `GET /chatrooms/{id}` (`contextCard`), **메시지 목록** `GET .../messages` (커서 방식, 최신부터), **메시지 전송** `POST .../messages`, **읽음 처리** `PATCH .../read`, WebSocket (`message.new`, `message.read` 수신 전용) |
| 📎 연결 동료 | **내 연결 목록** `GET /connections` (`chatRoomId`로 채팅방 이동) |

### 8단계 · 운영 관리 (`role=ADMIN`만)
| 화면 | API |
| --- | --- |
| 운영 관리 | **운영 현황** `GET /admin/dashboard` (가입 대기 수, 신고 대기 수) |
| 가입 승인 | **가입 승인 대기 목록** `GET /admin/signups`, **가입 승인** `PATCH /admin/signups/{userId}/approve` |
| 신고 관리 | **신고 목록** `GET /admin/reports`, **신고 처리** `PATCH /admin/reports/{reportId}/resolve` (메모 선택) |

마이 화면의 "운영 관리" 카드는 `role=ADMIN`일 때만 보여줍니다.

---

## 3. 디자인과 API가 맞지 않았던 부분 (2026-11-14 기준)

처음 디자인을 확인했을 때의 목록입니다. 처리 방법은 4절에 있습니다.

| # | 화면 | 디자인 | API |
| --- | --- | --- | --- |
| 1 | 회원가입 | 직무, 이메일, 비밀번호, 비밀번호 확인 | `loginId`(영문·숫자 4~20자), `password`, `inviteCode`(필수) |
| 2 | 프로필 작성 | 이름, 소속, 역할(자유 입력), 연락처, 한 줄 소개 | `bio`, `major`, `department`(`DEV`/`AI`/`DESIGN`), `contact`. 이름은 초대 코드에 등록된 값이 가입 시 자동 저장됨(`../../backend/BACKEND_SPEC.md:300`, 프론트 저장소 밖) |
| 3 | 가입 승인 대기 | "멤버 먼저 둘러보기" 버튼 | 멤버 검색은 승인 필요 → 403 |
| 4 | 모집 글 작성 | 제목, 프로젝트 소개, 관련 키워드(자유 입력) | `requiredRoles`(1개 이상 필수), 키워드는 `keywordIds` |
| 5 | 모집 글 목록 | 분류 필터, D-day 마감일 | `sort=LATEST`만 지원, 분류·마감일 없음 |
| 6 | 멤버 탐색 / 프로필 | 카드에 한 줄 소개, "연결 가능" 뱃지 | 검색 결과에 `bio`·연결 상태 없음 |
| 7 | 멤버 프로필 | 신고·차단 버튼 없음 | 신고, 차단, 차단 해제 API 있음 |
| 8 | 마이 | 나의 연결 수, 작성한 모집 수, 내가 붙인 메모(내 모집글) | 연결 총개수 없음, 내가 쓴 모집글 API 없음 |
| 9 | 사이드바 | "프로필 80%" 진행률 | 해당 값 없음 |
| 10 | 채팅 | 입력창 옆 `+`(첨부) 버튼 | 텍스트 메시지만 지원 |
| 11 | 화면 누락 | 모바일·PC 일부 화면 없음 | — (2026-11-15 디자인에서 모두 추가됨) |

---

## 4. 결정 사항

### 원칙
1. **백엔드 API에 없는 기능은 화면에서 뺀다.** 디자인에 있어도 만들지 않습니다.
2. **API에 있는데 디자인에 없던 입력칸은 새로 수정된 Figma 디자인을 따른다.**

Figma가 아직 결정 사항과 다르면 **결정 사항대로 만듭니다** (4-2, 4-3절 참고).

### 4-1. 3절 1~10번 처리

| # | 화면 | 적용 원칙 | 결정 | Figma 반영 (2026-11-15) |
| --- | --- | --- | --- | --- |
| 1 | 회원가입 | ② | 직무·이메일 입력칸 제거. 아이디(영문·숫자 4~20자)·비밀번호·비밀번호 확인·초대 코드로 구성 | ✅ 모바일·PC |
| 2 | 프로필 작성 | ①② | 이름은 입력칸 없이 `GET /users/me`의 `name`을 읽기 전용으로 표시. 역할은 DEV/AI/DESIGN 중 하나 선택. 전공·연락처·자기소개 입력 | ✅ 반영됨. 단 4-2의 ⑤ |
| 3 | 가입 승인 대기 | ① | "멤버 먼저 둘러보기" 제거. "승인 상태 확인"(승인 상태 조회 API)과 "로그아웃" 버튼으로 구성 | 모바일 ✅ / PC ❌ (4-2의 ①) |
| 4 | 모집 글 작성 | ② | 모집 역할(DEV/AI/DESIGN, 1개 이상) 선택칸 추가. 관련 키워드는 검색해서 고르는 칩 방식 | ✅ 모바일·PC |
| 5 | 모집 글 목록 | ① | 분류 필터와 D-day 마감일 제거 | 목록 ✅ / 상세 ❌ (4-2의 ②) |
| 6 | 멤버 탐색 / 프로필 | ① | 카드의 한 줄 소개와 "연결 가능" 뱃지 제거 (소개는 프로필 다이얼로그에서만 표시) | 카드 소개 ✅ / 뱃지 ❌ (4-2의 ③) |
| 7 | 멤버 프로필 | ② | 프로필 다이얼로그에 "신고하기"·"차단하기" 텍스트 링크 추가. 차단 해제는 디자인에 없으므로 만들지 않음 | ✅ 모바일·PC |
| 8 | 마이 | ① | "내가 붙인 메모"(내 모집글)와 "나의 연결"·"작성한 모집" 통계 카드 제거 | 메모 ✅ / 통계 카드 ❌ (4-2의 ④) |
| 9 | 사이드바 | ① | 프로필 진행률(80%) 제거. 이름만 표시 | ✅ |
| 10 | 채팅 | ① | 입력창 옆 `+` 버튼 제거 | ✅ |

### 4-2. 수정된 Figma에 아직 남아 있는 불일치

| # | 화면 (노드) | Figma 현재 상태 | 결정 (원칙 ①: 만들지 않음) |
| --- | --- | --- | --- |
| ① | PC 가입 승인 대기 (1:614) | "승인 상태 확인"·"로그아웃" 버튼이 없음. "승인 전에도 공개된 멤버와 모집 글을 둘러볼 수 있어요." 문구가 남아 있음 (사실과 다름) | 모바일(1:396)처럼 두 버튼을 두고, 해당 문구는 넣지 않음 |
| ② | 모집 글 상세 (PC 1:476 등) | 다이얼로그 상단에 "RECRUIT DETAIL · D-4" | D-day 빼고 "RECRUIT DETAIL"만 |
| ③ | 멤버 프로필 (1:137, 1:423) | 프로필 배너에 "연결 가능" 뱃지 | 뱃지 제거 |
| ④ | 마이 (1:275, 1:571) | "나의 연결 08", "작성한 모집 03" 통계 카드 | 통계 카드 영역 제거 |
| ⑤ | 프로필 작성 (1:287, 1:584) | `contact` 칸 라벨이 모바일 "활동 링크"(GitHub 등), PC "연락처"로 다름. PC 다이얼로그에 "와이어프레임의 … 체험할 수 있어요" 데모 문구 | 라벨은 Figma 팀 확인 필요. 데모 문구는 넣지 않음 |
| ⑥ | 멤버 탐색 필터 (1:124, 1:408) | 분야 필터 "전체·개발·디자인·기획" | API `department`는 `DEV`/`AI`/`DESIGN` → "전체·개발·AI·디자인"으로 만듦 ("기획"은 API에 없음) |
| ⑦ | 멤버 탐색 (1:124, 1:408) | "현재 대기 중 24명", "6명의 메모가 붙어 있어요" 인원 수 | 멤버 검색 응답에 총개수 없음 → 숫자 제거 |
| ⑧ | 멤버 카드·프로필 | "프론트엔드 개발자", "서비스 기획자" 같은 직무 표시 | API는 `department`만 있음 → 개발/AI/디자인으로 표시 |
| ⑨ | PC 회원가입 (1:628) | 모바일에 있는 "이미 계정이 있나요? 로그인" 링크가 없음 | 모바일처럼 링크를 둠 (화면 이동이라 API 무관) |

### 4-3. 추가 결정 (2026-11-15)

4-2의 불일치를 아래처럼 확정했습니다. Figma가 고쳐지지 않아도 이대로 만듭니다.

| # | 대상 | 결정 |
| --- | --- | --- |
| 1 | PC 가입 승인 대기 (4-2 ①) | 모바일 승인 대기(1:396)와 **같은 내용**으로 만든다: 안내 문구("운영진이 프로필과 키워드를 확인하고 있어요…"), "승인 상태 확인" 버튼(승인 상태 조회 API), "로그아웃". "승인 전에도 둘러볼 수 있어요" 문구는 **뺀다**. |
| 2 | 모집 글 상세 (4-2 ②) | D-day("D-4")를 **뺀다**. |
| 3 | 멤버 프로필 (4-2 ③) | "연결 가능" 뱃지 등 **연결 상태 표시를 뺀다**. "연결 요청 보내기" 버튼은 같이 해요 제안 API가 있으므로 둔다. |
| 4 | 마이 (4-2 ④) | "나의 연결"·"작성한 모집" **통계 카드를 뺀다**. |
| 5 | 멤버 탐색 (4-2 ⑥⑦) | 분야 필터는 **전체 · 개발(`DEV`) · AI(`AI`) · 디자인(`DESIGN`)**. "전체"는 `department`를 보내지 않는 것. 인원 수("24명", "6명의 메모")는 **뺀다**. |
| 6 | 프로필 작성 (4-2 ⑤) | `contact` 칸 문구는 **"연락처"**로 통일한다 (모바일의 "활동 링크" 대신). |

### 4-4. 구현 범위: 모바일과 PC를 화면마다 같이 (2026-11-15 변경)

- **화면마다 모바일과 PC를 같이 만든다.** 1절 표의 "모바일" 열과 "PC" 열 노드를 둘 다 보고 한 화면(같은 주소)에서 반응형으로 만든다.
- **1024px(Tailwind `lg`) 이상에서 PC 디자인을 보여준다.** 그 미만은 모바일 디자인.
- PC 공통 틀: 하단 내비 화면은 왼쪽 사이드바(248px) + 상단바(`AppShell`/`MainLayout`), 로그인·회원가입은 사이드바 없이 가운데 358px 열(`AuthLayout`).
- 사이드바 "요청" 뱃지는 받은 요청 중 대기(PENDING) 개수, 프로필 바로가기의 진행률("프로필 80%")은 4-1의 9번 결정대로 넣지 않는다.
- (이전 결정 "모바일 먼저, PC는 가운데 모바일 폭"은 폐기.) 임시로 쓰던 `MobileColumn`은 가입 설정 PC 버전을 만들며 없앴다.
- 다이얼로그(`Dialog`)는 모바일은 아래 시트, PC는 오른쪽 가운데 520 카드(Figma `Dialog/* Device=PC` 배치).

---

## 5. Figma 기준과 UI 통일

### 기준
1. **컴포넌트 섹션(1:705)과 조립 화면(1:122)이 다르면 조립 화면을 따른다.**
2. **공통 컴포넌트(`components/ui`)는 조립 화면에서 실제로 쓰인 모양으로 만든다.**
3. **같은 요소가 화면마다 조금씩 다르면 가장 많이 쓰인 모양 하나로 통일한다.** 아래 표가 통일 결과입니다.

### 통일한 요소 (조립 화면 43개, 버튼류 355개 기준)

테두리 두께가 1.02px, 1.23px처럼 소수로 나온 것은 프레임 크기를 조정하다 생긴 값으로 보고 정수로 맞췄습니다.

| 요소 | 화면마다 다른 점 (사용 횟수) | 통일 결과 |
| --- | --- | --- |
| Primary 버튼 (노랑) | 테두리 2px (25), 1.02px (13), 1.23px (9) | 바탕 `#FFE66D`, 테두리 `#292822` **2px**, 그림자 4px 4px (흐림 없음), 높이 44, 12px Bold, 모서리 0 |
| Secondary 버튼 (흰색) | 테두리 1.02px (9), 1.23px (6), 2px "취소" (2) / 바탕 `#FFFFFF` (17), `#FFFEF9` "이전" (1) | 바탕 `#FFFFFF`, 테두리 `#DEDDD5` **1px**, 그림자 없음, 높이 44, 12px Bold |
| Outline 버튼 (진한 테두리) | 테두리 1.23px (2), 2px (2) — 동률 | 바탕 `#FFFEF9`, 테두리 `#292822` **2px** (Primary와 같은 두께로) |
| "이전" 버튼 | 모바일은 Secondary, PC는 Outline 모양 | **Secondary**로 통일 |
| "취소" 버튼 (거절 사유) | Secondary 색인데 테두리 2px | **Secondary**(1px)로 통일 |
| 닫기 아이콘 버튼 (36px 원) | 테두리 1px (5), 1.02px (4), 1.23px (4) | 바탕 흰색, 테두리 `#DEDDD5` **1px**, 지름 36 |
| 필터 칩 (멤버 분야) | 테두리 1.02px (6), 1.23px (9). 컴포넌트(`Chip/Filter`)가 아닌 일반 프레임으로 그려짐 | `Chip/Filter` 모양, 높이 35, 테두리 **1px**, 선택 시 바탕 `#292822` |
| 키워드 삭제 칩 (`#React ×`) | 높이 31·글자 11px (10), 높이 29·글자 10px (8, PC 키워드 화면) | **높이 31, 글자 11px**, 반투명 흰 바탕, 테두리 1px, 완전히 둥근 모서리 |
| 하단 내비 항목 | 높이 46 (44), 47 (30) | **높이 46** |

통일하지 않은 것 (의도된 변형): 사이드바 항목의 선택/기본 상태, 로고의 모바일·PC·온보딩 크기, 멤버·모집 카드의 모바일(290)·PC(310) 높이와 4가지 색.

---

## 6. 공통 레이아웃 · 컴포넌트 (Figma → 코드)

전체 모양은 개발 서버에서 `/dev` 페이지로 볼 수 있습니다 (배포 빌드에서는 404).

| Figma 컴포넌트 (컴포넌트 섹션 1:705) | 코드 | 비고 |
| --- | --- | --- |
| Navigation/Top Bar (Mobile) | `components/layout/TopNav` | 로고 → 멤버, 아바타 → 마이 |
| Navigation/Bottom · Bottom Item | `components/layout/BottomNav` | 경로로 선택 표시 (`/members/3`도 멤버) |
| Navigation/Flow Header | `components/layout/FlowHeader` | `backHref` 없으면 브라우저 뒤로 |
| Navigation/Onboarding Header | `components/layout/OnboardingHeader` | `step`으로 "가입 설정 n/3" |
| Dialog/* (Mobile·PC) + Overlay/Scrim | `components/layout/Dialog` | 모바일: 아래 시트 / PC: 오른쪽 가운데 520 카드. `visual`(배너·아이콘), `headerActions`(… 메뉴). Esc·배경 클릭으로 닫힘 |
| (멤버 프로필 "…" 메뉴) | `ui/Menu`의 `MoreMenu` | 아이콘은 Figma Icon 세트에 없어 점 세 개(`more`)로 그림 |
| Navigation/Sidebar · Sidebar Item · Profile Shortcut, Note/Daily (PC) | `components/layout/Sidebar` | 요청 뱃지 = 받은 요청 대기 개수, 진행률 없음 |
| Navigation/Top Bar (PC) | `components/layout/PcTopBar` | 현재 메뉴 이름 + 한 줄 설명 |
| (모바일 Top·Bottom + PC Sidebar·Top 묶음) | `components/layout/AppShell` (그리기만) / `MainLayout` (뱃지·이름을 불러옴) | 멤버·모집·요청·채팅·마이 화면 틀 |
| PC · 계정 · 로그인/회원가입 틀 | `components/layout/AuthLayout` | 모바일 Flow header, PC 가운데 358px 열 |
| Button/Primary · Secondary · Outline | `ui/Button` (`variant`) | 5절 통일 결과 적용 |
| Button/Text Link | `ui/Button`의 `TextButton` | |
| Button/Icon · Button/Icon Utility | `ui/Button`의 `IconButton` | `round`(닫기) / `plain`(뒤로) |
| Input/Text · Password · Email, Field/* | `ui/Input`의 `Input`, `Field`, `TextField` | `size`: auth(50px) / dialog(43px) |
| Input/Textarea, Field/Textarea | `ui/Input`의 `Textarea` | |
| Input/Search | `ui/Input`의 `SearchInput` | |
| Chip/Filter | `ui/Chip`의 `FilterChip` | |
| Tag/Keyword | `ui/Chip`의 `KeywordTag` | 읽기 전용 `#React`. `size`: sm(카드) / md(프로필 다이얼로그) |
| Card/Member | `app/members/MemberCard` (멤버 화면 전용) | 한 줄 소개·"연결 가능" 없음, 분야는 개발·AI·디자인 |
| Keyword/Chip | `ui/Chip`의 `KeywordChip` | `onRemove`로 × 표시 |
| Badge/Count | `ui/Badge`의 `CountBadge` | Badge/Status·Deadline은 4-3 결정으로 만들지 않음 |
| Avatar(Small · Medium · Large) | `ui/Avatar` | `toneFor(id)`로 사람마다 같은 색 |
| Tab/Request | `ui/Tabs` | |
| Card/Member · Card/Recruit 바탕, Decor/Tape | `ui/Card`의 `NoteCard`, `Tape`, `noteToneAt` | 카드 내용은 화면에서 조립 |
| Card/Request | `ui/Card`의 `BoxCard` | |
| Card/Management Link · Card/Admin Action | `ui/Card`의 `LinkCard` | |
| Page Intro · Intro/Flow | `ui/PageIntro` (`variant` main / flow) | |
| Feedback/State | `ui/StateMessage` | empty / error |
| Onboarding/Progress | `ui/ProgressBar` | |
| Brand/Logo | `ui/Logo` | mobile / onboarding / pc |
| Icon (+ 아바타·하단 내비 아이콘) | `ui/Icon` | Figma에서 내보낸 SVG 경로, 색은 `text-*` |

디자인 토큰(색·글꼴·글자 크기·그림자·폭)은 `src/app/globals.css`의 `@theme`에 있습니다. 예: `bg-paper`, `text-muted`, `text-11`, `font-display text-display-xl`, `shadow-hard`, `max-w-mobile`.
