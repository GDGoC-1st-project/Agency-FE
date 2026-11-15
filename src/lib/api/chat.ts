import { api, API_URL, USE_MOCK } from "./client";
import { connectMockChatSocket } from "./mock";
import { getAccessToken } from "@/lib/auth/token";
import type {
  ChatRoomDetailResponse,
  ChatRoomItem,
  ChatSocketEvent,
  MessageListParams,
  MessagePage,
  MessageSendResponse,
  Page,
  PageParams,
} from "@/types/api";

/** 채팅방 목록 */
export function getChatRooms(params: PageParams = {}) {
  return api.get<Page<ChatRoomItem>>("/api/v1/chatrooms", params);
}

/** 채팅방 상세 (참여자만) */
export function getChatRoom(chatRoomId: number) {
  return api.get<ChatRoomDetailResponse>(`/api/v1/chatrooms/${chatRoomId}`);
}

/**
 * 메시지 목록 (참여자만). 최신 메시지가 먼저 옵니다.
 * 이전 메시지는 응답의 nextCursor를 cursor로 넣어 불러옵니다.
 */
export function getMessages(chatRoomId: number, params: MessageListParams = {}) {
  return api.get<MessagePage>(`/api/v1/chatrooms/${chatRoomId}/messages`, params);
}

/** 메시지 전송 (참여자만, 1~1000자). 내가 보낸 메시지는 이 응답으로 화면에 추가합니다. 차단 관계면 CHAT403 */
export function sendMessage(chatRoomId: number, content: string) {
  return api.post<MessageSendResponse>(`/api/v1/chatrooms/${chatRoomId}/messages`, { content });
}

/** 읽음 처리 (참여자만) */
export function markAsRead(chatRoomId: number, lastReadMessageId: number) {
  return api.patch(`/api/v1/chatrooms/${chatRoomId}/read`, { lastReadMessageId });
}

export interface ChatSocketHandlers {
  onOpen?: () => void;
  onClose?: (e: CloseEvent) => void;
  onError?: (e: Event) => void;
}

/**
 * 실시간 수신용 WebSocket 연결 (서버 → 클라이언트 수신 전용, 상대방 이벤트만 옴).
 * 반환된 함수를 호출하면 연결을 닫습니다.
 */
export function connectChatSocket(
  chatRoomId: number,
  onEvent: (event: ChatSocketEvent) => void,
  handlers: ChatSocketHandlers = {},
): () => void {
  if (USE_MOCK) return connectMockChatSocket(chatRoomId, onEvent, handlers);

  const wsBase = API_URL.replace(/^http/, "ws");
  const token = encodeURIComponent(getAccessToken() ?? "");
  const socket = new WebSocket(`${wsBase}/ws/chatrooms/${chatRoomId}?token=${token}`);

  socket.onmessage = (e: MessageEvent<string>) => {
    try {
      onEvent(JSON.parse(e.data) as ChatSocketEvent);
    } catch {
      // 알 수 없는 형식은 무시
    }
  };
  if (handlers.onOpen) socket.onopen = handlers.onOpen;
  if (handlers.onClose) socket.onclose = handlers.onClose;
  if (handlers.onError) socket.onerror = handlers.onError;

  return () => socket.close();
}
