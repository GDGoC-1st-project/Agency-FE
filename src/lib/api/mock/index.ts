/**
 * 가짜 데이터 모드 (NEXT_PUBLIC_USE_MOCK=true).
 * client.ts가 실제 서버 대신 여기로 요청을 보냅니다. 응답은 docs/api-list.md 형식(공통 래퍼 포함)을 따르고,
 * 실패도 실제 백엔드와 같은 에러 코드로 돌려주므로 화면의 에러 처리를 그대로 확인할 수 있습니다.
 *
 * - 로그인은 항상 성공하고, 승인된 일반 사용자(강민지, MEMBER, onboardingStep=DONE)로 처리합니다.
 * - 데이터는 메모리에만 있어서 새로고침하면 처음 상태로 돌아갑니다.
 * - 운영진 API도 데이터를 돌려줍니다 (역할 검사 안 함). 운영 화면을 만들 때 쓰세요.
 */
import type {
  ApiResponse,
  ChatSocketEvent,
  Department,
  MessageItem,
  Page,
  RejectReasonType,
  ReportStatus,
  ReportTargetType,
  RequestStatus,
  RequestType,
  UserStatus,
} from "@/types/api";
import {
  ME_ID,
  blockedIds,
  chatRooms,
  findUser,
  keywords,
  nextId,
  posts,
  reports,
  requests,
  signups,
  timeAgo,
  topKeywords,
  users,
  type MockChatRoom,
  type MockPost,
  type MockRequest,
} from "./data";
import { REASON_LABEL } from "@/lib/labels";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Query = Record<string, string | number | boolean | null | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Body = any;

// 제안 사유 이름은 화면과 같은 것을 씁니다.

// ───────────────────────── 응답 도우미 ─────────────────────────

class MockFail {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly message: string,
  ) {}
}

const fail = (status: number, code: string, message: string): never => {
  throw new MockFail(status, code, message);
};
const badRequest = (message: string) => fail(400, "COMMON400", message);

function paginate<T>(all: T[], query: Query): Page<T> {
  const page = Math.max(0, Number(query.page ?? 0) || 0);
  const size = Math.min(100, Math.max(1, Number(query.size ?? 20) || 20));
  const start = page * size;
  return { items: all.slice(start, start + size), page, size, hasNext: start + size < all.length };
}

const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

const memberRef = (userId: number) => ({ memberId: userId, name: findUser(userId)?.name ?? "알 수 없음" });

function requireUser(userId: number) {
  const u = findUser(userId);
  if (!u || u.userId === ME_ID) fail(404, "MEMBER404", "존재하지 않는 멤버입니다.");
  return u!;
}

function requirePost(postId: number): MockPost {
  const p = posts.find((x) => x.postId === postId && !x.deleted);
  return p ?? fail(404, "POST404", "존재하지 않는 모집글입니다.");
}

function requireRoom(chatRoomId: number): MockChatRoom {
  const r = chatRooms.find((x) => x.chatRoomId === chatRoomId);
  return r ?? fail(404, "CHAT404", "존재하지 않는 채팅방입니다.");
}

function requireKeywordIds(ids: unknown): number[] {
  const list = Array.isArray(ids) ? ids.map(Number) : [];
  if (list.some((id) => !keywords.some((k) => k.keywordId === id))) {
    fail(404, "KEYWORD404", "존재하지 않는 키워드가 포함되어 있습니다.");
  }
  return list;
}

const keywordNames = (ids: number[]) =>
  ids.map((id) => keywords.find((k) => k.keywordId === id)?.name).filter((n): n is string => !!n);

function requestContent(r: MockRequest): string {
  if (r.requestType === "PROPOSAL") return r.message ?? "";
  return posts.find((p) => p.postId === r.postId)?.title ?? "";
}

function toMessageItem(room: MockChatRoom, m: MockChatRoom["messages"][number]): MessageItem {
  const isMine = m.senderId === ME_ID;
  return {
    messageId: m.messageId,
    senderId: m.senderId,
    isMine,
    content: m.content,
    isRead: isMine ? room.otherLastRead >= m.messageId : true,
    createdAt: m.createdAt,
  };
}

// ───────────────────────── 채팅 실시간 (가짜 WebSocket) ─────────────────────────

const socketListeners = new Map<number, Set<(e: ChatSocketEvent) => void>>();

function emit(chatRoomId: number, event: ChatSocketEvent) {
  socketListeners.get(chatRoomId)?.forEach((fn) => fn(event));
}

const AUTO_REPLIES = ["좋아요! 그렇게 해요.", "확인했어요 🙂", "네, 시간 맞춰 볼게요.", "자료 정리해서 다시 연락드릴게요."];

/** 내가 메시지를 보내면 상대가 읽고 답장하는 흉내를 냅니다. */
function scheduleReply(room: MockChatRoom, myMessageId: number) {
  setTimeout(() => {
    room.otherLastRead = Math.max(room.otherLastRead, myMessageId);
    emit(room.chatRoomId, { event: "message.read", data: { lastReadMessageId: room.otherLastRead } });
  }, 800);
  setTimeout(() => {
    const msg = {
      messageId: nextId("message"),
      senderId: room.memberId,
      content: AUTO_REPLIES[myMessageId % AUTO_REPLIES.length],
      createdAt: timeAgo(0),
    };
    room.messages.push(msg);
    emit(room.chatRoomId, { event: "message.new", data: toMessageItem(room, msg) });
  }, 1800);
}

/** connectChatSocket의 가짜 버전. 반환된 함수로 연결을 닫습니다. */
export function connectMockChatSocket(
  chatRoomId: number,
  onEvent: (event: ChatSocketEvent) => void,
  handlers: { onOpen?: () => void; onClose?: (e: CloseEvent) => void } = {},
): () => void {
  const set = socketListeners.get(chatRoomId) ?? new Set();
  set.add(onEvent);
  socketListeners.set(chatRoomId, set);
  const openTimer = setTimeout(() => handlers.onOpen?.(), 0);
  return () => {
    clearTimeout(openTimer);
    set.delete(onEvent);
    handlers.onClose?.(new CloseEvent("close", { code: 1000 }));
  };
}

// ───────────────────────── 라우트 ─────────────────────────

type Handler = (ctx: { params: string[]; query: Query; body: Body }) => unknown;
type Route = [Method, RegExp, Handler];

const MOCK_TOKENS = { accessToken: "mock-access-token", refreshToken: "mock-refresh-token" };

/** 가짜 초대 코드 → 등록된 이름 (CLAUDE.md의 로컬 테스트 초대 코드와 같음) */
const INVITE_NAMES: Record<string, string> = {
  "GDGOC-INVITE-01": "강민지",
  "GDGOC-INVITE-02": "서지안",
  "GDGOC-INVITE-03": "문하린",
  "GDGOC-INVITE-04": "임준서",
  "GDGOC-INVITE-05": "오하늘",
};

// ───────────────────────── 나(로그인 사용자) 상태 ─────────────────────────
// 회원가입 → 온보딩 → 승인 대기 흐름을 새로고침해도 이어서 볼 수 있도록 sessionStorage에 저장합니다.

const ME_STORAGE_KEY = "mock:me";
const SEED_ME = structuredClone(findUser(ME_ID)!);
const meState: { status: UserStatus; approvalChecks: number } = { status: "APPROVED", approvalChecks: 0 };

function saveMe() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ME_STORAGE_KEY, JSON.stringify({ user: findUser(ME_ID), state: meState }));
  } catch {
    // 저장소를 못 쓰면 메모리에만 둡니다.
  }
}

function loadMe() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(ME_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as { user: object; state: typeof meState };
    Object.assign(findUser(ME_ID)!, saved.user);
    Object.assign(meState, saved.state);
  } catch {
    // 깨진 값이면 무시하고 처음 상태로 시작합니다.
  }
}
loadMe();

/** 승인 전(PENDING) 사용자가 부를 수 있는 API (docs/api-list.md "승인 전 OK" 8개). 그 외는 AUTH403 */
const PENDING_ALLOWED: [Method, RegExp][] = [
  ["POST", /^\/api\/v1\/auth\/(signup|login|refresh)$/],
  ["GET", /^\/api\/v1\/auth\/approval-status$/],
  ["GET", /^\/api\/v1\/users\/me$/],
  ["POST", /^\/api\/v1\/users\/me\/profile$/],
  ["GET", /^\/api\/v1\/keywords$/],
  ["PUT", /^\/api\/v1\/users\/me\/keywords$/],
];

const routes: Route[] = [
  // ── 1. 회원가입 · 로그인
  ["POST", /^\/api\/v1\/auth\/signup$/, ({ body }) => {
    const loginId = String(body?.loginId ?? "");
    if (!/^[A-Za-z0-9]{4,20}$/.test(loginId) || String(body?.password ?? "").length < 8) badRequest("입력값을 확인해 주세요.");
    if (loginId.toLowerCase() === "admin") fail(409, "AUTH409", "이미 사용 중인 아이디입니다.");
    const name = INVITE_NAMES[String(body?.inviteCode ?? "").trim().toUpperCase()];
    if (!name) fail(400, "INVITE400", "유효하지 않거나 이미 사용된 초대 코드입니다.");
    // 새 계정: 프로필·키워드 없이 승인 대기 상태로 시작
    Object.assign(findUser(ME_ID)!, { name, major: null, department: null, bio: null, contact: null, keywords: { can: [], learning: [], interested: [] } });
    Object.assign(meState, { status: "PENDING", approvalChecks: 0 });
    saveMe();
    return { userId: ME_ID, ...MOCK_TOKENS, status: "PENDING" };
  }],
  ["POST", /^\/api\/v1\/auth\/login$/, () => {
    // 로그인은 항상 승인된 일반 사용자(강민지)로 처리
    Object.assign(findUser(ME_ID)!, structuredClone(SEED_ME));
    Object.assign(meState, { status: "APPROVED", approvalChecks: 0 });
    saveMe();
    return { ...MOCK_TOKENS, status: "APPROVED", role: "MEMBER", onboardingStep: "DONE" };
  }],
  ["POST", /^\/api\/v1\/auth\/refresh$/, () => ({ ...MOCK_TOKENS })],
  ["GET", /^\/api\/v1\/auth\/approval-status$/, () => {
    // 승인 대기 중이면 첫 번째 확인은 PENDING, 두 번째 확인부터 APPROVED
    if (meState.status === "PENDING") {
      meState.approvalChecks += 1;
      if (meState.approvalChecks >= 2) meState.status = "APPROVED";
      saveMe();
    }
    return { status: meState.status };
  }],

  // ── 2. 내 정보 · 프로필 · 키워드
  ["GET", /^\/api\/v1\/users\/me$/, () => {
    const me = findUser(ME_ID)!;
    return { userId: me.userId, name: me.name, major: me.major, department: me.department, bio: me.bio, contact: me.contact, role: "MEMBER" };
  }],
  ["POST", /^\/api\/v1\/users\/me\/profile$/, ({ body }) => {
    const me = findUser(ME_ID)!;
    if (me.major) fail(409, "PROFILE409", "이미 프로필이 작성되었습니다.");
    if (!body?.bio || !body?.major || !body?.department || !body?.contact) badRequest("필수 값이 비어 있습니다.");
    if (String(body.bio).length > 100) badRequest("한 줄 소개는 100자 이내로 입력해 주세요.");
    Object.assign(me, { bio: body.bio, major: body.major, department: body.department, contact: body.contact });
    saveMe();
  }],
  ["PATCH", /^\/api\/v1\/users\/me\/profile$/, ({ body }) => {
    const me = findUser(ME_ID)!;
    for (const key of ["bio", "major", "department", "contact"] as const) {
      if (body?.[key] !== undefined) (me[key] as string) = body[key];
    }
    saveMe();
  }],
  ["GET", /^\/api\/v1\/keywords$/, ({ query }) => {
    const q = String(query.q ?? "").trim().toLowerCase();
    if (!q) badRequest("검색어를 입력해 주세요.");
    const size = Number(query.size ?? 10) || 10;
    const items = keywords
      .filter((k) => k.name.toLowerCase().includes(q))
      .sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)))
      .slice(0, size);
    return { items };
  }],
  ["PUT", /^\/api\/v1\/users\/me\/keywords$/, ({ body }) => {
    const group = { can: requireKeywordIds(body?.can), learning: requireKeywordIds(body?.learning), interested: requireKeywordIds(body?.interested) };
    if (Object.values(group).some((ids) => ids.length > 20)) {
      fail(400, "KEYWORD400", "관계별 키워드는 최대 20개까지 등록할 수 있습니다.");
    }
    const toKw = (ids: number[]) => ids.map((id) => keywords.find((k) => k.keywordId === id)!);
    findUser(ME_ID)!.keywords = { can: toKw(group.can), learning: toKw(group.learning), interested: toKw(group.interested) };
    saveMe();
  }],
  ["GET", /^\/api\/v1\/users\/me\/keywords$/, () => findUser(ME_ID)!.keywords],

  // ── 3. 멤버 · 제안 · 신고 · 차단
  ["GET", /^\/api\/v1\/members$/, ({ query }) => {
    const keyword = String(query.keyword ?? "").trim().toLowerCase();
    const relation = query.relation as "CAN" | "LEARNING" | "INTERESTED" | undefined;
    const department = query.department as Department | undefined;
    const relKey = { CAN: "can", LEARNING: "learning", INTERESTED: "interested" } as const;
    const list = users
      .filter((u) => u.userId !== ME_ID && !blockedIds.has(u.userId))
      .filter((u) => !department || u.department === department)
      .filter((u) => {
        if (!keyword) return true;
        const pool = relation ? u.keywords[relKey[relation]] : [...u.keywords.can, ...u.keywords.learning, ...u.keywords.interested];
        return pool.some((k) => k.name.toLowerCase().includes(keyword));
      })
      .sort((a, b) => b.userId - a.userId)
      .map((u) => ({ memberId: u.userId, name: u.name, department: u.department!, keywords: topKeywords(u.keywords) }));
    return paginate(list, query);
  }],
  ["GET", /^\/api\/v1\/members\/(\d+)$/, ({ params }) => {
    const u = requireUser(Number(params[0]));
    return { memberId: u.userId, name: u.name, bio: u.bio, major: u.major, department: u.department, contact: u.contact, keywords: u.keywords };
  }],
  ["POST", /^\/api\/v1\/proposals$/, ({ body }) => {
    const receiverId = Number(body?.receiverId);
    if (receiverId === ME_ID) fail(400, "PROPOSAL400", "본인에게는 제안할 수 없습니다.");
    requireUser(receiverId);
    if (!body?.reasonType || !body?.message || String(body.message).length > 200) badRequest("제안 사유와 200자 이내 메시지를 입력해 주세요.");
    const exists =
      chatRooms.some((c) => c.memberId === receiverId) ||
      requests.some((r) => r.requestType === "PROPOSAL" && r.status === "PENDING" &&
        ((r.senderId === ME_ID && r.receiverId === receiverId) || (r.senderId === receiverId && r.receiverId === ME_ID)));
    if (exists) fail(409, "PROPOSAL409", "이미 연결되었거나 대기 중인 제안이 있습니다.");
    const proposalId = nextId("proposal");
    requests.push({ requestType: "PROPOSAL", requestId: proposalId, senderId: ME_ID, receiverId, reasonType: body.reasonType, message: body.message, postId: null, status: "PENDING", rejectReason: null, createdAt: timeAgo(0) });
    return { proposalId };
  }],
  ["POST", /^\/api\/v1\/reports$/, ({ body }) => {
    const targetType = body?.targetType as ReportTargetType;
    const targetId = Number(body?.targetId);
    const exists =
      (targetType === "USER" && !!findUser(targetId) && targetId !== ME_ID) ||
      (targetType === "POST" && posts.some((p) => p.postId === targetId && !p.deleted)) ||
      (targetType === "MESSAGE" && chatRooms.some((c) => c.messages.some((m) => m.messageId === targetId)));
    if (!exists) fail(404, "REPORT404", "신고 대상을 찾을 수 없습니다.");
    if (reports.some((r) => r.reporterId === ME_ID && r.targetType === targetType && r.targetId === targetId)) {
      fail(409, "REPORT409", "이미 신고한 대상입니다.");
    }
    if (!body?.reason || String(body.reason).length > 200) badRequest("200자 이내로 신고 사유를 입력해 주세요.");
    const reportId = nextId("report");
    reports.push({ reportId, reporterId: ME_ID, targetType, targetId, reason: body.reason, status: "PENDING", memo: null, createdAt: timeAgo(0) });
    return { reportId };
  }],
  ["POST", /^\/api\/v1\/blocks$/, ({ body }) => {
    const id = Number(body?.targetMemberId);
    if (id === ME_ID) fail(400, "BLOCK400", "본인은 차단할 수 없습니다.");
    requireUser(id);
    if (blockedIds.has(id)) fail(409, "BLOCK409", "이미 차단한 멤버입니다.");
    blockedIds.add(id);
  }],
  ["DELETE", /^\/api\/v1\/blocks\/(\d+)$/, ({ params }) => {
    if (!blockedIds.delete(Number(params[0]))) fail(404, "BLOCK404", "차단한 내역이 없습니다.");
  }],

  // ── 4. 모집글
  ["GET", /^\/api\/v1\/posts$/, ({ query }) => {
    const list = posts
      .filter((p) => !p.deleted && !blockedIds.has(p.authorId))
      .sort(byNewest)
      .map((p) => ({
        postId: p.postId, title: p.title, descriptionPreview: p.description.slice(0, 100),
        keywords: keywordNames(p.keywordIds), authorName: findUser(p.authorId)?.name ?? "", createdAt: p.createdAt,
      }));
    return paginate(list, query);
  }],
  ["GET", /^\/api\/v1\/posts\/(\d+)$/, ({ params }) => {
    const p = requirePost(Number(params[0]));
    return {
      postId: p.postId, title: p.title, description: p.description, requiredRoles: p.requiredRoles,
      keywords: keywordNames(p.keywordIds), author: memberRef(p.authorId), isAuthor: p.authorId === ME_ID,
      hasApplied: requests.some((r) => r.requestType === "APPLICATION" && r.postId === p.postId && r.senderId === ME_ID),
      createdAt: p.createdAt,
    };
  }],
  ["POST", /^\/api\/v1\/posts$/, ({ body }) => {
    if (!body?.title || String(body.title).length > 50) badRequest("제목은 1~50자로 입력해 주세요.");
    if (!body?.description) badRequest("설명을 입력해 주세요.");
    if (!Array.isArray(body?.requiredRoles) || body.requiredRoles.length === 0) badRequest("모집 역할을 1개 이상 선택해 주세요.");
    const postId = nextId("post");
    posts.push({ postId, title: body.title, description: body.description, requiredRoles: body.requiredRoles, keywordIds: requireKeywordIds(body.keywordIds ?? []), authorId: ME_ID, createdAt: timeAgo(0), deleted: false });
    return { postId };
  }],
  ["PATCH", /^\/api\/v1\/posts\/(\d+)$/, ({ params, body }) => {
    const p = requirePost(Number(params[0]));
    if (p.authorId !== ME_ID) fail(403, "POST403", "작성자만 수정할 수 있습니다.");
    if (body?.title !== undefined) p.title = body.title;
    if (body?.description !== undefined) p.description = body.description;
    if (body?.requiredRoles !== undefined) p.requiredRoles = body.requiredRoles;
    if (body?.keywordIds !== undefined) p.keywordIds = requireKeywordIds(body.keywordIds);
  }],
  ["DELETE", /^\/api\/v1\/posts\/(\d+)$/, ({ params }) => {
    const p = requirePost(Number(params[0]));
    if (p.authorId !== ME_ID) fail(403, "POST403", "작성자만 삭제할 수 있습니다.");
    p.deleted = true;
  }],
  ["POST", /^\/api\/v1\/posts\/(\d+)\/applications$/, ({ params }) => {
    const p = requirePost(Number(params[0]));
    if (p.authorId === ME_ID) fail(400, "APPLICATION400", "본인의 모집글에는 지원할 수 없습니다.");
    if (requests.some((r) => r.requestType === "APPLICATION" && r.postId === p.postId && r.senderId === ME_ID)) {
      fail(409, "APPLICATION409", "이미 지원한 모집글입니다.");
    }
    const applicationId = nextId("application");
    requests.push({ requestType: "APPLICATION", requestId: applicationId, senderId: ME_ID, receiverId: p.authorId, reasonType: null, message: null, postId: p.postId, status: "PENDING", rejectReason: null, createdAt: timeAgo(0) });
    return { applicationId };
  }],

  // ── 5. 요청
  ["GET", /^\/api\/v1\/requests\/received$/, ({ query }) => {
    const status = query.status as RequestStatus | undefined;
    const list = requests
      .filter((r) => r.receiverId === ME_ID && (!status || r.status === status))
      .sort(byNewest)
      .map((r) => ({ requestId: r.requestId, requestType: r.requestType, sender: memberRef(r.senderId), content: requestContent(r), reasonType: r.reasonType, status: r.status, createdAt: r.createdAt }));
    return paginate(list, query);
  }],
  ["GET", /^\/api\/v1\/requests\/sent$/, ({ query }) => {
    const status = query.status as RequestStatus | undefined;
    const list = requests
      .filter((r) => r.senderId === ME_ID && (!status || r.status === status))
      .sort(byNewest)
      .map((r) => ({ requestId: r.requestId, requestType: r.requestType, receiver: memberRef(r.receiverId), content: requestContent(r), status: r.status, rejectReason: r.rejectReason, createdAt: r.createdAt }));
    return paginate(list, query);
  }],
  ["PATCH", /^\/api\/v1\/requests\/(PROPOSAL|APPLICATION)\/(\d+)\/accept$/, ({ params }) => {
    const r = findReceivedRequest(params[0] as RequestType, Number(params[1]));
    r.status = "ACCEPTED";
    const room: MockChatRoom = {
      chatRoomId: nextId("chatRoom"), connectionId: nextId("connection"), memberId: r.senderId,
      source: { requestType: r.requestType, requestId: r.requestId }, connectedAt: timeAgo(0),
      messages: [], myLastRead: 0, otherLastRead: 0,
    };
    chatRooms.push(room);
    return { connectionId: room.connectionId, chatRoomId: room.chatRoomId };
  }],
  ["PATCH", /^\/api\/v1\/requests\/(PROPOSAL|APPLICATION)\/(\d+)\/reject$/, ({ params, body }) => {
    const r = findReceivedRequest(params[0] as RequestType, Number(params[1]));
    const type = body?.reasonType as RejectReasonType | undefined;
    if (!type) badRequest("거절 사유를 선택해 주세요.");
    if (type === "ETC" && !body?.reasonDetail) badRequest("기타 사유를 입력해 주세요.");
    if (body?.reasonDetail && String(body.reasonDetail).length > 200) badRequest("200자 이내로 입력해 주세요.");
    r.status = "REJECTED";
    r.rejectReason = { type: type!, detail: body?.reasonDetail ?? null };
  }],

  // ── 6. 연결 · 채팅
  ["GET", /^\/api\/v1\/connections$/, ({ query }) => {
    const list = [...chatRooms]
      .sort((a, b) => b.connectedAt.localeCompare(a.connectedAt))
      .map((c) => {
        const u = findUser(c.memberId)!;
        return { connectionId: c.connectionId, member: { memberId: u.userId, name: u.name, major: u.major ?? "", department: u.department! }, keywords: topKeywords(u.keywords), chatRoomId: c.chatRoomId, createdAt: c.connectedAt };
      });
    return paginate(list, query);
  }],
  ["GET", /^\/api\/v1\/chatrooms$/, ({ query }) => {
    const list = chatRooms
      .map((c) => {
        const last = c.messages.at(-1) ?? null;
        return {
          chatRoomId: c.chatRoomId, member: memberRef(c.memberId),
          lastMessage: last?.content ?? null, lastMessageAt: last?.createdAt ?? null,
          unreadCount: c.messages.filter((m) => m.senderId !== ME_ID && m.messageId > c.myLastRead).length,
        };
      })
      .sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
    return paginate(list, query);
  }],
  ["GET", /^\/api\/v1\/chatrooms\/(\d+)$/, ({ params }) => {
    const room = requireRoom(Number(params[0]));
    const r = requests.find((x) => x.requestType === room.source.requestType && x.requestId === room.source.requestId);
    const post = r?.postId ? posts.find((p) => p.postId === r.postId) : undefined;
    const contextCard = room.source.requestType === "PROPOSAL"
      ? { sourceType: "PROPOSAL", title: r?.reasonType ? REASON_LABEL[r.reasonType] : "", content: r?.message ?? "" }
      : { sourceType: "APPLICATION", title: post?.title ?? "", content: post?.description.slice(0, 100) ?? "" };
    return { chatRoomId: room.chatRoomId, member: memberRef(room.memberId), contextCard };
  }],
  ["GET", /^\/api\/v1\/chatrooms\/(\d+)\/messages$/, ({ params, query }) => {
    const room = requireRoom(Number(params[0]));
    const size = Math.min(100, Math.max(1, Number(query.size ?? 30) || 30));
    const cursor = query.cursor != null ? Number(query.cursor) : Infinity;
    const older = [...room.messages].filter((m) => m.messageId < cursor).sort((a, b) => b.messageId - a.messageId);
    const items = older.slice(0, size).map((m) => toMessageItem(room, m));
    const hasNext = older.length > size;
    return { items, hasNext, nextCursor: hasNext ? items.at(-1)!.messageId : null };
  }],
  ["POST", /^\/api\/v1\/chatrooms\/(\d+)\/messages$/, ({ params, body }) => {
    const room = requireRoom(Number(params[0]));
    if (blockedIds.has(room.memberId)) fail(403, "CHAT403", "채팅방에 참여한 멤버만 접근할 수 있습니다.");
    const content = String(body?.content ?? "");
    if (content.length < 1 || content.length > 1000) badRequest("메시지는 1~1000자로 입력해 주세요.");
    const msg = { messageId: nextId("message"), senderId: ME_ID, content, createdAt: timeAgo(0) };
    room.messages.push(msg);
    room.myLastRead = msg.messageId;
    scheduleReply(room, msg.messageId);
    return { messageId: msg.messageId, content: msg.content, createdAt: msg.createdAt };
  }],
  ["PATCH", /^\/api\/v1\/chatrooms\/(\d+)\/read$/, ({ params, body }) => {
    const room = requireRoom(Number(params[0]));
    room.myLastRead = Math.max(room.myLastRead, Number(body?.lastReadMessageId) || 0);
  }],

  // ── 7. 운영 관리 (가짜 모드에서는 역할 검사 안 함)
  ["GET", /^\/api\/v1\/admin\/dashboard$/, () => ({
    pendingSignupCount: signups.filter((s) => !s.approved).length,
    pendingReportCount: reports.filter((r) => r.status === "PENDING").length,
  })],
  ["GET", /^\/api\/v1\/admin\/signups$/, ({ query }) => {
    const list = signups
      .filter((s) => !s.approved)
      .map((s) => ({ userId: s.userId, name: s.name, major: s.major, department: s.department, keywords: s.keywords }));
    return { ...paginate(list, query), totalCount: list.length };
  }],
  ["PATCH", /^\/api\/v1\/admin\/signups\/(\d+)\/approve$/, ({ params }) => {
    const s = signups.find((x) => x.userId === Number(params[0]));
    if (!s) fail(404, "USER404", "존재하지 않는 사용자입니다.");
    if (s!.approved) fail(409, "USER409", "이미 승인된 사용자입니다.");
    s!.approved = true;
  }],
  ["GET", /^\/api\/v1\/admin\/reports$/, ({ query }) => {
    const status = (query.status as ReportStatus | undefined) ?? "PENDING";
    const list = reports
      .filter((r) => r.status === status)
      .sort(byNewest)
      .map((r) => ({
        reportId: r.reportId, targetType: r.targetType, targetId: r.targetId, targetName: reportTargetName(r.targetType, r.targetId),
        reporterName: findUser(r.reporterId)?.name ?? "", reason: r.reason, status: r.status, createdAt: r.createdAt,
      }));
    return { ...paginate(list, query), totalCount: list.length };
  }],
  ["PATCH", /^\/api\/v1\/admin\/reports\/(\d+)\/resolve$/, ({ params, body }) => {
    const r = reports.find((x) => x.reportId === Number(params[0]));
    if (!r) fail(404, "REPORT404", "존재하지 않는 신고입니다.");
    if (r!.status === "RESOLVED") fail(409, "REPORT409", "이미 처리된 신고입니다.");
    r!.status = "RESOLVED";
    r!.memo = body?.memo ?? null;
  }],
];

function findReceivedRequest(type: RequestType, id: number): MockRequest {
  const r = requests.find((x) => x.requestType === type && x.requestId === id);
  if (!r) fail(404, "REQUEST404", "존재하지 않는 요청입니다.");
  if (r!.receiverId !== ME_ID) fail(403, "REQUEST403", "요청을 처리할 권한이 없습니다.");
  if (r!.status !== "PENDING") fail(409, "REQUEST409", "이미 처리된 요청입니다.");
  return r!;
}

/** USER=이름, POST=제목, MESSAGE=보낸 사람 이름 */
function reportTargetName(type: ReportTargetType, id: number): string {
  if (type === "USER") return findUser(id)?.name ?? "";
  if (type === "POST") return posts.find((p) => p.postId === id)?.title ?? "";
  const msg = chatRooms.flatMap((c) => c.messages).find((m) => m.messageId === id);
  return msg ? findUser(msg.senderId)?.name ?? "" : "";
}

// ───────────────────────── 진입점 ─────────────────────────

const delay = () => new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 250));

/** client.ts의 send()가 가짜 모드일 때 대신 부르는 함수. 실제 서버와 같은 { status, data } 를 돌려줍니다. */
export async function mockSend<T>(
  method: Method,
  path: string,
  query: object | undefined,
  body: unknown,
): Promise<{ status: number; data: ApiResponse<T> }> {
  await delay();
  const route = routes.find(([m, re]) => m === method && re.test(path));
  if (!route) {
    return { status: 404, data: { isSuccess: false, code: "COMMON404", message: `가짜 데이터가 없는 API입니다: ${method} ${path}` } };
  }
  if (meState.status === "PENDING" && !PENDING_ALLOWED.some(([m, re]) => m === method && re.test(path))) {
    return { status: 403, data: { isSuccess: false, code: "AUTH403", message: "운영진 승인 후 이용할 수 있습니다." } };
  }
  try {
    const params = path.match(route[1])!.slice(1);
    // 화면에서 데이터를 바꿔도 가짜 저장소가 같이 바뀌지 않도록 복사해서 돌려줍니다.
    const result = structuredClone(route[2]({ params, query: (query ?? {}) as Query, body }));
    const data: ApiResponse<T> = result === undefined
      ? { isSuccess: true, code: "200 OK", message: "요청 성공" }
      : { isSuccess: true, code: "200 OK", message: "요청 성공", result: result as T };
    return { status: 200, data };
  } catch (e) {
    if (e instanceof MockFail) {
      return { status: e.status, data: { isSuccess: false, code: e.code, message: e.message } };
    }
    throw e;
  }
}
