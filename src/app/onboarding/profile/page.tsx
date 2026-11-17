import type { Metadata } from "next";
import { OnboardingHeader } from "@/components/layout/OnboardingHeader";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProfileForm } from "@/components/ui/ProfileForm";

export const metadata: Metadata = { title: "프로필 작성 · 인력사무소" };

/**
 * 가입 설정 1/3.
 * - 모바일: Figma 모바일 · 마이 · 프로필 관리 (1:287)
 * - PC: Figma Dialog/Profile Setup (1:3656) 카드를 가입 설정 헤더 아래 가운데에 (PC 가입 설정 화면들과 같은 배치)
 * 입력칸은 docs/screens.md 4-1·4-3 결정을 따릅니다.
 */
export default function OnboardingProfilePage() {
  return (
    <>
      <OnboardingHeader step={1} />
      <main className="flex flex-col gap-7.5 px-4 pt-8.5 pb-13 lg:min-h-[calc(100dvh-74px)] lg:items-center lg:justify-center lg:px-9 lg:py-16">
        <PageIntro
          variant="flow"
          title="나를 소개하는 메모"
          description="나를 표현하는 핵심 정보를 간단하게 적어주세요."
          className="lg:hidden"
        />
        <ProfileForm />
      </main>
    </>
  );
}
