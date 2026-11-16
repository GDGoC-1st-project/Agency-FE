import type { Metadata } from "next";
import { OnboardingHeader } from "@/components/layout/OnboardingHeader";
import { Tape } from "@/components/ui/Card";
import { PageIntro } from "@/components/ui/PageIntro";
import { KeywordsForm } from "@/components/ui/KeywordsForm";

export const metadata: Metadata = { title: "키워드 등록 · 인력사무소" };

/**
 * 가입 설정 2/3.
 * - 모바일: Figma 1:383 (카드 없이 세 칸을 세로로)
 * - PC: Figma 1:604 (폭 960 카드 안에 소개 + 세 칸 가로 + 오른쪽 아래 버튼)
 * 소개 문구는 Figma가 모바일·PC에서 달라 각각 따릅니다.
 */
export default function OnboardingKeywordsPage() {
  return (
    <>
      <OnboardingHeader step={2} />
      <main className="px-4 pt-8.5 pb-13 lg:flex lg:min-h-[calc(100dvh-74px)] lg:items-center lg:justify-center lg:px-9 lg:py-16">
        <div className="relative flex flex-col gap-7.5 lg:w-240 lg:gap-8.5 lg:border lg:border-line lg:bg-paper lg:p-12 lg:shadow-hard-lg">
          <Tape tone="blue" className="hidden lg:block" />
          <PageIntro
            variant="flow"
            title="나를 설명하는 단어들"
            description="검색해서 목록에서 고르거나 Enter를 누르면 추가되고, 칩을 누르면 삭제돼요."
            className="lg:hidden"
          />
          <header className="hidden lg:block">
            <h1 className="font-display text-display-pc text-ink">나를 설명하는 키워드를 붙여주세요</h1>
            <p className="pt-2.5 text-13 text-muted">잘하는 일과 배우고 싶은 것, 관심사를 나누어 적으면 더 잘 맞는 멤버를 만날 수 있어요.</p>
          </header>
          <KeywordsForm />
        </div>
      </main>
    </>
  );
}
