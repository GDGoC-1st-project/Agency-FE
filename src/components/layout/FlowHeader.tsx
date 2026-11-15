"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/Button";

interface FlowHeaderProps {
  title: string;
  /** 뒤로가기 대상. 없으면 브라우저 뒤로가기 */
  backHref?: string;
}

/** Figma Navigation/Flow Header: 뒤로가기 + 가운데 제목. 계정·마이 하위·운영 화면에서 씁니다. 높이 62 */
export function FlowHeader({ title, backHref }: FlowHeaderProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 grid h-15.5 grid-cols-[44px_1fr_44px] items-center border-b border-line bg-paper px-2.5">
      <IconButton
        icon="back"
        label="뒤로 가기"
        onClick={() => (backHref ? router.push(backHref) : router.back())}
      />
      <h1 className="truncate text-center text-15 font-bold text-ink">{title}</h1>
      <span aria-hidden />
    </header>
  );
}
