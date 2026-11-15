"use client";

import { createContext, useContext } from "react";
import type { ChatRoomItem, LocalDateTime } from "@/types/api";

export interface ChatRoomsValue {
  rooms: ChatRoomItem[];
  status: "loading" | "ready" | "error";
  error: string | null;
  hasNext: boolean;
  loadingMore: boolean;
  reload: () => void;
  loadMore: () => void;
  /** 채팅방에서 읽음 처리를 했을 때 목록의 안 읽은 숫자를 0으로 */
  markRead: (chatRoomId: number) => void;
  /** 메시지를 보냈을 때 목록의 마지막 메시지를 바꾸고 맨 위로 올림 */
  messageSent: (chatRoomId: number, content: string, createdAt: LocalDateTime) => void;
}

export const ChatRoomsContext = createContext<ChatRoomsValue | null>(null);

/** 채팅 화면(`app/chats/layout`) 안에서 채팅방 목록 상태를 읽고 바꿉니다. */
export function useChatRooms(): ChatRoomsValue {
  const value = useContext(ChatRoomsContext);
  if (!value) throw new Error("useChatRooms는 ChatWorkspace 안에서만 쓸 수 있어요.");
  return value;
}
