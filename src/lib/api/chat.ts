import { api, API_URL, ApiError, USE_MOCK } from "./client";
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
  /**
   * 끊겼다가 다시 연결됐을 때. 끊긴 동안 온 메시지는 소켓으로 다시 오지 않으므로
   * 여기서 최신 메시지를 다시 불러와 합칩니다.
   */
  onReconnect?: () => void;
}

/** 재연결 대기 시간: 1초부터 두 배씩, 최대 30초 */
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

/**
 * 실시간 수신용 WebSocket 연결 (서버 → 클라이언트 수신 전용, 상대방 이벤트만 옴).
 * 반환된 함수를 호출하면 연결을 닫습니다.
 *
 * 서버 재시작·네트워크 끊김 등으로 연결이 닫히면 자동으로 다시 연결합니다.
 * 다시 연결하기 전에 채팅방 상세 API를 한 번 불러 Access Token이 만료됐으면 재발급되게 하고
 * (핸드셰이크에서만 토큰을 검사하므로), 방에 들어갈 수 없으면(CHAT403·CHAT404) 재연결을 멈춥니다.
 */
export function connectChatSocket(
  chatRoomId: number,
  onEvent: (event: ChatSocketEvent) => void,
  handlers: ChatSocketHandlers = {},
): () => void {
  if (USE_MOCK) return connectMockChatSocket(chatRoomId, onEvent, handlers);

  const wsBase = API_URL.replace(/^http/, "ws");
  let socket: WebSocket | null = null;
  let closedByCaller = false;
  let attempt = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const open = (isReconnect: boolean) => {
    const token = encodeURIComponent(getAccessToken() ?? "");
    const ws = new WebSocket(`${wsBase}/ws/chatrooms/${chatRoomId}?token=${token}`);
    socket = ws;

    ws.onopen = () => {
      attempt = 0;
      handlers.onOpen?.();
      if (isReconnect) handlers.onReconnect?.();
    };
    ws.onmessage = (e: MessageEvent<string>) => {
      try {
        onEvent(JSON.parse(e.data) as ChatSocketEvent);
      } catch {
        // 알 수 없는 형식은 무시
      }
    };
    ws.onerror = (e) => handlers.onError?.(e);
    ws.onclose = (e) => {
      handlers.onClose?.(e);
      if (!closedByCaller && socket === ws) scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    if (closedByCaller || retryTimer) return;
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
    attempt += 1;
    retryTimer = setTimeout(async () => {
      retryTimer = null;
      if (closedByCaller) return;
      try {
        // 토큰 재발급(AUTH401 → refresh)과 참여 여부 확인을 겸합니다.
        await getChatRoom(chatRoomId);
      } catch (err) {
        if (err instanceof ApiError && (err.code === "CHAT403" || err.code === "CHAT404" || err.code === "REFRESH401")) {
          return; // 다시 연결해도 소용없음
        }
        // 서버가 아직 안 떠 있는 등: 조금 뒤 다시 시도
        scheduleReconnect();
        return;
      }
      if (!closedByCaller) open(true);
    }, delay);
  };

  // 오프라인 → 온라인으로 돌아오면 기다리지 않고 바로 다시 연결
  const onOnline = () => {
    if (closedByCaller || socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) return;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    attempt = 0;
    scheduleReconnect();
  };
  if (typeof window !== "undefined") window.addEventListener("online", onOnline);

  open(false);

  return () => {
    closedByCaller = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (typeof window !== "undefined") window.removeEventListener("online", onOnline);
    socket?.close();
  };
}
