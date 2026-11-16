"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { ROUTES } from "@/lib/routes";
import { isActive, NAV_ITEMS } from "./navItems";

/**
 * Figma Navigation/Top Bar (PC): 현재 메뉴 이름 + 한 줄 설명, 오른쪽 내 아바타(마이로 이동). 높이 74.
 * 1024px 미만에서는 숨고 모바일 TopNav를 씁니다.
 */
export function PcTopBar({ preview = false, title: titleOverride }: { preview?: boolean; /** 없으면 현재 메뉴 이름 */ title?: string }) {
  const pathname = usePathname();
  const title = titleOverride ?? NAV_ITEMS.find((item) => isActive(pathname, item))?.label ?? "인력사무소";

  return (
    <header
      className={
        preview
          ? "flex h-18.5 items-center justify-between border-b border-line bg-canvas px-18"
          : "sticky top-0 z-20 hidden h-18.5 items-center justify-between border-b border-line bg-canvas px-18 lg:flex"
      }
    >
      <div>
        <p className="text-16 font-bold text-ink">{title}</p>
        <p className="pt-0.75 text-10 text-muted">좋은 멤버를 발견하는 가장 다정한 방법</p>
      </div>
      <Link href={ROUTES.my} aria-label="마이">
        <Avatar size="md" />
      </Link>
    </header>
  );
}
