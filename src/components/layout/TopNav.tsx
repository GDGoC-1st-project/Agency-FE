import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import { ROUTES } from "@/lib/routes";

/** Figma Navigation/Top Bar (모바일): 왼쪽 로고, 오른쪽 내 아바타(마이로 이동). 높이 62. 1024px 이상에서는 PcTopBar를 씁니다. */
export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-15.5 items-center justify-between border-b border-line bg-canvas px-4.5 lg:hidden">
      <Link href={ROUTES.members} aria-label="인력사무소 홈">
        <Logo />
      </Link>
      <Link href={ROUTES.my} aria-label="마이">
        <Avatar size="md" />
      </Link>
    </header>
  );
}
