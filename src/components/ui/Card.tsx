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

/** 테두리 상자 카드 (Figma Card/Request: 종이 바탕, 옅은 테두리, 3px 진한 그림자) */
export function BoxCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("border border-line bg-paper shadow-hard-md", className)}>{children}</div>;
}

interface LinkCardProps {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  tone?: NoteTone;
}

/** Figma Card/Management Link · Card/Admin Action: 아이콘 + 제목 + 설명 + 오른쪽 화살표 */
export function LinkCard({ href, icon, title, description, tone = "yellow" }: LinkCardProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-3.5 p-4.5 shadow-paper transition-transform hover:-translate-y-0.5", NOTE_BG[tone])}
    >
      <Icon name={icon} className="shrink-0 text-ink" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-display text-display-2xs text-ink">{title}</span>
        <span className="pt-0.75 text-10 text-note">{description}</span>
      </span>
      <Icon name="chevronRight" size={17} className="shrink-0 text-ink" />
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
