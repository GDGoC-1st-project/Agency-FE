import { Logo } from "@/components/ui/Logo";

/**
 * Figma Navigation/Onboarding Header: 로고 + "가입 설정 n/3". 높이 74.
 * 조립 화면의 모바일 가입 설정 화면도 좌우 여백 72px를 그대로 씁니다.
 */
export function OnboardingHeader({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <header className="flex h-18.5 items-center justify-between border-b border-line bg-paper px-18">
      <Logo variant="onboarding" />
      <p className="text-10 font-bold tracking-step text-muted">
        가입 설정 {step}/{total}
      </p>
    </header>
  );
}
