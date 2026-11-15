import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { PcTopBar } from "./PcTopBar";
import { Sidebar, type SidebarProps } from "./Sidebar";
import { TopNav } from "./TopNav";

/**
 * 메인 화면 틀 (모바일 + PC). 데이터는 받지 않고 그리기만 합니다 — 실제 화면은 MainLayout을 쓰세요.
 * - 모바일: TopNav + 본문 + BottomNav
 * - PC(1024px 이상): Sidebar(왼쪽 고정) + PcTopBar + 본문
 * 본문 여백: 모바일 위 34·좌우 16·아래 52 + 하단 내비 / PC 위 64·좌우 36·아래 100, 최대 폭 1180 (Figma PC Content · Inner Content).
 */
export function AppShell({ children, ...sidebar }: SidebarProps & { children: ReactNode }) {
  return (
    <>
      <TopNav />
      <Sidebar {...sidebar} />
      <div className="lg:pl-sidebar">
        <PcTopBar />
        <main className="px-4 pt-8.5 pb-28.5 lg:px-9 lg:pt-16 lg:pb-25">
          <div className="lg:mx-auto lg:max-w-295">{children}</div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
