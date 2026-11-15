"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: ROUTES.members, label: "멤버", icon: "members" },
  { href: ROUTES.recruits, label: "모집", icon: "recruit" },
  { href: ROUTES.requests, label: "요청", icon: "send" },
  { href: ROUTES.chats, label: "채팅", icon: "chat" },
  { href: ROUTES.my, label: "마이", icon: "my" },
];

/**
 * Figma Navigation/Bottom (모바일): 멤버 · 모집 · 요청 · 채팅 · 마이.
 * 현재 경로로 선택 항목을 정합니다 (/members/3 도 "멤버" 선택).
 * 화면에 고정되므로 이 내비를 쓰는 화면은 본문 아래에 `pb-20` 정도 여백을 둡니다 (MainLayout이 처리).
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper px-1.25 pt-1.75 pb-[max(7px,env(safe-area-inset-bottom))] lg:mx-auto lg:max-w-mobile"
    >
      <ul className="flex">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
