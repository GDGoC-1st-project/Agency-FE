"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { isActive, NAV_ITEMS } from "./navItems";

/**
 * Figma Navigation/Bottom (모바일): 멤버 · 모집 · 요청 · 채팅 · 마이. 1024px 이상에서는 숨고 PC 사이드바를 씁니다.
 * 화면에 고정되므로 이 내비를 쓰는 화면은 본문 아래에 여백을 둡니다 (AppShell이 처리).
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper px-1.25 pt-1.75 pb-[max(7px,env(safe-area-inset-bottom))] lg:hidden"
    >
      <ul className="flex">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11.75 flex-col items-center gap-0.75 rounded-[5px] p-1.25 text-9",
                  active ? "font-bold text-ink" : "text-muted hover:bg-hover",
                )}
              >
                {active ? (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-yellow">
                    <Icon name={item.icon} size={14} />
                  </span>
                ) : (
                  <Icon name={item.icon} />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
