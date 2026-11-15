/**
 * 가짜 데이터 모드(NEXT_PUBLIC_USE_MOCK=true)의 초기 데이터.
 * 이름·문구는 Figma 조립 화면에 나온 값을 따랐습니다.
 * 메모리에만 있으므로 새로고침하면 처음 상태로 돌아갑니다.
 */
import type {
  Department,
  KeywordGroup,
  LocalDateTime,
  ReasonType,
  RejectReason,
  ReportStatus,
  ReportTargetType,
  RequestStatus,
  RequestType,
} from "@/types/api";

/** 현재 시각 기준 `minutesAgo`분 전을 `2026-10-05T10:00:00` 형식으로 */
export function timeAgo(minutesAgo: number): LocalDateTime {
  const d = new Date(Date.now() - minutesAgo * 60_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const HOUR = 60;
const DAY = 24 * HOUR;

// ───────────────────────── 키워드 ─────────────────────────

const KEYWORD_NAMES = [
  "React", "TypeScript", "Next.js", "Spring", "AWS", "데이터 설계", "Figma", "UX 리서치", "브랜딩",
  "Python", "LLM", "MLOps", "Swift", "SwiftUI", "모바일", "PM", "리서치", "커뮤니케이션",
  "기획 협업", "UI개발", "사이드프로젝트", "Kotlin", "Node.js", "데이터 분석", "AI", "UX",
  "해커톤", "스터디", "백엔드", "프론트엔드", "iOS", "디자인 시스템", "웹", "콘텐츠",
];

export interface MockKeyword {
  keywordId: number;
  name: string;
}

export const keywords: MockKeyword[] = KEYWORD_NAMES.map((name, i) => ({ keywordId: i + 1, name }));

export function kw(name: string): MockKeyword {
  const found = keywords.find((k) => k.name === name);
  if (!found) throw new Error(`mock keyword 없음: ${name}`);
  return found;
}

function group(can: string[], learning: string[] = [], interested: string[] = []): KeywordGroup {
  return { can: can.map(kw), learning: learning.map(kw), interested: interested.map(kw) };
}

// ───────────────────────── 사용자 ─────────────────────────

export interface MockUser {
  userId: number;
  name: string;
  major: string | null;
  department: Department | null;
  bio: string | null;
  contact: string | null;
  keywords: KeywordGroup;
}

/** 로그인한 나 (승인된 일반 사용자) */
export const ME_ID = 1;

export const users: MockUser[] = [
  {
    userId: ME_ID, name: "강민지", major: "컴퓨터공학", department: "DEV",
    bio: "작은 아이디어도 빠르게 만들어 보며 답을 찾아가는 개발자입니다.",
    contact: "010-0000-0000",
    keywords: group(["React", "TypeScript"], ["UI개발"], ["사이드프로젝트"]),
  },
  {
    userId: 2, name: "김유진", major: "컴퓨터공학", department: "DEV",
    bio: "재미있는 아이디어를 빠르게 화면으로 옮기는 일을 좋아해요.",
    contact: "yujin@example.com",
    keywords: group(["React", "TypeScript"], ["Next.js"], ["기획 협업"]),
  },
  {
    userId: 3, name: "박서준", major: "소프트웨어학", department: "DEV",
    bio: "단단한 구조와 깨끗한 API를 고민하는 백엔드 개발자예요.",
    contact: "seojun@example.com",
    keywords: group(["Spring", "AWS"], ["Kotlin"], ["데이터 설계"]),
  },
  {
    userId: 4, name: "이하은", major: "시각디자인", department: "DESIGN",
    bio: "사용자의 맥락을 먼저 듣고 화면을 그리는 프로덕트 디자이너예요.",
    contact: "haeun@example.com",
    keywords: group(["Figma", "UX 리서치"], ["디자인 시스템"], ["브랜딩"]),
  },
  {
    userId: 5, name: "최도윤", major: "인공지능학", department: "AI",
    bio: "LLM으로 실제 쓰이는 서비스를 만드는 데 관심이 많아요.",
    contact: "doyun@example.com",
    keywords: group(["Python", "LLM"], ["MLOps"], ["데이터 분석"]),
  },
  {
    userId: 6, name: "정다인", major: "산업디자인", department: "DESIGN",
    bio: "문제를 정의하고 흐름을 설계하는 일을 좋아해요.",
    contact: "dain@example.com",
    keywords: group(["PM", "리서치"], ["UX"], ["커뮤니케이션"]),
  },
  {
    userId: 7, name: "한지호", major: "컴퓨터공학", department: "DEV",
    bio: "일상에 자연스럽게 스며드는 앱을 만들고 있어요.",
    contact: "jiho@example.com",
    keywords: group(["Swift", "SwiftUI"], ["모바일"], ["iOS"]),
  },
  {
    userId: 8, name: "오세린", major: "데이터사이언스", department: "AI",
    bio: "데이터에서 이야기를 찾는 분석을 좋아해요.",
    contact: "serin@example.com",
    keywords: group(["데이터 분석", "Python"], ["AI"], ["스터디"]),
  },
  {
    userId: 9, name: "윤태오", major: "전자공학", department: "DEV",
    bio: "서버부터 화면까지 끝까지 만들어 보는 걸 좋아해요.",
    contact: "taeo@example.com",
    keywords: group(["Node.js", "React"], ["AWS"], ["해커톤"]),
  },
];

export function findUser(userId: number): MockUser | undefined {
  return users.find((u) => u.userId === userId);
}

/** 대표 키워드 최대 3개 (can → learning → interested 순) */
export function topKeywords(g: KeywordGroup): string[] {
  return [...g.can, ...g.learning, ...g.interested].slice(0, 3).map((k) => k.name);
}

/** 내가 차단한 멤버 id */
export const blockedIds = new Set<number>();

// ───────────────────────── 모집글 ─────────────────────────

export interface MockPost {
  postId: number;
  title: string;
  description: string;
  requiredRoles: string[];
  keywordIds: number[];
  authorId: number;
  createdAt: LocalDateTime;
  deleted: boolean;
}

export const posts: MockPost[] = [
  {
    postId: 5, title: "디자인 시스템 같이 정리할 프론트엔드 구해요",
    description: "동아리 서비스들의 공통 컴포넌트를 모아 작은 디자인 시스템을 만들려고 해요. React와 Tailwind로 컴포넌트를 함께 만들 분을 찾습니다.",
    requiredRoles: ["DEV", "DESIGN"], keywordIds: [kw("React").keywordId, kw("디자인 시스템").keywordId],
    authorId: ME_ID, createdAt: timeAgo(3 * HOUR), deleted: false,
  },
  {
    postId: 4, title: "마음 기록 앱을 함께 만들 팀원을 찾아요",
    description: "하루의 감정을 짧게 기록하고 서로 응원하는 서비스를 만들고 있어요. 백엔드 개발자 한 분과 디자이너 한 분을 기다리고 있어요.",
    requiredRoles: ["DEV", "DESIGN"], keywordIds: [kw("백엔드").keywordId, kw("사이드프로젝트").keywordId],
    authorId: 2, createdAt: timeAgo(1 * DAY), deleted: false,
  },
  {
    postId: 3, title: "대학생을 위한 동네 모임 서비스",
    description: "같은 동네 대학생들이 관심사로 연결되는 서비스의 MVP를 준비 중입니다. 프론트엔드와 iOS 개발자를 찾고 있어요.",
    requiredRoles: ["DEV"], keywordIds: [kw("프론트엔드").keywordId, kw("iOS").keywordId],
    authorId: 6, createdAt: timeAgo(2 * DAY), deleted: false,
  },
  {
    postId: 2, title: "AI 면접 코치 해커톤 팀 빌딩",
    description: "음성 기반 피드백을 제공하는 AI 면접 코치를 주제로 해커톤에 나갑니다. 짧고 굵게 몰입할 팀원을 찾습니다.",
    requiredRoles: ["AI", "DEV"], keywordIds: [kw("AI").keywordId, kw("해커톤").keywordId],
    authorId: 3, createdAt: timeAgo(3 * DAY), deleted: false,
  },
  {
    postId: 1, title: "우리 학교 축제 아카이브 프로젝트",
    description: "학교마다 흩어져 있는 축제의 순간을 모아 웹 아카이브로 만들어요. 기록과 브랜딩에 관심 있는 분 환영해요.",
    requiredRoles: ["DESIGN", "DEV"], keywordIds: [kw("웹").keywordId, kw("콘텐츠").keywordId, kw("브랜딩").keywordId],
    authorId: 4, createdAt: timeAgo(5 * DAY), deleted: false,
  },
];

// ───────────────────────── 요청 (제안 · 지원) ─────────────────────────

export interface MockRequest {
  requestType: RequestType;
  requestId: number;
  senderId: number;
  receiverId: number;
  /** PROPOSAL만 */
  reasonType: ReasonType | null;
  /** PROPOSAL: 제안 메시지 */
  message: string | null;
  /** APPLICATION: 지원한 모집글 */
  postId: number | null;
  status: RequestStatus;
  rejectReason: RejectReason | null;
  createdAt: LocalDateTime;
}

export const requests: MockRequest[] = [
  // 받은 요청
  { requestType: "PROPOSAL", requestId: 1, senderId: 2, receiverId: ME_ID, reasonType: "PROJECT", message: "사이드 프로젝트에서 프론트엔드를 같이 맡아 주실 수 있을까요?", postId: null, status: "ACCEPTED", rejectReason: null, createdAt: timeAgo(2 * DAY) },
  { requestType: "PROPOSAL", requestId: 2, senderId: 5, receiverId: ME_ID, reasonType: "CONTEST", message: "AI 공모전에 함께 나가실래요? 화면을 맡아 주실 분을 찾고 있어요.", postId: null, status: "PENDING", rejectReason: null, createdAt: timeAgo(2 * HOUR) },
  { requestType: "APPLICATION", requestId: 1, senderId: 7, receiverId: ME_ID, reasonType: null, message: null, postId: 5, status: "PENDING", rejectReason: null, createdAt: timeAgo(1 * HOUR) },
  { requestType: "PROPOSAL", requestId: 3, senderId: 6, receiverId: ME_ID, reasonType: "COFFEE_CHAT", message: "기획 이야기 나누고 싶어요. 커피챗 어떠세요?", postId: null, status: "REJECTED", rejectReason: { type: "SCHEDULE", detail: null }, createdAt: timeAgo(4 * DAY) },
  // 보낸 요청
  { requestType: "PROPOSAL", requestId: 4, senderId: ME_ID, receiverId: 3, reasonType: "STUDY", message: "Spring 스터디 같이 하실래요?", postId: null, status: "ACCEPTED", rejectReason: null, createdAt: timeAgo(3 * DAY) },
  { requestType: "APPLICATION", requestId: 2, senderId: ME_ID, receiverId: 4, reasonType: null, message: null, postId: 1, status: "ACCEPTED", rejectReason: null, createdAt: timeAgo(4 * DAY) },
  { requestType: "APPLICATION", requestId: 3, senderId: ME_ID, receiverId: 3, reasonType: null, message: null, postId: 2, status: "PENDING", rejectReason: null, createdAt: timeAgo(5 * HOUR) },
  { requestType: "PROPOSAL", requestId: 5, senderId: ME_ID, receiverId: 8, reasonType: "HOBBY", message: "데이터 시각화 같이 해 보실래요?", postId: null, status: "REJECTED", rejectReason: { type: "ETC", detail: "이번 학기에는 시간이 부족해요." }, createdAt: timeAgo(6 * DAY) },
];

// ───────────────────────── 연결 · 채팅 ─────────────────────────

export interface MockMessage {
  messageId: number;
  senderId: number;
  content: string;
  createdAt: LocalDateTime;
}

export interface MockChatRoom {
  chatRoomId: number;
  connectionId: number;
  memberId: number;
  source: { requestType: RequestType; requestId: number };
  connectedAt: LocalDateTime;
  messages: MockMessage[];
  /** 내가 마지막으로 읽은 메시지 id */
  myLastRead: number;
  /** 상대가 마지막으로 읽은 메시지 id */
  otherLastRead: number;
}

export const chatRooms: MockChatRoom[] = [
  {
    chatRoomId: 1, connectionId: 1, memberId: 2, source: { requestType: "PROPOSAL", requestId: 1 }, connectedAt: timeAgo(2 * DAY),
    messages: [
      { messageId: 1, senderId: 2, content: "안녕하세요! 연결 수락해 주셔서 감사해요.", createdAt: timeAgo(40) },
      { messageId: 4, senderId: ME_ID, content: "저도 반가워요. 프로젝트 소개 재미있게 봤어요.", createdAt: timeAgo(30) },
      { messageId: 6, senderId: 2, content: "프로젝트 문서 먼저 공유드릴게요.", createdAt: timeAgo(20) },
      { messageId: 7, senderId: 2, content: "그럼 목요일 저녁에 첫 미팅 어때요?", createdAt: timeAgo(15) },
    ],
    myLastRead: 4, otherLastRead: 4,
  },
  {
    chatRoomId: 2, connectionId: 2, memberId: 3, source: { requestType: "PROPOSAL", requestId: 4 }, connectedAt: timeAgo(3 * DAY),
    messages: [
      { messageId: 2, senderId: ME_ID, content: "스터디 제안 수락해 주셔서 감사해요!", createdAt: timeAgo(1 * DAY + 60) },
      { messageId: 3, senderId: 3, content: "요청 확인했어요. 반갑습니다!", createdAt: timeAgo(1 * DAY) },
    ],
    myLastRead: 3, otherLastRead: 2,
  },
  {
    chatRoomId: 3, connectionId: 3, memberId: 4, source: { requestType: "APPLICATION", requestId: 2 }, connectedAt: timeAgo(4 * DAY),
    messages: [
      { messageId: 5, senderId: 4, content: "와이어프레임 링크 전달드릴게요.", createdAt: timeAgo(3 * DAY) },
    ],
    myLastRead: 5, otherLastRead: 0,
  },
];

// ───────────────────────── 신고 · 운영 ─────────────────────────

export interface MockReport {
  reportId: number;
  reporterId: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  status: ReportStatus;
  memo: string | null;
  createdAt: LocalDateTime;
}

export const reports: MockReport[] = [
  { reportId: 1, reporterId: 3, targetType: "POST", targetId: 3, reason: "모집 내용과 관계없는 홍보 글이에요.", status: "PENDING", memo: null, createdAt: timeAgo(5 * HOUR) },
  { reportId: 2, reporterId: 4, targetType: "MESSAGE", targetId: 5, reason: "불쾌한 표현이 있었어요.", status: "PENDING", memo: null, createdAt: timeAgo(1 * DAY) },
  { reportId: 3, reporterId: 2, targetType: "USER", targetId: 9, reason: "연락 없이 약속을 여러 번 어겼어요.", status: "RESOLVED", memo: "당사자에게 안내함", createdAt: timeAgo(6 * DAY) },
];

export interface MockSignup {
  userId: number;
  name: string;
  major: string;
  department: Department;
  keywords: string[];
  approved: boolean;
}

export const signups: MockSignup[] = [
  { userId: 21, name: "서지안", major: "경영학", department: "DESIGN", keywords: ["PM", "리서치"], approved: false },
  { userId: 22, name: "문하린", major: "컴퓨터공학", department: "DEV", keywords: ["React", "Next.js", "TypeScript"], approved: false },
  { userId: 23, name: "임준서", major: "통계학", department: "AI", keywords: ["Python", "데이터 분석"], approved: false },
];

// ───────────────────────── id 발급 ─────────────────────────

const counters = {
  user: 100,
  post: Math.max(...posts.map((p) => p.postId)),
  proposal: Math.max(...requests.filter((r) => r.requestType === "PROPOSAL").map((r) => r.requestId)),
  application: Math.max(...requests.filter((r) => r.requestType === "APPLICATION").map((r) => r.requestId)),
  chatRoom: Math.max(...chatRooms.map((c) => c.chatRoomId)),
  connection: Math.max(...chatRooms.map((c) => c.connectionId)),
  message: Math.max(...chatRooms.flatMap((c) => c.messages.map((m) => m.messageId))),
  report: Math.max(...reports.map((r) => r.reportId)),
};

export function nextId(kind: keyof typeof counters): number {
  counters[kind] += 1;
  return counters[kind];
}
