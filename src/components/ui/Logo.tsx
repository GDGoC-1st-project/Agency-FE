import { cn } from "@/lib/cn";

/**
 * Figma Brand/Logo. 노란 상자 + "인력사무소" + 빨간 점.
 * - mobile: 상단 내비 (글자 17, 그림자 2px)
 * - onboarding: 가입 설정 헤더 (글자 18, 그림자 3px)
 * - pc: PC 사이드바 (글자 22 + "GDGoC TEAM MATCH", 테두리 없이 1.5도 기울어진 메모)
 */
export function Logo({ variant = "mobile", className }: { variant?: "mobile" | "onboarding" | "pc"; className?: string }) {
  if (variant === "pc") {
    return (
      <span
        className={cn(
          "relative inline-flex rotate-[1.5deg] flex-col bg-yellow pt-2.5 pr-4.5 pb-3.25 pl-4 text-ink shadow-logo",
          className,
        )}
      >
        <span className="font-display text-[22px] leading-[22px] tracking-[-0.7px]">인력사무소</span>
        <span className="pt-1.5 text-[8px] leading-3 font-bold tracking-[1px]">GDGoC TEAM MATCH</span>
        <span aria-hidden className="absolute -top-1.5 left-16.25 size-3 rounded-full border-[1.2px] border-white/80 bg-red shadow-dot" />
      </span>
    );
  }
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
