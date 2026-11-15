import type { Metadata } from "next";
import { OnboardingHeader } from "@/components/layout/OnboardingHeader";
import { PageIntro } from "@/components/ui/PageIntro";
import { KeywordsForm } from "./KeywordsForm";

export const metadata: Metadata = { title: "키워드 등록 · 인력사무소" };

/** 가입 설정 2/3 — Figma 모바일 · 가입 설정 · 키워드 등록 (1:383) */
export default function OnboardingKeywordsPage() {
  return (
    <>
      <OnboardingHeader step={2} />
      <main className="flex flex-col gap-7.5 px-4 pt-8.5 pb-13">
        <PageIntro
          variant="flow"
          eyebrow="KEYWORD DESK"
          title="나를 설명하는 단어들"
          description="검색해서 목록에서 고르거나 Enter를 누르면 추가되고, 칩을 누르면 삭제돼요."
        />
        <KeywordsForm />
      </main>
    </>
  );
}
