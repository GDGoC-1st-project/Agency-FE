"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { getChatRooms, getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { ChatRoomItem } from "@/types/api";
import { ChatList } from "./ChatList";
import { ChatRoomsContext, type ChatRoomsValue } from "./ChatRoomsContext";

const PAGE_SIZE = 30;

/** 채팅방 목록 상태 (목록 API + 읽음·전송 결과를 목록에 바로 반영) */
function useChatRoomList(): ChatRoomsValue {
  const [rooms, setRooms] = useState<ChatRoomItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [status, setStatus] = useState<ChatRoomsValue["status"]>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const seq = useRef(0);

  const load = useCallback(async (nextPage: number) => {
    const mySeq = ++seq.current;
    if (nextPage === 0) setStatus((s) => (s === "ready" ? s : "loading"));
    else setLoadingMore(true);
    try {
      const result = await getChatRooms({ page: nextPage, size: PAGE_SIZE });
      if (mySeq !== seq.current) return;
      setRooms((prev) => (nextPage === 0 ? result.items : [...prev, ...result.items]));
      setPage(result.page);
      setHasNext(result.hasNext);
      setStatus("ready");
      setError(null);
    } catch (e) {
      if (mySeq !== seq.current) return;
      if (nextPage === 0) setStatus("error");
      setError(getErrorMessage(e, "채팅 목록을 불러오지 못했어요."));
    } finally {
      if (mySeq === seq.current) setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 화면에 들어올 때마다(다른 메뉴에 갔다 와도) 최신 목록을 불러옵니다.
    void load(0);
  }, [load]);

  const markRead = useCallback((chatRoomId: number) => {
    setRooms((prev) => prev.map((r) => (r.chatRoomId === chatRoomId && r.unreadCount > 0 ? { ...r, unreadCount: 0 } : r)));
  }, []);

  const messageSent = useCallback<ChatRoomsValue["messageSent"]>((chatRoomId, content, createdAt) => {
    setRooms((prev) => {
      const room = prev.find((r) => r.chatRoomId === chatRoomId);
      if (!room) return prev;
      const updated = { ...room, lastMessage: content, lastMessageAt: createdAt, unreadCount: 0 };
      return [updated, ...prev.filter((r) => r.chatRoomId !== chatRoomId)];
    });
  }, []);

  return useMemo(
    () => ({
      rooms,
      status,
      error,
      hasNext,
      loadingMore,
      reload: () => void load(0),
      loadMore: () => void load(page + 1),
      markRead,
      messageSent,
    }),
    [rooms, status, error, hasNext, loadingMore, load, page, markRead, messageSent],
  );
}

/**
 * 채팅 화면 틀: 모바일은 목록과 채팅방을 따로, PC는 왼쪽 목록(340) + 오른쪽 채팅방 (Figma PC Chat workspace 1120×590).
 * 첨부(+) 버튼은 docs/screens.md 4-1의 10번 결정으로 넣지 않습니다.
 */
export function ChatWorkspace({ children }: { children: ReactNode }) {
  const params = useParams<{ chatRoomId?: string }>();
  const inRoom = params.chatRoomId !== undefined;
  const value = useChatRoomList();

  return (
    <MainLayout mobileBare={inRoom}>
      <ChatRoomsContext.Provider value={value}>
        <div className="flex flex-col">
          <PageIntro title="연결된 멤버와 이야기해요" className={cn(inRoom && "max-lg:hidden")} />
          <div className={cn("lg:pt-7.5", !inRoom && "pt-7.5")}>
            <div
              className={cn(
                "flex overflow-hidden bg-paper lg:h-147.5 lg:border lg:border-line lg:shadow-paper",
                inRoom ? "max-lg:h-dvh" : "border border-line shadow-paper",
              )}
            >
              <div
                className={cn(
                  "flex w-full flex-col bg-panel lg:w-85 lg:shrink-0 lg:border-r lg:border-line",
                  inRoom && "max-lg:hidden",
                )}
              >
                <ChatList />
              </div>
              <section className={cn("flex min-w-0 flex-1 flex-col", !inRoom && "max-lg:hidden")}>{children}</section>
            </div>
          </div>
        </div>
      </ChatRoomsContext.Provider>
    </MainLayout>
  );
}
