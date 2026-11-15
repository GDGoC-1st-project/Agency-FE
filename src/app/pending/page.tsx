import type { Metadata } from "next";
import { OnboardingHeader } from "@/components/layout/OnboardingHeader";
import { PendingCard } from "./PendingCard";

export const metadata: Metadata = { title: "가입 승인 대기 · 인력사무소" };

/** 가입 설정 3/3 — Figma 모바일 · 가입 설정 · 가입 승인 대기 (1:396), docs/screens.md 4-3의 1번 결정 */
export default function PendingPage() {
  return (
    <>
      <OnboardingHeader step={3} />
      <main className="flex min-h-[calc(100dvh-74px)] items-center px-4 py-16">
        <PendingCard />
      </main>
    </>
  );
}
