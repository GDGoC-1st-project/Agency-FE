"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { CountBadge } from "@/components/ui/Badge";
import { Tape } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";
import { isActive, NAV_ITEMS } from "./navItems";

export interface SidebarProps {
  /** 받은 요청 중 대기(PENDING) 개수. 0이면 뱃지 숨김 */
  requestCount?: number;
  /** 아래 프로필 바로가기에 보여줄 내 이름. 불러오기 전이면 null */
  userName?: string | null;
  /** true면 화면에 고정하지 않고 그 자리에 그립니다 (/dev 미리보기용) */
  preview?: boolean;
}

/**
 * Figma Navigation/Sidebar (PC, 1:979): 로고 · 주 메뉴 · 오늘의 메모 · 프로필 바로가기. 폭 248.
 * 1024px 미만에서는 숨고 모바일 하단 내비를 씁니다.
 * 프로필 바로가기의 "프로필 80%" 진행률은 docs/screens.md 4-1의 9번 결정으로 넣지 않습니다.
 */
export function Sidebar({ requestCount = 0, userName = null, preview = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-sidebar flex-col border-r border-line bg-paper px-5 pt-7 pb-5.5",
        preview ? "flex h-[720px]" : "fixed inset-y-0 left-0 z-30 hidden lg:flex",
      )}
    >
      <Link href={ROUTES.members} aria-label="인력사무소 홈" className="self-start">
        <Logo variant="pc" />
      </Link>

      <nav aria-label="주요 메뉴" className="pt-12">
        <ul className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const count = item.key === "requests" ? requestCount : 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-lg px-3.5 py-3 text-16 transition-colors",
                    active ? "rotate-[0.5deg] bg-yellow font-bold text-ink shadow-hard-md" : "text-muted hover:bg-hover",
                  )}
                >
                  <Icon name={item.icon} className={active ? "text-ink" : undefined} />
                  <span className="flex-1">{item.label}</span>
                  {count > 0 && (
                    <>
                      <CountBadge count={count} />
                      <span className="sr-only">대기 중인 요청 {count}개</span>
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-6">
        <DailyNote />
        <Link
          href={ROUTES.my}
          className="flex items-center gap-2.5 rounded-[10px] border border-line bg-white p-2.5 transition-colors hover:border-ink"
        >
          <Avatar size="sm" />
          <span className="min-w-0 flex-1 truncate text-13 font-bold text-ink">{userName ?? " "}</span>
          <Icon name="chevronRight" size={16} className="shrink-0 text-ink" />
          <span className="sr-only">마이로 이동</span>
        </Link>
      </div>
    </aside>
  );
}

/** Figma Note/Daily: 사이드바 아래 "오늘의 메모" (살짝 기울어진 하늘색 메모 + 테이프) */
function DailyNote() {
  return (
    <div className="px-2">
      <div className="relative -rotate-[1.2deg] bg-blue-faint px-4.5 pt-6.5 pb-5 shadow-paper">
        <Tape tone="blue" />
        <p className="text-10 font-bold tracking-eyebrow text-eyebrow">오늘의 메모</p>
        <p className="pt-2 text-15 leading-[23.3px] font-bold text-ink">혼자보다 함께할 때 더 멀리 갈 수 있어요.</p>
      </div>
    </div>
  );
}
