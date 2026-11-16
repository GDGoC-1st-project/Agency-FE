import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BottomNav } from "./BottomNav";
import { PcTopBar } from "./PcTopBar";
import { Sidebar, type SidebarProps } from "./Sidebar";
import { TopNav } from "./TopNav";

export interface ShellOptions {
  /**
   * 모바일 맨 위 머리글을 바꿉니다 (기본: 로고 TopNav).
   * 예: 마이 하위 화면의 `<FlowHeader title="내 연결" className="lg:hidden" />`
   */
  mobileHeader?: ReactNode;
  /**
   * true면 모바일에서 TopNav·BottomNav·본문 여백을 모두 빼고 화면이 직접 그립니다 (예: 1:1 채팅방).
   * PC 모양은 그대로입니다.
   */
  mobileBare?: boolean;
  /** PC 상단바 제목. 없으면 현재 메뉴 이름 (예: 마이 하위의 "연결 멤버") */
  pcTitle?: string;
}

/**
 * 메인 화면 틀 (모바일 + PC). 데이터는 받지 않고 그리기만 합니다 — 실제 화면은 MainLayout을 쓰세요.
 * - 모바일: TopNav(또는 mobileHeader) + 본문 + BottomNav
 * - PC(1024px 이상): Sidebar(왼쪽 고정) + PcTopBar + 본문
 * 본문 여백: 모바일 위 34·좌우 16·아래 52 + 하단 내비 / PC 위 64·좌우 36·아래 100, 최대 폭 1180 (Figma PC Content · Inner Content).
 */
export function AppShell({
  children,
  mobileHeader,
  mobileBare = false,
  pcTitle,
  ...sidebar
}: SidebarProps & ShellOptions & { children: ReactNode }) {
  return (
    <>
      {!mobileBare && (mobileHeader ?? <TopNav />)}
      <Sidebar {...sidebar} />
      <div className="lg:pl-sidebar">
        <PcTopBar title={pcTitle} />
        <main className={cn("lg:px-9 lg:pt-16 lg:pb-25", !mobileBare && "px-4 pt-8.5 pb-28.5")}>
          <div className="lg:mx-auto lg:max-w-295">{children}</div>
        </main>
      </div>
      {!mobileBare && <BottomNav />}
    </>
  );
}
