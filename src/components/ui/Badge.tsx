import { cn } from "@/lib/cn";

/**
 * Figma Badge/Count: 분홍 원 안의 숫자 (요청 탭, 사이드바 요청 수 등).
 * 0이면 아무것도 그리지 않습니다. 99를 넘으면 "99+".
 *
 * Badge/Status("연결 가능")와 Badge/Deadline("D-4")은 docs/screens.md 4-3 결정에 따라 만들지 않습니다.
 */
export function CountBadge({ count, size = "md", className }: { count: number; size?: "sm" | "md"; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-pink px-1 font-bold text-ink",
        size === "sm" ? "h-5 min-w-5 text-9" : "h-5.25 min-w-5.25 text-11",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
