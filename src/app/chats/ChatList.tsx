"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar, toneFor } from "@/components/ui/Avatar";
import { CountBadge } from "@/components/ui/Badge";
import { TextButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatListTime } from "@/lib/datetime";
import { ROUTES } from "@/lib/routes";
import { useChatRooms } from "./ChatRoomsContext";

/**
 * Figma Chat/List Panel (PC 1:559 왼쪽): "메시지" 제목 + 채팅방 줄(아바타 · 이름 · 마지막 메시지 · 시간 · 안 읽은 숫자).
 * 모바일 채팅 목록도 같은 줄 모양을 씁니다 (모바일 Figma는 목록과 채팅방이 한 화면이라 목록 모양이 따로 없음).
 */
export function ChatList() {
  const params = useParams<{ chatRoomId?: string }>();
  const selectedId = params.chatRoomId ? Number(params.chatRoomId) : null;
  const { rooms, status, error, hasNext, loadingMore, reload, loadMore } = useChatRooms();

  return (
    <>
      <h2 className="shrink-0 border-b border-line p-6 font-display text-display-panel text-ink">메시지</h2>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {status === "loading" && (
          <p role="status" className="px-6 py-10 text-center text-11 text-muted">
            채팅 목록을 불러오는 중…
          </p>
        )}
        {status === "error" && (
          <div role="alert" className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <p className="text-11 text-danger">{error}</p>
            <TextButton onClick={reload}>다시 시도</TextButton>
          </div>
        )}
        {status === "ready" && rooms.length === 0 && (
          <div role="status" className="flex flex-col gap-1.5 px-6 py-10 text-center">
            <p className="text-12 font-bold text-ink">아직 대화가 없어요</p>
            <p className="text-11 text-muted">요청을 수락하거나 내 요청이 수락되면 채팅방이 생겨요.</p>
          </div>
        )}
        {status === "ready" && rooms.length > 0 && (
          <ul>
            {rooms.map((room) => {
              const selected = room.chatRoomId === selectedId;
              return (
                <li key={room.chatRoomId}>
                  <Link
                    href={ROUTES.chatRoom(room.chatRoomId)}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "flex items-start gap-3.25 border-b border-divider p-4.5 transition-colors",
                      selected ? "bg-yellow-soft" : "hover:bg-hover",
                    )}
                  >
                    <Avatar tone={toneFor(room.member.memberId)} />
                    <span className="flex min-w-0 flex-1 flex-col pt-px">
                      <span className="text-12 font-bold text-ink">{room.member.name}</span>
                      <span className="truncate pt-1 text-10 text-muted">{room.lastMessage ?? "아직 메시지가 없어요. 먼저 인사해 보세요."}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-2.5">
                      {room.lastMessageAt && <span className="text-8 text-muted">{formatListTime(room.lastMessageAt)}</span>}
                      {room.unreadCount > 0 && (
                        <>
                          <CountBadge count={room.unreadCount} size="sm" className="size-4.5 min-w-4.5" />
                          <span className="sr-only">안 읽은 메시지 {room.unreadCount}개</span>
                        </>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {status === "ready" && error && <p className="px-6 pt-3 text-center text-10 text-danger">{error}</p>}
        {status === "ready" && hasNext && (
          <div className="flex justify-center py-3">
            <TextButton disabled={loadingMore} onClick={loadMore}>
              {loadingMore ? "불러오는 중…" : "이전 대화 더 보기"}
            </TextButton>
          </div>
        )}
      </div>
    </>
  );
}
