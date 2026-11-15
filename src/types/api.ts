/**
 * docs/api-list.md 기준 요청·응답 타입.
 * 응답 타입은 공통 래퍼(ApiResponse)의 `result` 안쪽 내용입니다.
 */

// ───────────────────────── 공통 ─────────────────────────

/** `2026-10-05T10:00:00` 형식 (타임존 없음, 서울 시간) */
export type LocalDateTime = string;

export interface ApiSuccessResponse<T> {
  isSuccess: true;
  code: string;
  message: string;
  /** "없음" 응답이면 필드가 아예 빠집니다. */
  result?: T;
}

export interface ApiErrorResponse {
  isSuccess: false;
  code: ErrorCode | (string & {});
  message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** 백엔드 ErrorCode.java 기준 에러 코드 */
export type ErrorCode =
  | "COMMON400"
  | "COMMON404"
  | "COMMON405"
  | "COMMON500"
  | "AUTH401"
  | "AUTH403"
  | "ADMIN403"
  | "INVITE400"
  | "AUTH409"
  | "LOGIN401"
  | "REFRESH401"
  | "PROFILE409"
  | "PROFILE404"
  | "KEYWORD400"
  | "KEYWORD404"
  | "MEMBER404"
  | "PROPOSAL400"
  | "PROPOSAL409"
  | "REPORT404"
  | "REPORT409"
  | "BLOCK400"
  | "BLOCK409"
  | "BLOCK404"
  | "POST404"
  | "POST403"
  | "APPLICATION409"
  | "APPLICATION400"
  | "REQUEST404"
  | "REQUEST403"
  | "REQUEST409"
  | "CHAT404"
  | "CHAT403"
  | "USER404"
  | "USER409";

export interface PageParams {
  /** 0부터, 기본 0 */
  page?: number;
  /** 기본 20, 1~100 */
  size?: number;
}

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  hasNext: boolean;
}

export interface CountedPage<T> extends Page<T> {
  totalCount: number;
}

// ───────────────────────── 자주 쓰는 값 ─────────────────────────

export type Department = "DEV" | "AI" | "DESIGN";
export type Relation = "CAN" | "LEARNING" | "INTERESTED";
export type ReasonType =
  | "PROJECT"
  | "STUDY"
  | "CONTEST"
  | "COFFEE_CHAT"
  | "HOBBY"
  | "ETC";
export type RejectReasonType = "SCHEDULE" | "NOT_MATCHED" | "CLOSED" | "ETC";
export type RequestType = "PROPOSAL" | "APPLICATION";
export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export type UserStatus = "PENDING" | "APPROVED";
export type Role = "MEMBER" | "ADMIN";
export type ReportTargetType = "USER" | "POST" | "MESSAGE";
export type ReportStatus = "PENDING" | "RESOLVED";
export type OnboardingStep = "PROFILE" | "KEYWORD" | "WAITING" | "DONE";

export interface Keyword {
  keywordId: number;
  name: string;
}

export interface KeywordGroup {
  can: Keyword[];
  learning: Keyword[];
  interested: Keyword[];
}

export interface Member {
  memberId: number;
  name: string;
}

// ───────────────────────── 1. 회원가입 · 로그인 ─────────────────────────

export interface SignupRequest {
  /** 영문·숫자 4~20자 */
  loginId: string;
  /** 8자 이상 */
  password: string;
  inviteCode: string;
}

export interface SignupResponse {
  userId: number;
  accessToken: string;
  refreshToken: string;
  status: UserStatus;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  status: UserStatus;
  role: Role;
  onboardingStep: OnboardingStep;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApprovalStatusResponse {
  status: UserStatus;
}

// ───────────────────────── 2. 내 정보 · 프로필 · 키워드 ─────────────────────────

export interface MyInfoResponse {
  userId: number;
  name: string;
  /** 프로필 미작성이면 null */
  major: string | null;
  department: Department | null;
  bio: string | null;
  contact: string | null;
  role: Role;
}

export interface ProfileCreateRequest {
  /** 100자 이내 */
  bio: string;
  major: string;
  department: Department;
  contact: string;
}

/** 보낸 것만 수정 */
export type ProfileUpdateRequest = Partial<ProfileCreateRequest>;

export interface KeywordSearchParams {
  /** 1자 이상 */
  q: string;
  /** 기본 10 */
  size?: number;
}

export interface KeywordSearchResponse {
  items: Keyword[];
}

/** 빈 배열 가능, 각 20개까지, 전체 교체 */
export interface MyKeywordsUpdateRequest {
  can: number[];
  learning: number[];
  interested: number[];
}

export type MyKeywordsResponse = KeywordGroup;

// ───────────────────────── 3. 멤버 탐색 · 같이 해요 · 신고 · 차단 ─────────────────────────

export interface MemberSearchParams extends PageParams {
  keyword?: string;
  /** keyword와 함께만 적용 */
  relation?: Relation;
  department?: Department;
}

export interface MemberListItem {
  memberId: number;
  name: string;
  department: Department;
  /** 최대 3개 */
  keywords: string[];
}

export interface MemberProfileResponse {
  memberId: number;
  name: string;
  bio: string;
  major: string;
  department: Department;
  contact: string;
  keywords: KeywordGroup;
}

export interface ProposalCreateRequest {
  receiverId: number;
  reasonType: ReasonType;
  /** 200자 이내 */
  message: string;
}

export interface ProposalCreateResponse {
  proposalId: number;
}

export interface ReportCreateRequest {
  targetType: ReportTargetType;
  targetId: number;
  /** 200자 이내 */
  reason: string;
}

export interface ReportCreateResponse {
  reportId: number;
}

export interface BlockCreateRequest {
  targetMemberId: number;
}

// ───────────────────────── 4. 모집글 ─────────────────────────

export type PostSort = "LATEST";

export interface PostListParams extends PageParams {
  sort?: PostSort;
}

export interface PostListItem {
  postId: number;
  title: string;
  /** 앞 100자 */
  descriptionPreview: string;
  keywords: string[];
  authorName: string;
  createdAt: LocalDateTime;
}

export interface PostDetailResponse {
  postId: number;
  title: string;
  description: string;
  requiredRoles: string[];
  keywords: string[];
  author: Member;
  isAuthor: boolean;
  hasApplied: boolean;
  createdAt: LocalDateTime;
}

export interface PostCreateRequest {
  /** 50자 이내 */
  title: string;
  description: string;
  /** 1개 이상 */
  requiredRoles: string[];
  keywordIds?: number[];
}

export interface PostCreateResponse {
  postId: number;
}

/** 보낸 것만 수정, 배열은 전체 교체 */
export type PostUpdateRequest = Partial<PostCreateRequest>;

export interface ApplicationCreateResponse {
  applicationId: number;
}

// ───────────────────────── 5. 요청 ─────────────────────────

export interface RequestListParams extends PageParams {
  /** 없으면 전체 */
  status?: RequestStatus;
}

/**
 * requestId는 PROPOSAL/APPLICATION이 따로 번호를 매기므로
 * 항상 requestType과 같이 다뤄야 합니다. (React key: `${requestType}-${requestId}`)
 */
export interface ReceivedRequestItem {
  requestId: number;
  requestType: RequestType;
  sender: Member;
  /** PROPOSAL이면 제안 메시지, APPLICATION이면 모집글 제목 */
  content: string;
  /** APPLICATION이면 null */
  reasonType: ReasonType | null;
  status: RequestStatus;
  createdAt: LocalDateTime;
}

export interface RejectReason {
  type: RejectReasonType;
  detail: string | null;
}

export interface SentRequestItem {
  requestId: number;
  requestType: RequestType;
  receiver: Member;
  content: string;
  status: RequestStatus;
  rejectReason: RejectReason | null;
  createdAt: LocalDateTime;
}

export interface RequestAcceptResponse {
  connectionId: number;
  chatRoomId: number;
}

export interface RequestRejectRequest {
  reasonType: RejectReasonType;
  /** 200자 이내, reasonType=ETC면 필수 */
  reasonDetail?: string;
}

// ───────────────────────── 6. 내 연결 · 채팅 ─────────────────────────

export interface ConnectionItem {
  connectionId: number;
  member: {
    memberId: number;
    name: string;
    major: string;
    department: Department;
  };
  /** 최대 3개 */
  keywords: string[];
  chatRoomId: number;
  createdAt: LocalDateTime;
}

export interface ChatRoomItem {
  chatRoomId: number;
  member: Member;
  lastMessage: string | null;
  lastMessageAt: LocalDateTime | null;
  unreadCount: number;
}

/**
 * PROPOSAL: title=제안 사유 이름, content=제안 메시지
 * APPLICATION: title=모집글 제목, content=설명 앞 100자
 */
export interface ContextCard {
  sourceType: RequestType;
  title: string;
  content: string;
}

export interface ChatRoomDetailResponse {
  chatRoomId: number;
  member: Member;
  contextCard: ContextCard;
}

export interface MessageListParams {
  /** 이 messageId보다 이전 메시지 */
  cursor?: number;
  /** 기본 30 */
  size?: number;
}

export interface MessageItem {
  messageId: number;
  senderId: number;
  isMine: boolean;
  content: string;
  isRead: boolean;
  createdAt: LocalDateTime;
}

/** 최신 메시지가 먼저 옵니다. */
export interface MessagePage {
  items: MessageItem[];
  hasNext: boolean;
  nextCursor: number | null;
}

export interface MessageSendRequest {
  /** 1~1000자 */
  content: string;
}

export interface MessageSendResponse {
  messageId: number;
  content: string;
  createdAt: LocalDateTime;
}

export interface MessageReadRequest {
  lastReadMessageId: number;
}

/** WebSocket 수신 이벤트 (서버 → 클라이언트, 상대방에게만 전송) */
export type ChatSocketEvent =
  | { event: "message.new"; data: MessageItem }
  | { event: "message.read"; data: { lastReadMessageId: number } };

// ───────────────────────── 7. 운영 관리 ─────────────────────────

export interface AdminDashboardResponse {
  pendingSignupCount: number;
  pendingReportCount: number;
}

export interface AdminSignupItem {
  userId: number;
  name: string;
  major: string;
  department: Department;
  /** 최대 3개 */
  keywords: string[];
}

export interface AdminReportListParams extends PageParams {
  /** 기본 PENDING */
  status?: ReportStatus;
}

export interface AdminReportItem {
  reportId: number;
  targetType: ReportTargetType;
  targetId: number;
  targetName: string;
  reporterName: string;
  reason: string;
  status: ReportStatus;
  createdAt: LocalDateTime;
}

export interface AdminReportResolveRequest {
  /** 200자 이내 */
  memo?: string;
}
