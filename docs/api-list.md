# GDGoC 인력사무소 API 목록 (프론트엔드용)

`../../backend/BACKEND_SPEC.md`(프론트 저장소 밖, 백엔드 폴더)와 실제 백엔드 코드(컨트롤러, DTO, SecurityConfig, ApprovalPolicy)를 대조해 정리했습니다. 둘 사이에 다른 점은 없었습니다.

- 기본 주소: `http://localhost:8080` (Swagger: `/swagger-ui/index.html`)
- 날짜는 `2026-10-05T10:00:00` 형식(타임존 없음, 서울 시간)입니다.

## 공통 규칙

### 로그인 열 읽는 법
| 표기 | 의미 |
| --- | --- |
| ❌ 불필요 | 토큰 없이 호출 |
| 🔑 승인 전 OK | `Authorization: Bearer {accessToken}` 필요, 운영진 승인 전(PENDING)에도 호출 가능 |
| 🔑 승인 필요 | 토큰 필요 + 운영진 승인(APPROVED) 후에만 가능. 승인 전이면 `403 AUTH403` |
| 👑 운영진 | 토큰 필요 + `role=ADMIN`만 가능. 아니면 `403 ADMIN403` |

### 응답 포맷
모든 응답은 아래 형태로 감싸져 옵니다. 표의 "받는 데이터"는 `result` 안의 내용입니다. "없음"이면 `result` 필드가 아예 빠집니다.
```json
{ "isSuccess": true, "code": "200 OK", "message": "요청 성공", "result": { } }
{ "isSuccess": false, "code": "AUTH401", "message": "유효하지 않은 토큰입니다." }
```

### 페이지 목록 (`Page`)
`page`(0부터, 기본 0), `size`(기본 20, 1~100)를 query로 보내면 아래처럼 받습니다.
```json
{ "items": [ ], "page": 0, "size": 20, "hasNext": false }
```
운영진 목록 2개는 여기에 `totalCount`가 더 붙습니다(`CountedPage`).

### 자주 쓰는 값
| 이름 | 값 |
| --- | --- |
| Department (분야) | `DEV`, `AI`, `DESIGN` |
| Relation (키워드 관계) | `CAN`(할 수 있어요), `LEARNING`(배우고 있어요), `INTERESTED`(관심 있어요) |
| ReasonType (제안 사유) | `PROJECT`, `STUDY`, `CONTEST`, `COFFEE_CHAT`, `HOBBY`, `ETC` |
| RejectReasonType (거절 사유) | `SCHEDULE`, `NOT_MATCHED`, `CLOSED`, `ETC` |
| RequestType | `PROPOSAL`(같이 해요), `APPLICATION`(모집글 지원) |
| RequestStatus | `PENDING`, `ACCEPTED`, `REJECTED` |
| UserStatus | `PENDING`, `APPROVED` |
| Role | `MEMBER`, `ADMIN` |
| ReportTargetType | `USER`, `POST`, `MESSAGE` |
| ReportStatus | `PENDING`, `RESOLVED` |

표기: `?`가 붙은 필드는 선택입니다. `Keyword` = `{ keywordId, name }`, `KeywordGroup` = `{ can: Keyword[], learning: Keyword[], interested: Keyword[] }`, `Member` = `{ memberId, name }`

---

## 1. 회원가입 · 로그인

| 기능 | 요청 방식 | 주소 | 보내는 데이터 | 받는 데이터 | 로그인 |
| --- | --- | --- | --- | --- | --- |
| 회원가입 | POST | `/api/v1/auth/signup` | body `{ loginId(영문·숫자 4~20자), password(8자 이상), inviteCode }` | `{ userId, accessToken, refreshToken, status }` | ❌ 불필요 |
| 로그인 | POST | `/api/v1/auth/login` | body `{ loginId, password }` | `{ accessToken, refreshToken, status, role, onboardingStep }` | ❌ 불필요 |
| 토큰 재발급 | POST | `/api/v1/auth/refresh` | body `{ refreshToken }` | `{ accessToken, refreshToken }` | ❌ 불필요 |
| 승인 상태 조회 | GET | `/api/v1/auth/approval-status` | 없음 | `{ status }` | 🔑 승인 전 OK |

- `onboardingStep`: `PROFILE`(프로필 작성 필요) → `KEYWORD`(키워드 등록 필요) → `WAITING`(승인 대기) → `DONE`. 로그인 후 어느 화면으로 보낼지 정할 때 씁니다.
- 재발급하면 이전 refreshToken은 폐기되므로 새로 받은 두 토큰을 모두 저장해야 합니다. Access 30분, Refresh 14일.

## 2. 내 정보 · 프로필 · 키워드

| 기능 | 요청 방식 | 주소 | 보내는 데이터 | 받는 데이터 | 로그인 |
| --- | --- | --- | --- | --- | --- |
| 내 정보 조회 | GET | `/api/v1/users/me` | 없음 | `{ userId, name, major, department, bio, contact, role }` (프로필 미작성이면 major·department·bio·contact가 null) | 🔑 승인 전 OK |
| 프로필 작성 | POST | `/api/v1/users/me/profile` | body `{ bio(100자 이내), major, department, contact }` | 없음 | 🔑 승인 전 OK |
| 프로필 수정 | PATCH | `/api/v1/users/me/profile` | body `{ bio?, major?, department?, contact? }` (보낸 것만 수정) | 없음 | 🔑 승인 필요 |
| 키워드 검색(자동완성) | GET | `/api/v1/keywords` | query `q`(1자 이상), `size?`(기본 10) | `{ items: Keyword[] }` | 🔑 승인 전 OK |
| 내 키워드 저장 | PUT | `/api/v1/users/me/keywords` | body `{ can: id[], learning: id[], interested: id[] }` (빈 배열 가능, 각 20개까지, 전체 교체) | 없음 | 🔑 승인 전 OK |
| 내 키워드 조회 | GET | `/api/v1/users/me/keywords` | 없음 | `KeywordGroup` | 🔑 승인 필요 |

## 3. 멤버 탐색 · 같이 해요 · 신고 · 차단

| 기능 | 요청 방식 | 주소 | 보내는 데이터 | 받는 데이터 | 로그인 |
| --- | --- | --- | --- | --- | --- |
| 멤버 검색 | GET | `/api/v1/members` | query `keyword?`, `relation?`(keyword와 함께만 적용), `department?`, `page?`, `size?` | `Page` of `{ memberId, name, department, keywords: string[](최대 3개) }` | 🔑 승인 필요 |
| 멤버 프로필 조회 | GET | `/api/v1/members/{memberId}` | path `memberId` | `{ memberId, name, bio, major, department, contact, keywords: KeywordGroup }` | 🔑 승인 필요 |
| 같이 해요 제안 | POST | `/api/v1/proposals` | body `{ receiverId, reasonType, message(200자 이내) }` | `{ proposalId }` | 🔑 승인 필요 |
| 신고 | POST | `/api/v1/reports` | body `{ targetType, targetId, reason(200자 이내) }` | `{ reportId }` | 🔑 승인 필요 |
| 차단 | POST | `/api/v1/blocks` | body `{ targetMemberId }` | 없음 | 🔑 승인 필요 |
| 차단 해제 | DELETE | `/api/v1/blocks/{targetMemberId}` | path `targetMemberId` | 없음 | 🔑 승인 필요 |

## 4. 모집글

| 기능 | 요청 방식 | 주소 | 보내는 데이터 | 받는 데이터 | 로그인 |
| --- | --- | --- | --- | --- | --- |
| 모집글 목록 | GET | `/api/v1/posts` | query `sort?`(`LATEST`만 지원), `page?`, `size?` | `Page` of `{ postId, title, descriptionPreview(앞 100자), keywords: string[], authorName, createdAt }` | 🔑 승인 필요 |
| 모집글 상세 | GET | `/api/v1/posts/{postId}` | path `postId` | `{ postId, title, description, requiredRoles: string[], keywords: string[], author: Member, isAuthor, hasApplied, createdAt }` | 🔑 승인 필요 |
| 모집글 작성 | POST | `/api/v1/posts` | body `{ title(50자 이내), description, requiredRoles: string[](1개 이상), keywordIds?: id[] }` | `{ postId }` | 🔑 승인 필요 |
| 모집글 수정 | PATCH | `/api/v1/posts/{postId}` | path `postId`, body `{ title?, description?, requiredRoles?, keywordIds? }` (보낸 것만 수정, 배열은 전체 교체) | 없음 | 🔑 승인 필요 (작성자만) |
| 모집글 삭제 | DELETE | `/api/v1/posts/{postId}` | path `postId` | 없음 | 🔑 승인 필요 (작성자만) |
| 모집글 지원 | POST | `/api/v1/posts/{postId}/applications` | path `postId` (body 없음) | `{ applicationId }` | 🔑 승인 필요 |

- 상세의 `isAuthor`로 수정·삭제 버튼을, `hasApplied`로 지원 버튼 상태를 정하면 됩니다.

## 5. 요청 (받은/보낸 제안·지원)

| 기능 | 요청 방식 | 주소 | 보내는 데이터 | 받는 데이터 | 로그인 |
| --- | --- | --- | --- | --- | --- |
| 받은 요청 목록 | GET | `/api/v1/requests/received` | query `status?`(없으면 전체), `page?`, `size?` | `Page` of `{ requestId, requestType, sender: Member, content, reasonType(APPLICATION이면 null), status, createdAt }` | 🔑 승인 필요 |
| 보낸 요청 목록 | GET | `/api/v1/requests/sent` | query `status?`, `page?`, `size?` | `Page` of `{ requestId, requestType, receiver: Member, content, status, rejectReason: { type, detail } \| null, createdAt }` | 🔑 승인 필요 |
| 요청 수락 | PATCH | `/api/v1/requests/{requestType}/{requestId}/accept` | path `requestType`, `requestId` (body 없음) | `{ connectionId, chatRoomId }` | 🔑 승인 필요 (받은 사람만) |
| 요청 거절 | PATCH | `/api/v1/requests/{requestType}/{requestId}/reject` | path 위와 동일, body `{ reasonType, reasonDetail?(200자 이내, reasonType=ETC면 필수) }` | 없음 | 🔑 승인 필요 (받은 사람만) |

- `requestId`는 PROPOSAL과 APPLICATION이 따로 번호를 매기므로 **항상 `requestType`과 같이** 다뤄야 합니다(React key도 `${requestType}-${requestId}`처럼).
- `content`는 PROPOSAL이면 제안 메시지, APPLICATION이면 모집글 제목입니다.
- 수락하면 받은 `chatRoomId`로 바로 채팅방으로 이동할 수 있습니다.

## 6. 내 연결 · 채팅

| 기능 | 요청 방식 | 주소 | 보내는 데이터 | 받는 데이터 | 로그인 |
| --- | --- | --- | --- | --- | --- |
| 내 연결 목록 | GET | `/api/v1/connections` | query `page?`, `size?` | `Page` of `{ connectionId, member: { memberId, name, major, department }, keywords: string[](최대 3개), chatRoomId, createdAt }` | 🔑 승인 필요 |
| 채팅방 목록 | GET | `/api/v1/chatrooms` | query `page?`, `size?` | `Page` of `{ chatRoomId, member: Member, lastMessage \| null, lastMessageAt \| null, unreadCount }` | 🔑 승인 필요 |
| 채팅방 상세 | GET | `/api/v1/chatrooms/{chatRoomId}` | path `chatRoomId` | `{ chatRoomId, member: Member, contextCard: { sourceType, title, content } }` | 🔑 승인 필요 (참여자만) |
| 메시지 목록 | GET | `/api/v1/chatrooms/{chatRoomId}/messages` | path `chatRoomId`, query `cursor?`(이 messageId보다 이전), `size?`(기본 30) | `{ items: [{ messageId, senderId, isMine, content, isRead, createdAt }], hasNext, nextCursor \| null }` | 🔑 승인 필요 (참여자만) |
| 메시지 전송 | POST | `/api/v1/chatrooms/{chatRoomId}/messages` | path `chatRoomId`, body `{ content(1~1000자) }` | `{ messageId, content, createdAt }` | 🔑 승인 필요 (참여자만) |
| 읽음 처리 | PATCH | `/api/v1/chatrooms/{chatRoomId}/read` | path `chatRoomId`, body `{ lastReadMessageId }` | 없음 | 🔑 승인 필요 (참여자만) |

- 메시지 목록은 **최신 메시지가 먼저** 옵니다. 위로 스크롤할 때 `nextCursor`를 `cursor`로 넣어 더 이전 메시지를 불러옵니다(채팅만 page 대신 커서 방식).
- `contextCard`는 "어떻게 연결됐는지" 카드입니다. PROPOSAL이면 title=제안 사유 이름, content=제안 메시지. APPLICATION이면 title=모집글 제목, content=설명 앞 100자.
- 차단 관계인 방에 메시지를 보내면 `403 CHAT403`이 옵니다.

### 실시간 수신 (WebSocket)
| 항목 | 내용 |
| --- | --- |
| 주소 | `ws://localhost:8080/ws/chatrooms/{chatRoomId}?token={accessToken}` |
| 로그인 | 🔑 토큰을 쿼리 `token`으로 전달 (해당 방 참여자만 연결 가능) |
| 방향 | 서버 → 클라이언트 **수신 전용**. 보내기는 위의 REST 메시지 전송 API를 씁니다 |
| 이벤트 `message.new` | `{ "event": "message.new", "data": { messageId, senderId, isMine:false, content, isRead, createdAt } }` |
| 이벤트 `message.read` | `{ "event": "message.read", "data": { "lastReadMessageId": 10 } }` → 내가 보낸 메시지 중 이 id 이하를 읽음 표시 |

- 이벤트는 **상대방에게만** 갑니다. 내가 보낸 메시지는 전송 API의 응답으로 화면에 추가하세요.
- 연결 실패 시 HTTP 상태: 경로 오류 404, 토큰 오류 401, 참여자가 아니면 403.

## 7. 운영 관리 (운영진 화면용)

| 기능 | 요청 방식 | 주소 | 보내는 데이터 | 받는 데이터 | 로그인 |
| --- | --- | --- | --- | --- | --- |
| 운영 현황 | GET | `/api/v1/admin/dashboard` | 없음 | `{ pendingSignupCount, pendingReportCount }` | 👑 운영진 |
| 가입 승인 대기 목록 | GET | `/api/v1/admin/signups` | query `page?`, `size?` | `CountedPage` of `{ userId, name, major, department, keywords: string[](최대 3개) }` | 👑 운영진 |
| 가입 승인 | PATCH | `/api/v1/admin/signups/{userId}/approve` | path `userId` (body 없음) | 없음 | 👑 운영진 |
| 신고 목록 | GET | `/api/v1/admin/reports` | query `status?`(기본 `PENDING`), `page?`, `size?` | `CountedPage` of `{ reportId, targetType, targetId, targetName, reporterName, reason, status, createdAt }` | 👑 운영진 |
| 신고 처리 | PATCH | `/api/v1/admin/reports/{reportId}/resolve` | path `reportId`, body `{ memo?(200자 이내) }` (body 생략 가능) | 없음 | 👑 운영진 |

---

## 프론트 구현 시 참고

- **공통 에러 처리**: `AUTH401`이면 refresh로 재발급 후 재시도하고, 재발급도 `REFRESH401`이면 로그인 화면으로 보냅니다. `AUTH403`이면 승인 대기 화면으로 보냅니다.
- **승인 전 사용자가 쓸 수 있는 API는 8개뿐**입니다(auth 4개, 내 정보 조회, 프로필 작성, 키워드 검색, 키워드 저장). 특히 **프로필 수정과 내 키워드 조회는 승인 후에만** 됩니다. 온보딩 화면에서 이 둘을 부르면 403이 납니다.
- 로컬 테스트 계정: 운영진 `admin` / `admin1234!`, 초대 코드 `GDGOC-INVITE-01` ~ `GDGOC-INVITE-05`.
