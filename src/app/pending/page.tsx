import type { Metadata } from "next";
import { OnboardingHeader } from "@/components/layout/OnboardingHeader";
import { PendingCard } from "./PendingCard";

export const metadata: Metadata = { title: "가입 승인 대기 · 인력사무소" };

/**
 * 가입 설정 3/3 — Figma 모바일 1:396, PC 1:614.
 * PC도 모바일과 같은 내용(안내 문구, "승인 상태 확인", "로그아웃")이고 "승인 전에도 둘러볼 수 있어요"는 뺍니다 (docs/screens.md 4-3의 1번).
 */
export default function PendingPage() {
  return (
    <>
      <OnboardingHeader step={3} />
      <main className="flex min-h-[calc(100dvh-74px)] items-center justify-center px-4 py-16 lg:px-9">
        <PendingCard />
      </main>
    </>
  );
}
