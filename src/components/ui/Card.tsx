import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export type NoteTone = "yellow" | "blue" | "pink" | "green";
const NOTE_TONES: NoteTone[] = ["yellow", "blue", "pink", "green"];

const NOTE_BG: Record<NoteTone, string> = {
  yellow: "bg-yellow-soft",
  blue: "bg-blue-soft",
  pink: "bg-pink-soft",
  green: "bg-green-soft",
};

const TAPE_BG: Record<NoteTone, string> = {
  yellow: "bg-yellow",
  blue: "bg-blue",
  pink: "bg-pink",
  green: "bg-green",
};

/** 목록에서 순서대로 노랑 → 파랑 → 분홍 → 초록 (Figma 멤버·모집 목록 순서) */
export function noteToneAt(index: number): NoteTone {
  return NOTE_TONES[index % NOTE_TONES.length];
}

/** Figma Decor/Tape: 카드 위에 붙은 마스킹 테이프 (76x24, 2도 기울기, 72% 불투명) */
export function Tape({ tone, className }: { tone: NoteTone; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute -top-2.25 left-1/2 h-6 w-19 -translate-x-1/2 rotate-2 opacity-72", TAPE_BG[tone], className)}
    />
  );
}

interface NoteCardProps {
  tone?: NoteTone;
  /** 위에 테이프를 붙일 때 테이프 색. 생략하면 테이프 없음 */
  tape?: NoteTone;
  className?: string;
  children: ReactNode;
}

/**
 * 포스트잇 모양 카드 (Figma Card/Member · Card/Recruit · Card/Management Link 등의 바탕).
 * 안쪽 여백은 카드마다 달라서 className으로 넣습니다. 예: 멤버 카드 `px-6.5 pt-8 pb-5.75`
 */
export function NoteCard({ tone = "yellow", tape, className, children }: NoteCardProps) {
  return (
    <div className={cn("relative shadow-paper", NOTE_BG[tone], className)}>
      {tape && <Tape tone={tape} />}
      {children}
    </div>
  );
}

/** 입력 양식 카드 (Figma Form/Login · 회원가입 양식): 종이 바탕, 옅은 테두리, 메모 그림자, 위 가운데 테이프 */
export function FormCard({
  tape = "blue",
  className,
  children,
}: {
  /** null이면 테이프 없음 (프로필 작성 양식) */
  tape?: NoteTone | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("relative border border-line bg-paper px-5.5 pt-7 pb-6 shadow-paper", className)}>
      {tape && <Tape tone={tape} />}
      {children}
    </div>
  );
}

/** 테두리 상자 카드 (Figma Card/Request: 종이 바탕, 옅은 테두리, 3px 진한 그림자) */
export function BoxCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("border border-line bg-paper shadow-hard-md", className)}>{children}</div>;
}

type LinkCardProps = {
  title: string;
  description: string;
  tone?: NoteTone;
} & (
  | { icon: IconName; count?: never }
  /** Card/Admin Action: 아이콘 대신 숫자 원(44px), 높이 130, 제목 22px */
  | { count: number; icon?: never }
) &
  (
    | { href: string; onClick?: never }
    /** 화면 이동 대신 동작 (예: 마이의 "로그아웃"). 링크 대신 버튼으로 그립니다 */
    | { onClick: () => void; href?: never }
  );

/**
 * Figma Card/Management Link (마이 "내 정보 관리"): 아이콘 + 제목 + 설명 + 오른쪽 화살표
 * Figma Card/Admin Action (운영 관리): `count`를 주면 아이콘 자리에 숫자 원, 더 큰 카드
 */
export function LinkCard({ href, onClick, icon, count, title, description, tone = "yellow" }: LinkCardProps) {
  const isAction = count !== undefined;
  const className = cn(
    "flex w-full items-center text-left shadow-paper transition-transform hover:-translate-y-0.5",
    isAction ? "min-h-32.5 gap-4 px-5 py-6" : "gap-3.5 p-4.5",
    NOTE_BG[tone],
  );
  const content = (
    <>
      {isAction ? (
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-ink bg-white/48 font-display text-display-2xs text-ink">
          {count}
        </span>
      ) : (
        <Icon name={icon} className="shrink-0 text-ink" />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn("font-display text-ink", isAction ? "text-display-xs" : "text-display-2xs")}>{title}</span>
        <span className="pt-0.75 text-10 text-note">{description}</span>
      </span>
      <Icon name="chevronRight" size={17} className="shrink-0 text-ink" />
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  return (
    <Link href={href!} className={className}>
      {content}
    </Link>
  );
}

/** 카드 아래쪽 "프로필 보기 >" · "자세히 보기 >" */
export function MoreLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-0.75 text-10 font-bold text-ink">
      {children}
      <Icon name="chevronRight" size={15} />
    </span>
  );
}
