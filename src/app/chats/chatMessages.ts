import type { MessageItem } from "@/types/api";

/** 화면에 그리는 메시지 (보낸 사람은 isMine으로만 구분) */
export type ChatMessage = Pick<MessageItem, "messageId" | "isMine" | "content" | "isRead" | "createdAt">;

/**
 * 새 메시지를 맨 앞(최신)에 넣습니다. 이미 있는 id면 넣지 않습니다.
 * 목록은 API와 같이 **최신이 먼저**인 순서로 들고 있고, 그릴 때만 뒤집습니다.
 * 보낸 메시지(전송 API 응답)와 실시간 수신(`message.new`) 모두 이 함수로 넣습니다.
 */
export function prependMessage(list: ChatMessage[], message: ChatMessage): ChatMessage[] {
  if (list.some((m) => m.messageId === message.messageId)) return list;
  return [message, ...list];
}

/** 이전 메시지(커서로 불러온 더 오래된 것)를 맨 뒤에 붙입니다. 겹치는 id는 뺍니다. */
export function appendOlder(list: ChatMessage[], older: ChatMessage[]): ChatMessage[] {
  const ids = new Set(list.map((m) => m.messageId));
  return [...list, ...older.filter((m) => !ids.has(m.messageId))];
}

/** 실시간 수신 `message.read` 처리용: 내가 보낸 메시지 중 lastReadMessageId 이하를 읽음으로 표시 */
export function applyReadReceipt(list: ChatMessage[], lastReadMessageId: number): ChatMessage[] {
  return list.map((m) => (m.isMine && !m.isRead && m.messageId <= lastReadMessageId ? { ...m, isRead: true } : m));
}
