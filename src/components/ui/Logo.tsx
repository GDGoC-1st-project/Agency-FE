import { cn } from "@/lib/cn";

/**
 * Figma Brand/Logo. 노란 상자 + "인력사무소" + 빨간 점.
 * - mobile: 상단 내비 (글자 17, 그림자 2px)
 * - onboarding: 가입 설정 헤더 (글자 18, 그림자 3px)
 */
export function Logo({ variant = "mobile", className }: { variant?: "mobile" | "onboarding"; className?: string }) {
  const onboarding = variant === "onboarding";
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center border border-ink bg-yellow font-display text-ink",
        onboarding ? "px-3.5 py-2 text-[18px] leading-[27px] tracking-[-0.5px] shadow-hard-md" : "px-3 py-1.75 text-logo shadow-hard-sm",
        className,
      )}
    >
      인력사무소
      <span
        aria-hidden
        className={cn(
          "absolute -top-1 left-5 size-2.25 rounded-full bg-red shadow-dot",
          onboarding ? "border-2 border-white/80" : "border border-white/80",
        )}
      />
    </span>
  );
}
