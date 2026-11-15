import type { ReactNode } from "react";

/**
 * PC 디자인을 아직 만들지 않은 화면용 임시 틀: 1024px 이상에서도 모바일 폭(390px)으로 가운데 보여줍니다.
 * 그 화면의 PC 버전을 만들면 이 틀을 걷어냅니다. (docs/screens.md 4-4)
 */
export function MobileColumn({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:bg-backdrop">
      <div className="min-h-dvh bg-canvas lg:mx-auto lg:max-w-mobile lg:border-x lg:border-line">{children}</div>
    </div>
  );
}
