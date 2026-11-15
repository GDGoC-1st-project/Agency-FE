import type { IconName } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/routes";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  key: "members" | "recruits" | "requests" | "chats" | "my";
  /** 이 메뉴로 볼 다른 경로 (예: 운영 관리는 마이에서 들어가므로 "마이") */
  also?: string[];
}

/** 주 메뉴 5개. 모바일 하단 내비와 PC 사이드바·상단바가 함께 씁니다. */
export const NAV_ITEMS: NavItem[] = [
  { key: "members", href: ROUTES.members, label: "멤버", icon: "members" },
  { key: "recruits", href: ROUTES.recruits, label: "모집", icon: "recruit" },
  { key: "requests", href: ROUTES.requests, label: "요청", icon: "send" },
  { key: "chats", href: ROUTES.chats, label: "채팅", icon: "chat" },
  { key: "my", href: ROUTES.my, label: "마이", icon: "my", also: [ROUTES.admin] },
];

const matches = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** /members/3 처럼 하위 경로도 그 메뉴로 봅니다. `also` 경로(예: /admin)도 같은 메뉴입니다. */
export function isActive(pathname: string, item: Pick<NavItem, "href" | "also">): boolean {
  return matches(pathname, item.href) || (item.also ?? []).some((href) => matches(pathname, href));
}
