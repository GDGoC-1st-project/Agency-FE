import type { IconName } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/routes";

/** 주 메뉴 5개. 모바일 하단 내비와 PC 사이드바·상단바가 함께 씁니다. */
export const NAV_ITEMS: { href: string; label: string; icon: IconName; key: "members" | "recruits" | "requests" | "chats" | "my" }[] = [
  { key: "members", href: ROUTES.members, label: "멤버", icon: "members" },
  { key: "recruits", href: ROUTES.recruits, label: "모집", icon: "recruit" },
  { key: "requests", href: ROUTES.requests, label: "요청", icon: "send" },
  { key: "chats", href: ROUTES.chats, label: "채팅", icon: "chat" },
  { key: "my", href: ROUTES.my, label: "마이", icon: "my" },
];

/** /members/3 처럼 하위 경로도 그 메뉴로 봅니다. */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
