import type { Metadata } from "next";
import { MobileColumn } from "@/components/layout/MobileColumn";
import { OnboardingHeader } from "@/components/layout/OnboardingHeader";
import { PendingCard } from "./PendingCard";

export const metadata: Metadata = { title: "가입 승인 대기 · 인력사무소" };

/** 가입 설정 3/3 — Figma 모바일 · 가입 설정 · 가입 승인 대기 (1:396), docs/screens.md 4-3의 1번 결정 */
/* PC 디자인은 아직 만들지 않아 1024px 이상에서도 모바일 폭으로 보여줍니다 (docs/screens.md 4-4). */
export default function PendingPage() {
  return (
    <MobileColumn>
      <OnboardingHeader step={3} />
      <main className="flex min-h-[calc(100dvh-74px)] items-center px-4 py-16">
        <PendingCard />
      </main>
    </MobileColumn>
  );
}
