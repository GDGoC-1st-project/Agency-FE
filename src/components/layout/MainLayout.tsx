import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { TopNav } from "./TopNav";

/**
 * 하단 내비가 있는 메인 화면 틀 (멤버 · 모집 · 요청 · 채팅 · 마이).
 * 본문 여백은 Figma 모바일 조립 화면 기준: 위 34, 좌우 16, 아래 52 + 하단 내비 높이.
 */
export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="px-4 pt-8.5 pb-28.5">{children}</main>
      <BottomNav />
    </>
  );
}
