import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** Figma Chip/Filter: 멤버 분야 필터 (전체 · 개발 · AI · 디자인) */
export function FilterChip({ selected = false, type = "button", className, ...rest }: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8.5 shrink-0 items-center border px-3.25 text-11 transition-colors",
        selected ? "border-ink bg-ink text-white" : "border-line bg-paper text-muted hover:border-ink hover:bg-hover",
        className,
      )}
      {...rest}
    />
  );
}

/** Figma Tag/Keyword (모바일): 카드 안의 `#React` 같은 읽기 전용 키워드 */
export function KeywordTag({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-tag border border-ink bg-white/45 px-1.75 text-9 text-ink", className)}>
      #{name}
    </span>
  );
}

interface KeywordChipProps {
  name: string;
  /** 없으면 × 버튼을 숨깁니다 */
  onRemove?: () => void;
  className?: string;
}

const KEYWORD_CHIP = "inline-flex h-7.75 items-center gap-1 rounded-full border border-ink bg-white/58 px-2.25 text-11 text-ink";

/**
 * Figma Keyword/Chip (모바일): 키워드 편집기에서 고른 키워드 `#Python ×`.
 * onRemove가 있으면 칩 전체가 삭제 버튼입니다 (hover 시 Figma Hover 모양: 바탕 hover, 테두리 1.5px).
 */
export function KeywordChip({ name, onRemove, className }: KeywordChipProps) {
  if (!onRemove) {
    return <span className={cn(KEYWORD_CHIP, className)}>#{name}</span>;
  }
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`${name} 삭제`}
      className={cn(KEYWORD_CHIP, "transition-colors hover:bg-hover hover:outline-[0.5px] hover:outline-ink", className)}
    >
      #{name}
      <span aria-hidden>×</span>
    </button>
  );
}
