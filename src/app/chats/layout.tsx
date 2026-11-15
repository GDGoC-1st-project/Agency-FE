import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { ChatWorkspace } from "./ChatWorkspace";

export const metadata: Metadata = { title: "채팅 · 인력사무소" };

/**
 * Figma 채팅 — 모바일 1:257(목록이 있는 화면) · 1:267(하단 내비 없는 채팅방), PC 1:559.
 * 목록은 이 레이아웃에 있어서 PC에서 방을 바꿔도 다시 그리지 않고, 오른쪽(모바일은 화면 전체)에 각 페이지가 들어갑니다.
 * - /chats: 모바일은 목록, PC는 목록 + "대화를 골라 주세요"
 * - /chats/{chatRoomId}: 모바일은 채팅방만(하단 내비 없음), PC는 목록 + 채팅방
 *
 * ChatWorkspace는 주소의 방 번호(useParams)로 모양을 정하는데, 방 번호는 미리 그릴 때(빌드) 알 수 없어서
 * Suspense로 감쌉니다. 화면 안에서 이동할 때는 바로 그려지고, 주소로 처음 들어올 때만 잠깐 fallback이 보입니다.
 */
export default function ChatsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <p role="status" className="py-16 text-center text-12 text-muted">
          채팅을 불러오는 중…
        </p>
      }
    >
      <ChatWorkspace>{children}</ChatWorkspace>
    </Suspense>
  );
}
